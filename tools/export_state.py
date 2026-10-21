#!/usr/bin/env python3
"""
export_state.py — Scans the republishing repository and exports a comprehensive
JSON snapshot + static cover/build assets for the Next.js dashboard.
"""

from __future__ import annotations

import datetime
import json
import os
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TITLES_DIR = ROOT / "titles"
DASHBOARD_DIR = ROOT / "dashboard"
PUBLIC_DIR = DASHBOARD_DIR / "public"
DATA_DIR = DASHBOARD_DIR / "src" / "data"


def parse_conf(conf_path: Path) -> dict[str, str]:
    data: dict[str, str] = {}
    for raw_line in conf_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            key, val = line.split("=", 1)
            val = val.strip()
            if (val.startswith('"') and val.endswith('"')) or (
                val.startswith("'") and val.endswith("'")
            ):
                val = val[1:-1]
            data[key.strip()] = val
    return data


def parse_readme_gates(readme_path: Path) -> list[dict]:
    if not readme_path.exists():
        return []
    gates: list[dict] = []
    current_gate = None
    for raw_line in readme_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        m_gate = re.match(r"^##\s+(Gate\s+\d+)\s+[—-]\s+(.+)$", line)
        if m_gate:
            current_gate = {
                "id": m_gate.group(1),
                "title": m_gate.group(2).strip(),
                "items": [],
                "completed": 0,
                "total": 0,
            }
            gates.append(current_gate)
            continue
        if current_gate is not None:
            m_item = re.match(r"^-\s+\[([ xX])\]\s+(.+)$", line)
            if m_item:
                done = m_item.group(1).lower() == "x"
                current_gate["items"].append(
                    {"label": m_item.group(2).strip(), "done": done}
                )
                current_gate["total"] += 1
                if done:
                    current_gate["completed"] += 1
    return gates


def parse_ocr_report(report_path: Path) -> dict:
    if not report_path.exists():
        return {
            "exists": False,
            "input_lines": 0,
            "output_lines": 0,
            "auto_changes": 0,
            "flagged_count": 0,
            "protected_skipped": 0,
            "stages": [],
            "flag_groups": [],
        }
    text = report_path.read_text(encoding="utf-8")
    input_lines = 0
    output_lines = 0
    auto_changes = 0
    flagged_count = 0
    protected_skipped = 0

    for line in text.splitlines():
        if m := re.match(r"^-\s+Input lines:\s+(\d+)", line):
            input_lines = int(m.group(1))
        elif m := re.match(r"^-\s+Output lines:\s+(\d+)", line):
            output_lines = int(m.group(1))
        elif m := re.match(r"^-\s+Auto changes:\s+(\d+)", line):
            auto_changes = int(m.group(1))
        elif m := re.match(r"^-\s+Flagged for review:\s+(\d+)", line):
            flagged_count = int(m.group(1))
        elif m := re.match(r"^-\s+Skipped via --protect-file.*:\s+(\d+)", line):
            protected_skipped = int(m.group(1))

    stages = []
    for m in re.finditer(
        r"^\|\s*([a-zA-Z0-9_-]+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|$",
        text,
        re.MULTILINE,
    ):
        stage_name = m.group(1)
        if stage_name.lower() != "stage":
            stages.append(
                {
                    "stage": stage_name,
                    "auto": int(m.group(2)),
                    "flagged": int(m.group(3)),
                }
            )

    flag_groups = []
    current_group = None
    for line in text.splitlines():
        if m := re.match(r"^###\s+(.+?)\s+\((\d+)\)\s*$", line):
            current_group = {
                "category": m.group(1).strip(),
                "count": int(m.group(2)),
                "samples": [],
            }
            flag_groups.append(current_group)
        elif current_group is not None and line.startswith("- L"):
            if len(current_group["samples"]) < 12:
                current_group["samples"].append(line[2:].strip())

    return {
        "exists": True,
        "input_lines": input_lines,
        "output_lines": output_lines,
        "auto_changes": auto_changes,
        "flagged_count": flagged_count,
        "protected_skipped": protected_skipped,
        "stages": stages,
        "flag_groups": flag_groups,
    }


def parse_apparatus(app_dir: Path) -> list[dict]:
    if not app_dir.exists():
        return []
    files = sorted(app_dir.glob("*.md"))
    results = []
    for f in files:
        content = f.read_text(encoding="utf-8").strip()
        words = len(re.findall(r"\S+", content))
        is_template = (
            "[Write the introduction here" in content
            or "[Define term]" in content
            or words < 60
        )
        title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
        title = title_match.group(1).strip() if title_match else f.stem
        results.append(
            {
                "filename": f.name,
                "title": title,
                "word_count": words,
                "is_complete": not is_template,
                "content": content,
            }
        )
    return results


def parse_listing(listing_path: Path) -> dict:
    if not listing_path.exists():
        return {
            "exists": False,
            "is_complete": False,
            "title": "",
            "subtitle": "",
            "series": "",
            "description_html": "",
            "keywords": [],
            "categories": [],
            "pricing": [],
            "raw": "",
        }
    raw = listing_path.read_text(encoding="utf-8").strip()
    is_template = "[Book Title]" in raw or "[Keyword 1]" in raw

    sections: dict[str, str] = {}
    current_sec = None
    buf: list[str] = []
    for line in raw.splitlines():
        if line.startswith("## "):
            if current_sec:
                sections[current_sec] = "\n".join(buf).strip()
            current_sec = line[3:].strip().lower()
            buf = []
        elif current_sec is not None:
            buf.append(line)
    if current_sec:
        sections[current_sec] = "\n".join(buf).strip()

    def find_sec(prefix: str) -> str:
        for k, v in sections.items():
            if k.startswith(prefix):
                return v
        return ""

    keywords = []
    for line in find_sec("backend").splitlines():
        m = re.match(r"^\d+\.\s*(.+)$", line.strip())
        if m:
            keywords.append(m.group(1).strip())

    categories = []
    for line in find_sec("bisac").splitlines():
        m = re.match(r"^(?:-\s*|\d+\.\s*)(.+)$", line.strip())
        if m:
            categories.append(m.group(1).strip())

    pricing = []
    for line in find_sec("pricing").splitlines():
        m = re.match(r"^-\s*(.+)$", line.strip())
        if m:
            pricing.append(m.group(1).strip())

    return {
        "exists": True,
        "is_complete": not is_template,
        "title": find_sec("book title"),
        "subtitle": find_sec("subtitle"),
        "series": find_sec("series"),
        "description_html": find_sec("description"),
        "keywords": keywords,
        "categories": categories,
        "pricing": pricing,
        "raw": raw,
    }


def format_size(num_bytes: int) -> str:
    if num_bytes >= 1024 * 1024:
        return f"{num_bytes / (1024 * 1024):.1f} MB"
    return f"{round(num_bytes / 1024)} KB"


def main() -> None:
    COVERS_OUT = PUBLIC_DIR / "covers"
    DOWNLOADS_OUT = PUBLIC_DIR / "downloads"
    COVERS_OUT.mkdir(parents=True, exist_ok=True)
    DOWNLOADS_OUT.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    year_now = datetime.date.today().year
    titles_data = []

    for conf_file in sorted(TITLES_DIR.glob("*.conf")):
        slug = conf_file.stem
        conf = parse_conf(conf_file)
        book_dir = ROOT / slug

        title = conf.get("TITLE", slug)
        author = conf.get("AUTHOR", "Unknown")
        death = int(conf.get("DEATH", "0") or 0)
        pub = int(conf.get("PUB", "0") or 0)
        source_url = conf.get("SOURCE_URL", "")
        pd_intl_year = death + 70

        us_pd = pub < 1929
        intl_pd = pd_intl_year < year_now

        readme_gates = parse_readme_gates(book_dir / "README.md")
        ocr_report = parse_ocr_report(book_dir / "text" / "report.md")
        apparatus = parse_apparatus(book_dir / "apparatus")
        listing = parse_listing(book_dir / "listing" / "kdp-metadata.md")

        clean_txt = book_dir / "text" / "clean.txt"
        clean_words = 0
        if clean_txt.exists():
            clean_words = len(
                re.findall(r"\S+", clean_txt.read_text(encoding="utf-8", errors="ignore"))
            )

        epub_path = book_dir / "build" / f"{slug}.epub"
        pdf_path = book_dir / "build" / f"{slug}.pdf"
        cover_jpg = book_dir / "design" / "cover" / "cover.jpg"
        cover_wm_jpg = book_dir / "design" / "cover" / "cover_watermark.jpg"

        cover_url = None
        cover_wm_url = None
        if cover_jpg.exists():
            shutil.copy2(cover_jpg, COVERS_OUT / f"{slug}.jpg")
            cover_url = f"/covers/{slug}.jpg"
        if cover_wm_jpg.exists():
            shutil.copy2(cover_wm_jpg, COVERS_OUT / f"{slug}-watermark.jpg")
            cover_wm_url = f"/covers/{slug}-watermark.jpg"

        epub_url = None
        pdf_url = None
        if epub_path.exists():
            shutil.copy2(epub_path, DOWNLOADS_OUT / f"{slug}.epub")
            epub_url = f"/downloads/{slug}.epub"
        if pdf_path.exists():
            shutil.copy2(pdf_path, DOWNLOADS_OUT / f"{slug}.pdf")
            pdf_url = f"/downloads/{slug}.pdf"

        apparatus_complete = len(apparatus) > 0 and all(
            a["is_complete"] for a in apparatus
        )
        build_complete = epub_path.exists() and pdf_path.exists()

        # Determine automated pipeline stage
        if build_complete and listing["is_complete"] and apparatus_complete:
            current_stage = "Gate 5 — Ready for KDP Upload"
            stage_Number = 5
        elif build_complete:
            current_stage = "Gate 4 — Built (EPUB & PDF)"
            stage_Number = 4
        elif apparatus_complete:
            current_stage = "Gate 3 — Apparatus Complete"
            stage_Number = 3
        elif clean_txt.exists():
            current_stage = "Gate 2 — Cleaned (Proofing)"
            stage_Number = 2
        else:
            current_stage = "Gate 1 — Rights & Sourcing"
            stage_Number = 1

        # Calculate proofreading readiness status
        if ocr_report["flagged_count"] == 0 and clean_txt.exists():
            proof_status = "Clean (0 OCR Flags)"
            proof_level = "high"
        elif ocr_report["flagged_count"] <= 50 and clean_txt.exists():
            proof_status = f"Light Review ({ocr_report['flagged_count']} Flags)"
            proof_level = "medium"
        else:
            proof_status = f"Needs Proofing ({ocr_report['flagged_count']} Flags)"
            proof_level = "low"

        titles_data.append(
            {
                "slug": slug,
                "title": title,
                "author": author,
                "death_year": death,
                "pub_year": pub,
                "pd_intl_year": pd_intl_year,
                "us_pd": us_pd,
                "intl_pd": intl_pd,
                "worldwide_clear": us_pd and intl_pd,
                "source_url": source_url,
                "current_stage": current_stage,
                "stage_number": stage_Number,
                "proof_status": proof_status,
                "proof_level": proof_level,
                "clean_word_count": clean_words,
                "estimated_pages": max(1, round(clean_words / 275)),
                "ocr": ocr_report,
                "apparatus": apparatus,
                "apparatus_word_count": sum(a["word_count"] for a in apparatus),
                "apparatus_complete": apparatus_complete,
                "listing": listing,
                "build": {
                    "epub_exists": epub_path.exists(),
                    "epub_size": format_size(epub_path.stat().st_size)
                    if epub_path.exists()
                    else None,
                    "epub_url": epub_url,
                    "pdf_exists": pdf_path.exists(),
                    "pdf_size": format_size(pdf_path.stat().st_size)
                    if pdf_path.exists()
                    else None,
                    "pdf_url": pdf_url,
                    "cover_url": cover_url,
                    "cover_watermark_url": cover_wm_url,
                },
                "gates": readme_gates,
            }
        )

    payload = {
        "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "total_titles": len(titles_data),
        "built_titles": sum(
            1
            for t in titles_data
            if t["build"]["epub_exists"] and t["build"]["pdf_exists"]
        ),
        "total_words_cleaned": sum(t["clean_word_count"] for t in titles_data),
        "total_apparatus_words": sum(t["apparatus_word_count"] for t in titles_data),
        "total_ocr_auto_fixes": sum(t["ocr"]["auto_changes"] for t in titles_data),
        "total_ocr_flags_remaining": sum(
            t["ocr"]["flagged_count"] for t in titles_data
        ),
        "titles": titles_data,
    }

    out_json = json.dumps(payload, indent=2, ensure_ascii=False)
    (DATA_DIR / "catalog.json").write_text(out_json, encoding="utf-8")
    (PUBLIC_DIR / "catalog.json").write_text(out_json, encoding="utf-8")
    print(f"==> Exported catalog state for {len(titles_data)} titles -> dashboard/src/data/catalog.json")


if __name__ == "__main__":
    main()
