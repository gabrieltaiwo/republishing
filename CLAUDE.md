# Project: Public-domain republishing

## Goal
Produce clean, differentiated editions of public-domain books. Anchor title:
"The History of the Yorubas" (Samuel Johnson, 1921). Slug: history-of-the-yorubas.

## The system
- SKILL.md — the five-role method.
- production-loop-runbook.md — the six gates and the "done" test for each.
- pipeline.sh <slug> — scaffold, download, and OCR cleanup in one command.
- tools/ocr_cleanup.py — mechanical scan cleanup; flags risky words; never
  auto-changes them.
- titles/<slug>.conf — one config per book.

## Status
Gate 2 ran on history-of-the-yorubas. Result: 13571 auto changes, 403 flags
(11 hyphen-before-capital, 392 confusion). Down from 460 after adding
--protect-file (tools/yoruba-terms.txt) — 57 flags auto-skipped as
already-known Yoruba names/places/titles, 0 text changed.

## Current task — reduce review noise, then help proof
1. Add a protected-terms feature to tools/ocr_cleanup.py:
   - New flag: --protect-file PATH. Load a word list (one term per line, # for
     comments). During confusion detection, skip any token that matches a
     protected term (case-insensitive, ignore diacritics when comparing).
2. Create tools/yoruba-terms.txt with common Yoruba names, titles, and places
   (e.g. Alaafin, Oyo, Oduduwa, Ilorin, Ife, Ibadan, Modakeke, Ijaye, Egba,
   Ijebu, Ekiti, Abeokuta). Extend it from the flagged names in the report.
3. Re-run the cleanup on history-of-the-yorubas with --protect-file, so the
   flag count drops. Show the before/after flag counts.

## What stays manual (do NOT automate or perform these)
- Proofread the flagged text (Gate 2).
- Edit any drafts into the author's own words (Gate 3).
- Upload, price, and publish on KDP. NEVER publish or upload to KDP.
- NEVER send project files to any website or third party.

## Rules for you (Claude Code)
- Show each command before you run it. Wait for approval.
- Build and format only. Do not publish. Do not send files anywhere.
- Never auto-accept OCR changes to doubtful words. Flag them.
