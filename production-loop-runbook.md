# Production Loop — Runbook

How to run one title from start to finish, repeatably, so each cycle is cheaper
than the last. Two loops nested:

- **Inner loop** — the 6 stages one title passes through (rights → clean →
  apparatus → design → publish → optimize).
- **Outer loop** — you always have several titles at different stages, so the
  line never idles, and each finished title funds and triggers the next.

---

## 1. Set up the system (one-time, ~1 day)

**A board.** Columns = the 6 stages plus `Backlog` and `Live`. Use GitHub
Projects (fits your workflow), Notion, or Trello. Each title is one card that
moves left→right. Card = single source of truth for that title.

**A repo (or folder) per title,** from a template so every title looks the same:

```
title-name/
  rights/          proof of PD (author-death + pub-page screenshots), territory table
  source/          raw scan text + page images
  text/            cleaned text, change-log.md
  apparatus/       intro.md, annotations.md, glossary.md, chronology.md
  design/          interior.(md/html), cover/ (print-wrap + ebook)
  build/           generated print PDF + EPUB
  listing/         title, subtitle, description, keywords, categories, KVP flags
  README.md        the card mirror: stage, blockers, checklist state
```

**Issue/checklist templates** — one per stage, holding that stage's gate
(section 3). New title = clone template repo + create 6 stage issues.

**WIP limit: 2–3 titles in flight.** More than that and everything stalls
half-done. One title should be "ahead" (in design/listing) while the next is
"behind" (in cleanup) — that's the outer loop working.

---

## 2. Run the inner loop (per title)

Move a card into a stage, do the work, run the gate, then advance. Never advance
on a failed gate — fix or send it back. The stages map 1:1 to the diagram.

1. **Clear rights** → 2. **Source & clean text** → 3. **Write apparatus** →
4. **Design** → 5. **List & publish** → 6. **Optimize & reinvest** → *(loop)*.

---

## 3. The gates (definition of done per stage)

A stage is done only when *every* box is checked. This is the quality-and-safety
backbone.

**Gate 1 — Rights cleared**
- [ ] Author/translator death year and first-publication year recorded with sources.
- [ ] Public domain confirmed under both US (pre-1929) and life+70.
- [ ] Territories decided (worldwide, or restricted list).
- [ ] Sourcing the *original* work, not a modern critical edition's apparatus.
- [ ] Proof screenshots saved in `rights/`.

**Gate 2 — Text clean**
- [ ] Cleanest available source obtained (proofread > OCR'd scan > raw images).
- [ ] Mechanical artefacts fixed: hyphenation, running heads, page numbers,
      quotes/dashes/ligatures, common OCR confusions.
- [ ] Proofed against page images — names, dates, numbers, quoted passages.
- [ ] `change-log.md` records every non-mechanical edit.

**Gate 3 — Apparatus written**
- [ ] Original introduction drafted in your own voice.
- [ ] Annotations / glossary / chronology as the title warrants.
- [ ] A "note on the text" (source edition + editorial policy).
- [ ] Differentiation is substantive (not fonts/spacing/linked TOC).
- [ ] AI-disclosure status decided per element (generated vs assisted).

**Gate 4 — Designed**
- [ ] Interior flowed into the standard template (trim, margins/gutter, styles).
- [ ] Cover reads at thumbnail size and signals the genre.
- [ ] Print wrap (back + spine) sized to final page count; ebook cover at spec.
- [ ] Build produces a valid print PDF + EPUB.

**Gate 5 — Listed & published**
- [ ] Title carries the differentiator, e.g. `[Annotated]`; subtitle carries
      searchable terms.
- [ ] Description leads with *why this edition*; categories + full keyword set.
- [ ] "Public domain work" selected; AI-generated content disclosed if any.
- [ ] Formats live (paperback POD + Kindle; hardcover optional).
- [ ] Rights proof archived in case KDP asks.

**Gate 6 — Optimized & reinvested**
- [ ] KDP Ads live (small budget, keyword + comparable-title targeting).
- [ ] Listing iterated once on early data (subtitle / keywords / cover thumb).
- [ ] Earnings earmarked toward the next title.
- [ ] Retro done (section 5).

---

## 4. Operating rhythm (what makes the loop actually turn)

A loop only turns if you touch it on a schedule. Suggested cadence around your
dev work:

- **Daily (30–90 min):** advance the single most-blocking card one gate.
- **Weekly review (30 min):** move cards on the board, confirm one title is
  "ahead" and one "behind," unblock anything stuck, refill the backlog so it
  never empties.
- **Per finished title:** run the retro, then immediately pull the next title
  from backlog into Gate 1. *This is the return arrow.*

---

## 5. The retro — why each cycle gets cheaper

After every title, spend 15 minutes: what in stages 2–4 was manual that could be
templated or scripted next time? Fold the answer back into your tooling and
templates. Title #1 is slow because you're building the machine; by title #5 the
OCR pipeline, interior template, cover system, and listing checklist do most of
the work, and your time per title drops sharply. That declining cost curve is the
whole economic case — protect it by always improving the line, not just feeding
it.

---

## 6. Minimum viable first cycle

Don't build the whole system before shipping. For title #1 (*History of the
Yorubas*): make the board, clone one title folder, and run the 6 gates once
end-to-end with the *simplest possible* tooling. Ship it. Then let the retro tell
you what to automate. Shipping one real title beats a perfect pipeline with
nothing on the shelf.
