#!/usr/bin/env python3
"""
ocr_cleanup.py — a reviewable OCR/scan cleanup pipeline for public-domain reprints.

Philosophy
----------
Two classes of change, kept strictly separate:

  * AUTO  — mechanically safe fixes applied to the text (dehyphenation, ligature
            expansion, long-s, whitespace, page numbers, dash/quote normalization,
            optional paragraph reflow). Every one is logged.
  * FLAG  — likely OCR confusions (digit-in-word, "vv" for "w", stray pipes, lone
            "l", running-head candidates). These are NEVER changed automatically.
            They are reported with line + context so a human decides.

Outputs: cleaned text, a unified diff (raw -> cleaned) to review before accepting,
and a Markdown change report (auto counts + every flagged item).

Runs on the Python standard library only. Import the functions to embed in your
own pipeline, or use the CLI.

    python ocr_cleanup.py raw.txt --out clean.txt --diff changes.diff --report report.md
    python ocr_cleanup.py raw.txt --reflow --curl-quotes --strip-detected-headers
    python ocr_cleanup.py --demo        # run on a built-in sample, print everything
"""

from __future__ import annotations

import argparse
import difflib
import re
import sys
import unicodedata
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path

# --------------------------------------------------------------------------- #
# Change tracking
# --------------------------------------------------------------------------- #


@dataclass
class Change:
    stage: str          # which pass produced it
    kind: str           # "auto" or "flag"
    line: int           # 1-based line number in the *pre-pass* text
    before: str
    after: str          # "" for flags (nothing changed)
    note: str = ""


@dataclass
class ChangeLog:
    records: list[Change] = field(default_factory=list)

    def auto(self, stage, line, before, after, note=""):
        self.records.append(Change(stage, "auto", line, before, after, note))

    def flag(self, stage, line, snippet, note=""):
        self.records.append(Change(stage, "flag", line, snippet, "", note))

    def counts(self) -> Counter:
        return Counter((r.stage, r.kind) for r in self.records)


# --------------------------------------------------------------------------- #
# Constants
# --------------------------------------------------------------------------- #

LIGATURES = {
    "\ufb00": "ff", "\ufb01": "fi", "\ufb02": "fl",
    "\ufb03": "ffi", "\ufb04": "ffl", "\ufb05": "ft", "\ufb06": "st",
}
LONG_S = {"\u017f": "s"}  # ſ -> s

# Whitespace variants that should collapse to a normal space.
ODD_SPACES = "\u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000"

ROMAN_OR_ARABIC = re.compile(r"^[\divxlcdmIVXLCDM]{1,7}$")
ORDINAL = re.compile(r"^\d+(st|nd|rd|th)$", re.IGNORECASE)
WORD = re.compile(r"\b[\w'\u2019-]+\b", re.UNICODE)


def _context(line_text: str, span: tuple[int, int], width: int = 32) -> str:
    a, b = span
    left = line_text[max(0, a - width):a]
    hit = line_text[a:b]
    right = line_text[b:b + width]
    return f"...{left}[{hit}]{right}...".replace("\n", " ")


# --------------------------------------------------------------------------- #
# Structural passes
# --------------------------------------------------------------------------- #


def strip_page_numbers(text: str, log: ChangeLog) -> str:
    """Drop standalone lines that are only a page number (arabic or roman)."""
    out = []
    for i, ln in enumerate(text.split("\n"), 1):
        s = ln.strip()
        if s and len(s) <= 7 and ROMAN_OR_ARABIC.match(s):
            log.auto("page-numbers", i, ln, "", "removed page-number line")
            continue
        out.append(ln)
    return "\n".join(out)


def handle_running_heads(text: str, log: ChangeLog, configured: list[str],
                         strip_detected: bool, min_repeats: int = 4) -> str:
    """
    Configured header/footer regexes are stripped (auto).
    Frequently-repeated short lines are detected and either stripped
    (--strip-detected-headers) or flagged as candidates.
    """
    lines = text.split("\n")
    patterns = [re.compile(p) for p in configured]

    # detect repeated short alphabetic lines as header candidates
    freq = Counter(
        ln.strip() for ln in lines
        if 0 < len(ln.strip()) <= 50 and re.search(r"[A-Za-z]", ln)
    )
    candidates = {s for s, n in freq.items() if n >= min_repeats}

    out = []
    for i, ln in enumerate(lines, 1):
        s = ln.strip()
        if any(p.search(ln) for p in patterns):
            log.auto("running-heads", i, ln, "", "matched configured header pattern")
            continue
        if s in candidates:
            if strip_detected:
                log.auto("running-heads", i, ln, "", f"removed repeated line (x{freq[s]})")
                continue
            log.flag("running-heads", i, ln, f"repeated {freq[s]}x — running head?")
        out.append(ln)
    return "\n".join(out)


# --------------------------------------------------------------------------- #
# Word-joining passes
# --------------------------------------------------------------------------- #


def dehyphenate(text: str, log: ChangeLog) -> str:
    """
    Join words split by an end-of-line hyphen.
      'informa-\ntion' -> 'information'   (auto, when next line starts lowercase)
      'Anglo-\nSaxon'  -> flagged, left as-is (uppercase next: may be a real compound)
    """
    lines = text.split("\n")
    out: list[str] = []
    i = 0
    while i < len(lines):
        cur = lines[i]
        m = re.search(r"(\w)-\s*$", cur)
        if m and i + 1 < len(lines):
            nxt = lines[i + 1]
            nm = re.match(r"\s*(\w+)", nxt)
            if nm:
                head = nm.group(1)
                if head[:1].islower():
                    left = cur[: m.start() + 1]  # keep char before hyphen
                    joined = left + head
                    rest = nxt[nm.end():]
                    lines[i + 1] = joined + rest
                    log.auto("dehyphenate", i + 1,
                             cur.strip() + " / " + nxt.strip(), joined,
                             "joined soft-hyphen break")
                    i += 1
                    continue
                else:
                    log.flag("dehyphenate", i + 1,
                             cur.strip() + " | " + nxt.strip(),
                             "line-end hyphen before capital — real compound?")
        out.append(cur)
        i += 1
    return "\n".join(out)


def reflow_paragraphs(text: str, log: ChangeLog) -> str:
    """
    Conservatively merge lines wrapped mid-sentence into single paragraph lines.
    Blank lines are paragraph separators and are preserved. A line join happens
    only when the current line does NOT end in sentence punctuation and the next
    line starts lowercase — a strong signal it's a wrapped continuation.
    """
    lines = text.split("\n")
    out: list[str] = []
    buf = ""
    joins = 0
    for ln in lines:
        s = ln.rstrip()
        if s.strip() == "":
            if buf:
                out.append(buf)
                buf = ""
            out.append("")
            continue
        if buf == "":
            buf = s.strip()
            continue
        prev_ok = not re.search(r"[.?!:;\"\u201d\u2019)]$", buf)
        next_low = s.lstrip()[:1].islower()
        if prev_ok and next_low:
            buf = buf + " " + s.strip()
            joins += 1
        else:
            out.append(buf)
            buf = s.strip()
    if buf:
        out.append(buf)
    if joins:
        log.auto("reflow", 0, f"{joins} wrapped lines", "merged into paragraphs",
                 "conservative reflow (end-punct + lowercase-start heuristic)")
    return "\n".join(out)


# --------------------------------------------------------------------------- #
# Character normalization passes
# --------------------------------------------------------------------------- #


def normalize_chars(text: str, log: ChangeLog) -> str:
    """Ligatures, long-s, odd spaces, doubled hyphens -> em dash, trailing ws."""
    lines = text.split("\n")
    out = []
    for i, ln in enumerate(lines, 1):
        orig = ln
        new = ln

        for lig, rep in LIGATURES.items():
            if lig in new:
                new = new.replace(lig, rep)
        for ls, rep in LONG_S.items():
            if ls in new:
                new = new.replace(ls, rep)

        new = new.translate({ord(c): " " for c in ODD_SPACES})
        new = re.sub(r"(?<=\w)\s?-{2,}\s?(?=\w)", "\u2014", new)   # -- -> em dash
        new = re.sub(r"[ \t]{2,}", " ", new)
        new = new.rstrip()

        if new != orig:
            log.auto("normalize", i, orig.strip(), new.strip(), "char/space normalization")
        out.append(new)
    return "\n".join(out)


def curl_quotes(text: str, log: ChangeLog) -> str:
    """Convert straight quotes to typographic quotes (opening vs closing by context)."""
    lines = text.split("\n")
    out = []
    for i, ln in enumerate(lines, 1):
        orig = ln
        chars = list(ln)
        for j, ch in enumerate(chars):
            prev = chars[j - 1] if j > 0 else " "
            if ch == '"':
                chars[j] = "\u201c" if prev in " \t([{\u2014-" or j == 0 else "\u201d"
            elif ch == "'":
                nxt = chars[j + 1] if j + 1 < len(chars) else " "
                if prev.isalpha() and nxt.isalpha():
                    chars[j] = "\u2019"                      # apostrophe: don't -> don’t
                else:
                    chars[j] = "\u2018" if prev in " \t([{\u2014-" or j == 0 else "\u2019"
        new = "".join(chars)
        if new != orig:
            log.auto("quotes", i, orig.strip(), new.strip(), "curled quotes")
        out.append(new)
    return "\n".join(out)


# --------------------------------------------------------------------------- #
# Confusion detection (FLAG ONLY — never auto-changed)
# --------------------------------------------------------------------------- #


def flag_confusions(text: str, log: ChangeLog) -> None:
    """High-precision patterns that usually indicate an OCR error. Report only."""
    for i, ln in enumerate(text.split("\n"), 1):
        for m in WORD.finditer(ln):
            tok = m.group(0)
            has_alpha = any(c.isalpha() for c in tok)
            has_digit = any(c.isdigit() for c in tok)
            if has_alpha and has_digit and not ORDINAL.match(tok):
                log.flag("confusion", i, _context(ln, m.span()),
                         f"digit inside word: {tok!r} (0/1/5<->O/l/S?)")
        for m in re.finditer(r"vv", ln):
            log.flag("confusion", i, _context(ln, m.span()), "'vv' — likely 'w'")
        for m in re.finditer(r"\|", ln):
            log.flag("confusion", i, _context(ln, m.span()), "pipe '|' — likely 'I' or 'l'")
        for m in re.finditer(r"\bl\b", ln):
            log.flag("confusion", i, _context(ln, m.span()), "lone 'l' — likely 'I' or '1'")
        for m in re.finditer(r"\brn\b", ln):
            log.flag("confusion", i, _context(ln, m.span()), "'rn' as a word — likely 'm'")


# --------------------------------------------------------------------------- #
# Orchestration
# --------------------------------------------------------------------------- #


@dataclass
class Options:
    reflow: bool = False
    curl_quotes: bool = False
    strip_detected_headers: bool = False
    header_patterns: list[str] = field(default_factory=list)


def run_pipeline(raw: str, opts: Options) -> tuple[str, ChangeLog]:
    log = ChangeLog()
    text = raw.replace("\r\n", "\n").replace("\r", "\n")
    text = unicodedata.normalize("NFC", text)

    text = strip_page_numbers(text, log)
    text = handle_running_heads(text, log, opts.header_patterns,
                                opts.strip_detected_headers)
    text = dehyphenate(text, log)
    if opts.reflow:
        text = reflow_paragraphs(text, log)
    text = normalize_chars(text, log)
    if opts.curl_quotes:
        text = curl_quotes(text, log)

    flag_confusions(text, log)   # inspect the cleaned text, change nothing
    return text, log


# --------------------------------------------------------------------------- #
# Reporting
# --------------------------------------------------------------------------- #


def make_report(log: ChangeLog, raw: str, cleaned: str, sample_cap: int = 40) -> str:
    counts = log.counts()
    stages = ["page-numbers", "running-heads", "dehyphenate", "reflow",
              "normalize", "quotes", "confusion"]

    lines = ["# OCR cleanup report", ""]
    lines.append(f"- Input lines: {len(raw.splitlines())}")
    lines.append(f"- Output lines: {len(cleaned.splitlines())}")
    lines.append(f"- Auto changes: {sum(v for (s, k), v in counts.items() if k == 'auto')}")
    lines.append(f"- Flagged for review: {sum(v for (s, k), v in counts.items() if k == 'flag')}")
    lines.append("")
    lines.append("| Stage | Auto | Flagged |")
    lines.append("|---|---|---|")
    for st in stages:
        a = counts.get((st, "auto"), 0)
        f = counts.get((st, "flag"), 0)
        if a or f:
            lines.append(f"| {st} | {a} | {f} |")
    lines.append("")

    flags = [r for r in log.records if r.kind == "flag"]
    if flags:
        lines.append("## Flagged for human review")
        lines.append("*Nothing below was changed — decide each yourself.*")
        lines.append("")
        by_note: dict[str, list[Change]] = {}
        for r in flags:
            key = r.note.split(":")[0].split("(")[0].strip()
            by_note.setdefault(key, []).append(r)
        for key, items in by_note.items():
            lines.append(f"### {key}  ({len(items)})")
            for r in items[:sample_cap]:
                lines.append(f"- L{r.line}: `{r.before}`")
            if len(items) > sample_cap:
                lines.append(f"- …and {len(items) - sample_cap} more")
            lines.append("")

    auto = [r for r in log.records if r.kind == "auto" and r.stage != "reflow"]
    if auto:
        lines.append("## Auto changes (sample)")
        for r in auto[:sample_cap]:
            lines.append(f"- [{r.stage}] L{r.line}: `{r.before}` → `{r.after}`")
        if len(auto) > sample_cap:
            lines.append(f"- …and {len(auto) - sample_cap} more (see the diff)")
        lines.append("")
    return "\n".join(lines)


def make_diff(raw: str, cleaned: str) -> str:
    return "".join(difflib.unified_diff(
        raw.splitlines(keepends=True),
        cleaned.splitlines(keepends=True),
        fromfile="raw", tofile="cleaned",
    ))


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #

DEMO = (
    "THE HISTORY OF THE YORUBAS\n"
    "12\n"
    "The Yoruba people are said to have origina-\n"
    "ted from the east, accord1ng to tradition. The\n"
    "old capital was a place of grﬁeat renown, and\n"
    "the ſacred groves vvere guarded with care.\n"
    "A treaty was signed -- the first of its kind --\n"
    "between the two towns.\n"
    "THE HISTORY OF THE YORUBAS\n"
    "13\n"
    'He said, "We shall not yield," and the Anglo-\n'
    "Saxon envoys withdrew from the l council.\n"
)


def main(argv=None):
    p = argparse.ArgumentParser(description="Reviewable OCR/scan cleanup for reprints.")
    p.add_argument("input", nargs="?", help="raw OCR text file")
    p.add_argument("--out", help="write cleaned text here")
    p.add_argument("--diff", help="write unified diff (raw -> cleaned) here")
    p.add_argument("--report", help="write Markdown change report here")
    p.add_argument("--reflow", action="store_true", help="merge mid-sentence wrapped lines")
    p.add_argument("--curl-quotes", action="store_true", help="straight quotes -> typographic")
    p.add_argument("--strip-detected-headers", action="store_true",
                   help="remove auto-detected repeated header lines (else just flag)")
    p.add_argument("--header-pattern", action="append", default=[],
                   help="regex for a header/footer to strip (repeatable)")
    p.add_argument("--demo", action="store_true", help="run on built-in sample")
    args = p.parse_args(argv)

    if args.demo:
        raw = DEMO
    elif args.input:
        raw = Path(args.input).read_text(encoding="utf-8", errors="replace")
    else:
        p.error("provide an input file or use --demo")

    opts = Options(
        reflow=args.reflow,
        curl_quotes=args.curl_quotes,
        strip_detected_headers=args.strip_detected_headers,
        header_patterns=args.header_pattern,
    )
    cleaned, log = run_pipeline(raw, opts)
    report = make_report(log, raw, cleaned)
    diff = make_diff(raw, cleaned)

    if args.out:
        Path(args.out).write_text(cleaned, encoding="utf-8")
    if args.diff:
        Path(args.diff).write_text(diff, encoding="utf-8")
    if args.report:
        Path(args.report).write_text(report, encoding="utf-8")

    if args.demo or not (args.out or args.diff or args.report):
        print("=" * 70, "\nCLEANED TEXT\n", "=" * 70, sep="")
        print(cleaned)
        print("=" * 70, "\nREPORT\n", "=" * 70, sep="")
        print(report)
        print("=" * 70, "\nDIFF\n", "=" * 70, sep="")
        print(diff)


if __name__ == "__main__":
    main()
