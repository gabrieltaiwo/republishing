#!/usr/bin/env bash
#
# new-title.sh — scaffold a new republishing title folder.
#
# Creates the standard folder tree, a gate-by-gate README checklist, and a
# pre-filled rights file, so every title in the catalog looks identical and
# Gate 2 is one command away. Optionally downloads a full-text source.
#
# Usage:
#   ./new-title.sh <slug> "<Title>" "<Author>" <death_year> <pub_year> [source_txt_url]
#
# Example (History of the Yorubas):
#   ./new-title.sh history-of-the-yorubas \
#     "The History of the Yorubas" "Samuel Johnson" 1901 1921 \
#     "https://archive.org/download/historyofyorubas00john/historyofyorubas00john_djvu.txt"

set -euo pipefail

if [ "$#" -lt 5 ]; then
  echo "Usage: $0 <slug> \"<Title>\" \"<Author>\" <death_year> <pub_year> [source_txt_url]" >&2
  exit 1
fi

SLUG="$1"; TITLE="$2"; AUTHOR="$3"; DEATH="$4"; PUB="$5"; SRC="${6:-}"
YEAR_NOW="$(date +%Y)"
PD_INTL=$(( DEATH + 70 ))

if [ -e "$SLUG" ]; then
  echo "Refusing to overwrite existing folder: $SLUG" >&2
  exit 1
fi

mkdir -p "$SLUG"/{rights,source,text,apparatus,design/cover,build,listing}

# ---- README: the gate checklist (mirrors the runbook) --------------------- #
cat > "$SLUG/README.md" <<EOF
# $TITLE — production card

Author: $AUTHOR (d. $DEATH) · First published: $PUB · Slug: \`$SLUG\`

Move through the gates in order. A gate is done only when every box is ticked.

## Gate 1 — Rights cleared
- [ ] Author death year + first-publication year recorded (see rights/rights.md)
- [ ] Public domain under US (pre-1929) AND life+70
- [ ] Territories decided
- [ ] Sourcing the ORIGINAL work, not a modern reprint's apparatus
- [ ] Proof saved in rights/

## Gate 2 — Text clean
- [ ] Cleanest source obtained into source/
- [ ] Ran ocr_cleanup.py → text/clean.txt (+ diff + report)
- [ ] Reviewed changes.diff before accepting
- [ ] Worked through every flag in report.md
- [ ] Proofed names/dates/numbers against page images
- [ ] change-log noted

## Gate 3 — Apparatus written (this is the product)
- [ ] Original introduction (your voice)
- [ ] Glossary / annotations / chronology as warranted
- [ ] "Note on the text" (source edition + editorial policy)
- [ ] Differentiation is substantive
- [ ] AI-disclosure status decided per element

## Gate 4 — Designed
- [ ] Interior in the standard template
- [ ] Cover legible at thumbnail size
- [ ] Print wrap sized to page count; ebook cover at spec
- [ ] build/ has valid print PDF + EPUB

## Gate 5 — Listed & published
- [ ] Title carries differentiator (e.g. [Annotated]); subtitle carries keywords
- [ ] Description leads with WHY THIS EDITION; categories + keywords set
- [ ] "Public domain work" selected; AI-generated content disclosed if any
- [ ] Paperback + Kindle live; rights proof archived

## Gate 6 — Optimized & reinvested
- [ ] KDP Ads live (small budget)
- [ ] Listing iterated once on early data
- [ ] Earnings earmarked to next title
- [ ] Retro done → tooling improved
EOF

# ---- rights.md: pre-filled from the arguments ----------------------------- #
cat > "$SLUG/rights/rights.md" <<EOF
# Rights file — $TITLE

- Author: $AUTHOR
- Author death year: $DEATH
- First publication year: $PUB

## Public-domain reasoning
- United States (pre-1929 publication rule): $( [ "$PUB" -lt 1929 ] && echo "CLEAR — published $PUB, before the 1929 cutoff." || echo "CHECK — published $PUB is not before 1929; verify via 95-years-from-publication." )
- Life + 70 (international): expires end of $PD_INTL → $( [ "$PD_INTL" -lt "$YEAR_NOW" ] && echo "CLEAR worldwide as of $YEAR_NOW." || echo "NOT yet clear in life+70 territories; restrict sales." )
- Territories to sell: __________ (default worldwide if both rules clear)

## Proof to attach in this folder
- [ ] Screenshot: author death date
- [ ] Screenshot: title page showing publication year $PUB
- [ ] Note the exact source edition/scan used (identifier + library)

## Guardrails
- Use the ORIGINAL $PUB edition text only — NOT a modern reprint (a living
  editor's introduction, notes, or new typesetting carry fresh copyright).
EOF

# ---- optional source download --------------------------------------------- #
if [ -n "$SRC" ]; then
  echo "Downloading source text..."
  if command -v curl >/dev/null 2>&1; then
    curl -fSL "$SRC" -o "$SLUG/source/raw.txt" && echo "Saved -> $SLUG/source/raw.txt"
  elif command -v wget >/dev/null 2>&1; then
    wget -O "$SLUG/source/raw.txt" "$SRC" && echo "Saved -> $SLUG/source/raw.txt"
  else
    echo "No curl/wget found — download $SRC manually into $SLUG/source/raw.txt" >&2
  fi
fi

echo
echo "Scaffolded: $SLUG/"
echo "Next (Gate 2), from the repo root:"
echo
echo "  python3 tools/ocr_cleanup.py $SLUG/source/raw.txt \\"
echo "    --out $SLUG/text/clean.txt --diff $SLUG/text/changes.diff \\"
echo "    --report $SLUG/text/report.md --reflow --strip-detected-headers"
echo
