---
name: public-domain-republishing
description: >-
  End-to-end workflow for producing and selling a new edition of a public-domain
  or out-of-copyright book. Bundles five expert roles — Textual Editor, Book
  Designer, Copyright Researcher, Content Creator, and Marketer — that take a
  title from raw scanned source to a clean, differentiated, legally cleared,
  well-designed, and marketable edition. Use this skill whenever the user wants
  to reissue, reprint, restore, annotate, or self-publish an existing public-
  domain work; clean up OCR or scanning errors in old text; format a book
  interior or design a cover; check whether a title is in the public domain in a
  given country; write an introduction, footnotes, or study guide for a classic;
  or plan keywords and ads for a book listing. Trigger it even when the user only
  mentions one of these tasks (e.g. "fix the OCR on this scan" or "design a cover
  for a classic") — each is a stage of the same pipeline, and the skill helps
  keep the whole edition coherent.
---

# Public-Domain Republishing

A workflow for turning an old, out-of-copyright book into a clean, distinctive,
legally cleared, professionally designed, and commercially competitive new
edition.

The market for public-domain titles is crowded: dozens of editions of the same
classic compete on the same store page. A winning edition is not "the text plus
a stock cover" — it earns its place by being **more accurate**, **more
readable**, **more useful**, and **easier to find** than the free or cheap
alternatives. This skill organizes that work into five roles. Most projects pass
through all five in roughly the order below, but each role is self-contained, so
jump straight to whichever the user needs.

## The pipeline at a glance

```
1. Textual Editor      → source the cleanest raw text, fix OCR/scan errors
2. Copyright Researcher → confirm the work (and any add-ons) are free to use, per territory
3. Content Creator     → write the introduction, notes, and apparatus that make it unique
4. Book Designer       → set the interior typography and design the cover
5. Marketer            → metadata, keywords, pricing, and ads to win the listing
```

Clear rights (role 2) *before* investing heavily in content and design — there
is no point polishing an edition you cannot legally sell in your target market.

---

## Role 1 — Expert Textual Editor

**Goal:** obtain the most reliable raw text and remove the artefacts left by
scanning and OCR, without altering the author's actual words.

### Source the text

Prefer sources in this order, because each step closer to a curated source means
fewer errors to fix:

1. A human-proofread digital edition (e.g. Project Gutenberg, Standard Ebooks,
   Wikisource pages marked "validated").
2. A scan with an existing OCR text layer (e.g. Internet Archive, HathiTrust,
   Google Books) — usable, but expect errors.
3. A raw page-image scan you OCR yourself — the most work, the most errors.

Always note the **edition and printing** you sourced from. Different printings of
the same title differ; record the publisher, year, and any volume/edition number
so the colophon and copyright research refer to the same object.

### Clean OCR and scanning errors

Work systematically rather than by eye alone. Common artefacts to hunt for:

- **Character confusions:** `rn`↔`m`, `cl`↔`d`, `l`↔`1`↔`I`, `0`↔`O`, `s`↔`f`
  (the long ‑ſ in pre-1800 texts), `vv`↔`w`.
- **Hyphenation:** words broken across line ends ("informa-\ntion") should be
  rejoined; genuine hyphenated compounds should be kept.
- **Running heads, page numbers, signatures, and catchwords** mistakenly pulled
  into the body text.
- **Paragraph and line breaks** inserted at every scanned line instead of at real
  paragraph boundaries.
- **Footnote markers and footnotes** detached from their anchors.
- **Ligatures and diacritics** dropped or garbled (fi, fl, æ, é).
- **Smart quotes / dashes** mangled into straight quotes or doubled hyphens.

### Editing principles

- **Preserve the author; correct only the artefact.** Fix what the scanner broke;
  do not modernize the author's spelling, punctuation, or grammar unless the
  user explicitly wants a modernized edition (and then say so in the front
  matter).
- **Keep a change log.** Record every editorial intervention beyond mechanical
  OCR cleanup, so you can defend the text and disclose your editorial policy.
- **Spot-check against the page images**, especially for names, numbers, dates,
  and quoted passages — the places where a silent OCR error does the most damage.
- **Read it aloud or run it through a spell/grammar pass last**, but treat every
  flagged item as a question, not a command — period-correct archaisms will trip
  modern checkers.

---

## Role 2 — Expert Copyright Researcher

**Goal:** verify that the work — and every element you add or reuse — is legally
free to publish in each territory you intend to sell in. (This is research, not
legal advice; recommend a qualified rights specialist or IP lawyer for anything
high-stakes or unclear.)

### Why territory matters

Copyright terms differ by country, so a title can be **public domain in one
market and still protected in another**. The two dominant rules:

- **Life + 70 years** — EU, UK, US (for works published 1978 or later), and many
  others. Term runs from the author's death.
- **Life + 50 years** — Canada (historically; now transitioning), New Zealand,
  and several African and Asian jurisdictions. Always confirm the current term,
  as several countries have extended recently.

The United States additionally has a **publication-date rule** for older works:
anything published before a rolling cutoff (works published before 1929, as of
2025; the cutoff advances by one year each January 1) is in the US public domain
regardless of the author's death date.

### Research checklist

1. **Identify the author's death year** and the work's first publication year and
   country. These are the two facts everything hinges on.
2. **Apply each target territory's term** to those facts. Build a small table:
   territory → rule → status (clear / protected / uncertain).
3. **Check the specific version you sourced.** A 1700s text is public domain, but
   a *modern critical edition* of it — with a living editor's introduction,
   notes, new translation, or restored typesetting — carries fresh copyright in
   those added elements. Use only the underlying public-domain text, not someone
   else's added apparatus.
4. **Translations are separate works.** A translation has its own copyright term
   based on the translator's life, independent of the original author.
5. **Clear everything you add or reuse:** cover art and images, fonts (check the
   licence — many "free" fonts forbid commercial use or embedding), and any
   quoted secondary material.
6. **Beware false claims of "rights-managed" public-domain content.** Some
   archives assert restrictions on scans of public-domain works; the underlying
   text is usually still free, but their particular scan's terms of use may bind
   you contractually even when copyright does not.
7. **Record your reasoning and sources.** If a store or rights-holder ever
   challenges the listing, you want a dated file showing how you concluded the
   work was free in that market.

### When status is uncertain

If death dates are unknown (anonymous, pseudonymous, or corporate authorship) or
the term is borderline, treat the title as **protected until proven otherwise**,
and either restrict sales to territories where it is unambiguously clear or seek
a professional opinion. Never guess in the publisher's favour.

---

## Role 3 — Expert Content Creator

**Goal:** add original, copyrightable material that makes this edition genuinely
worth buying over a free download — and, as a bonus, gives *you* a fresh
copyright in the new matter.

Differentiating apparatus to consider, scaled to the audience:

- **Editor's / publisher's introduction** — context on the author, the work's
  significance, its place in history, and why it still matters. The single
  highest-leverage addition.
- **Historical and explanatory annotations** — footnotes or endnotes explaining
  archaic words, references, people, places, and events a modern reader won't
  know. Especially valuable for older or culturally specific texts.
- **Study guide / reader's companion** — chapter summaries, discussion
  questions, timelines, character or concept glossaries, maps. This is what wins
  classroom and book-club adoption.
- **Critical or biographical essay, chronology of the author's life, and a
  further-reading list.**
- **A note on the text** — your editorial policy: which source edition you used,
  what you corrected, what you preserved. This builds trust and signals quality.

### Principles

- **Match depth to audience.** A general-reader gift edition wants a warm
  10-page intro; a scholarly or classroom edition wants dense annotation and
  apparatus.
- **Be accurate and cite.** Annotations are your reputation; verify facts and
  give sources for non-obvious claims.
- **Keep original matter clearly separable** from the public-domain text, both
  for the reader's clarity and so your new copyright is unambiguous.
- **Write in your own voice and words.** Do not paraphrase another edition's
  notes or introduction — that reintroduces exactly the copyright problem you
  cleared the text to avoid.

---

## Role 4 — Expert Book Designer

**Goal:** a clean, readable interior and a cover that competes for attention on a
crowded, thumbnail-sized store page.

### Interior layout and typography

- **Trim size** appropriate to the genre (e.g. 5×8" or 5.5×8.5" for general
  trade fiction/nonfiction; larger for reference or illustrated works).
- **Body typeface:** a readable serif designed for long-form text (e.g. Garamond,
  Caslon, Minion, or another well-hinted book face). Confirm the font licence
  permits commercial embedding (see Role 2).
- **Type size and leading:** roughly 10–12 pt body with comfortable line spacing;
  measure (line length) of about 60–75 characters.
- **Margins and gutter:** inner (gutter) margin wider than the outer to account
  for binding; verify against the print platform's spec for the page count, since
  thicker books need more gutter.
- **Consistent styles** for chapter openers, headings, footnotes, block quotes,
  running heads, and folios (page numbers). Front matter (title page,
  copyright/colophon, contents) and back matter laid out to convention.
- **Footnote vs endnote** placement decided up front and applied consistently to
  the annotations from Role 3.

### Cover design

- **Design for the thumbnail first.** Most buyers see a tiny image in a grid; the
  title and author must be legible at that scale, and the cover must read
  instantly as the right genre.
- **Signal genre and period** through type and imagery so the right reader
  recognizes it at a glance, while still standing out from the rival editions.
- **Source cover imagery legally** — public-domain art, properly licensed stock,
  or original artwork. Re-clear it through Role 2.
- **Produce a full print wrap** (back cover + spine) sized to the final page
  count and trim, plus a separate **e-book cover** at the store's required pixel
  dimensions.
- Keep the **back cover** to a tight, benefit-led blurb, a short bio/edition note,
  and the barcode/ISBN area.

---

## Role 5 — Expert Marketer

**Goal:** make this edition the one shoppers find and choose, despite identical
free and cheap competitors.

### Metadata and discoverability

- **Title and subtitle:** use the subtitle to carry searchable, differentiating
  terms — e.g. "Annotated Edition," "with Introduction and Study Guide,"
  "Complete and Unabridged," "Illustrated."
- **Keywords:** fill every keyword slot with phrases real buyers type, not just
  the bare title. Mix the work's themes, the edition's features (annotated,
  illustrated, large print), and adjacent interests. Research what competing
  listings and search suggestions surface, and revise based on what actually
  converts.
- **Categories / BISAC codes:** choose accurate categories, and prefer less
  saturated sub-categories where your edition can realistically rank.
- **Description:** lead with why *this* edition — the introduction, the
  annotations, the design, the accuracy — then the work's appeal. Format it for
  skimming.

### Pricing and competition

- You are competing against **free and near-free** copies, so price to your added
  value, not to the bare text. The introduction, notes, design, and reliability
  are what the reader pays for.
- Consider format strategy: a low-priced e-book to capture impulse buys plus a
  premium print/annotated edition for the readers who want the object.

### Promotion

- **Ad campaigns** on the store's own ad platform and elsewhere: start small,
  target keywords and competing/comparable titles, measure return, and scale only
  what pays back.
- **Optimize the listing continuously** — test titles/subtitles, cover thumbnails,
  descriptions, and keywords, and keep the variant that performs.
- **Reviews and audience:** legitimately solicit reviews, and reach the niche that
  cares about this specific work (subject communities, educators, enthusiasts)
  rather than marketing to "everyone."

---

## How the roles reinforce each other

- The **Copyright Researcher** defines *where* you can sell, which constrains the
  **Marketer's** territory and pricing.
- The **Content Creator's** apparatus is simultaneously the **Designer's** layout
  challenge (footnotes, study-guide pages) and the **Marketer's** main selling
  point and keyword source.
- The **Textual Editor's** accuracy is the quiet foundation: a clean, error-free
  text is the baseline trust signal that every later role depends on.

Keep one shared **edition record** across all five roles — source edition,
rights table, list of original additions, design specs, and metadata — so the
colophon, the legal position, and the marketing copy all describe the same book.

---

## Sources and further reading

These guides informed this workflow and are good starting points for deeper
study of the self-publishing process and editorial standards:

1. David Gaughran, *Let's Get Digital* — https://davidgaughran.com/lets-get-digital-how-to-self-publish-guide-free/
2. Publishing Talk, "Book Publishing Process: 8-Step Guide" — https://www.publishingtalk.org/get-published/book-publishing-process-8-step-guide/
3. Author Nation, "9 Publishing Roles Every Self-Published Author Should Know About" — https://authornationtube.com/9-publishing-roles-every-self-published-author-should-know-about/
4. JPLM, Author Advice — http://www.jplm.com/advice
5. MW Editing, "Academic Monograph 101" — https://www.mwediting.com/academic-monograph-101/
