# Republishing — project README

A one-command-per-book operation for producing and selling new, differentiated
editions of neglected public-domain works — anchored on African history and
Yoruba/Kemetic texts. This README is the map: what everything is, how a book
moves through the system, and where the machine stops and you take over.

---

## Quick start (first book)

```bash
cd ~/republishing
chmod +x pipeline.sh new-title.sh
./pipeline.sh history-of-the-yorubas
```

That runs the whole mechanical stretch for the first title — scaffold the folder,
download the 1921 source text, clean the OCR — then stops and prints what needs
your eyes. Review with:

```bash
less history-of-the-yorubas/text/changes.diff   # every change the machine made
less history-of-the-yorubas/text/report.md       # flagged spots to proofread
```

---

## Folder layout

```
republishing/
├── README.md                         ← you are here
├── SKILL.md                          the five-role playbook (the method)
├── republishing-project-90-day-plan.md   strategy: niche, titles, money model
├── production-loop-runbook.md        the six gates + definition of done
├── new-title.sh                      scaffolds a book folder + rights file
├── pipeline.sh                       one-command orchestrator per book
├── Makefile                          run all / status across the catalog
├── tools/
│   └── ocr_cleanup.py                automated scan/OCR cleanup
├── titles/
│   └── history-of-the-yorubas.conf   6-line config per book
└── history-of-the-yorubas/           generated per book (tree below)
    ├── README.md                     that book's gate checklist
    ├── rights/                       proof of public-domain status
    ├── source/                       raw downloaded text
    ├── text/                         cleaned text + diff + report
    ├── apparatus/                    your introduction, glossary, notes
    ├── design/                       interior + cover
    ├── build/                        final print PDF + EPUB
    └── listing/                      title, keywords, description
```

---

## What each file is for

**The method (reference — how to think):**
- `SKILL.md` — the master playbook. Defines the five expert roles every book
  passes through. Plugs into Claude's skill system so the workflow is repeatable.
- `republishing-project-90-day-plan.md` — the strategy: which niche, which titles
  first, pricing/royalty reality, and the rights traps to avoid.
- `production-loop-runbook.md` — the operating manual: the six gates and the
  exact "done" test for each.

**The machine (tools — how to do):**
- `tools/ocr_cleanup.py` — applies safe mechanical fixes to the scanned text and
  flags risky OCR confusions for human review (never auto-changes them).
- `new-title.sh` — creates a book's folder tree, gate checklist, and pre-filled
  rights file in one command.
- `pipeline.sh` — chains scaffold → download → clean into a single command.
- `titles/*.conf` — a tiny config per book. Add one, and that book is onboarded.
- `Makefile` — `make all` runs every configured title; `make status` shows where
  each one is in the pipeline.

---

## The five roles, mapped to the gates

The roles in `SKILL.md` are five "hats." Each is worn at one stage. Two have
automated tooling; three are judgment/creative work.

| Role | Gate | Where it shows up | Produces |
|---|---|---|---|
| **Copyright Researcher** | 1 — Rights | `new-title.sh` auto-fills `rights/rights.md`; catches reprint/territory traps | Confirmed public-domain status |
| **Textual Editor** | 2 — Clean text | `tools/ocr_cleanup.py` (mechanical) + your proofing of the flags | Accurate, clean text |
| **Content Creator** | 3 — Apparatus | Co-written with Claude; no tool | Introduction, glossary, chronology, note-on-text |
| **Book Designer** | 4 — Design | Reusable interior template + cover | Print PDF + EPUB |
| **Marketer** | 5–6 — List & optimize | KDP listing + small ad campaigns | Findable, competitive listing |

As a book moves left-to-right through the gates, you put on the matching hat.
`SKILL.md` holds the standards, steps, and traps for each stage.

---

## What's automated vs. what's you

**Automated (one command):** scaffolding, downloading the source, cleaning the
OCR, producing the review diff + report, and the rights math.

**Yours — by design or by rule:**
- Proofreading the flagged text (a wrong silent "fix" to a name is worse than a
  flag you resolve by hand).
- Writing the introduction and glossary — the product itself, and what keeps the
  edition from reading as a junk AI reprint.
- Designing the interior and cover.
- Uploading, pricing, and publishing on KDP — this stays manual on purpose.

The machine deletes the tedium so your time goes only to the parts that make the
books worth buying.

---

## Onboarding the next book (the loop)

1. Copy `titles/history-of-the-yorubas.conf` to `titles/<new-slug>.conf` and edit
   the six values (title, author, death year, pub year, source URL, header).
2. Run `./pipeline.sh <new-slug>`.
3. Proof the text, write the apparatus, design, and publish.
4. After each book: a 15-minute retro — script whatever was still manual, so the
   next book is cheaper. That declining cost per title is the whole business.

Keep 2–3 books in flight at once (one "ahead" in design/listing, one "behind" in
cleanup). Reinvest early royalties into the next titles rather than drawing income
for the first several months.

---

## Deeper reading
- Method and standards → `SKILL.md`
- Strategy, titles, money → `republishing-project-90-day-plan.md`
- Gates and done-tests → `production-loop-runbook.md`
