# Public-Domain Republishing — 90-Day Launch Project

**Goal of these 90 days:** stand up a repeatable production line and ship your
first **2–3 differentiated editions** in a niche where you have an unfair
advantage, so that at day 90 you have a live, compliant, revenue-capable catalog
and a clear decision on whether to scale.

**What this is not:** a get-rich plan. This is the foundation-laying phase of a
*catalog/backlist* business. The first titles are assets, not paychecks. Steady
income comes later, from volume + backlist + reinvestment. Treat months 1–3 as
building the machine and proving it works end-to-end on real titles.

---

## 1. The model in one paragraph

You publish **differentiated editions** of public-domain works — original
introductions, historical annotations, study guides, maps, or 10+ original
illustrations — because (a) Amazon requires differentiation when a free version
exists, and (b) that added value is the only thing a buyer will pay for when the
raw text is free. Public-domain ebooks are capped at the **35% royalty tier** on
KDP, so you do *not* compete at $0.99; you price to your added value ($6.99–$14.99
range for richly annotated editions) and lean on **paperback/hardcover
print-on-demand** (no inventory, better margins, and the Kindle differentiation
restriction is lighter on print). You build a *catalog* in one tight niche, then
reinvest early earnings into more titles until the monthly total is meaningful.

---

## 2. Your niche and positioning

**Niche:** foundational, neglected, public-domain texts of African history and
pre-imperial / suppressed spiritual traditions — with **Yoruba and West African
history as the anchor sub-segment** and **Kemetic / early-Gnostic texts as a
secondary line.**

**Why this is your moat:**
- *Underserved + passionate audience.* Diaspora readers, students, cultural and
  spiritual communities actively want these texts and recommend good editions.
- *Almost no quality competition.* Most existing editions are ugly OCR dumps or
  don't exist at all — the opposite of the thousand-edition *Pride and Prejudice*
  problem.
- *You bring real subject authority.* Your introductions and annotations will be
  genuinely informed, not generic filler — which is exactly the differentiation
  Amazon requires and buyers reward.
- *Low cost base + dev skills* mean you can tool the production line cheaply and
  out-produce hobbyists.

**Positioning line to keep on every listing:** *"The definitive modern, annotated
edition — restored text, scholarly introduction, and reader's apparatus."*

---

## 3. Candidate titles (rights pre-checked)

Rights status below reflects the Copyright Researcher pass. **US** uses the
pre-1929 publication rule; **life+70** is the international term (author death +
70 years). All flagged titles are clear on *both*, but always re-verify the
specific scan you source and never reuse a modern edition's added apparatus.

### Tier 1 — flagship candidates (start here)

| Title | Author (death) | First pub. | Rights status | Differentiation angle |
|---|---|---|---|---|
| **The History of the Yorubas** | Samuel Johnson (1901) | 1921 | **Clear** — US pre-1929; life+70 expired 1971 | Modern intro on Johnson & Oyo; glossary of Yoruba terms/names; king-list chronology; cleaned map |
| **The Yoruba-Speaking Peoples of the Slave Coast of West Africa** | A. B. Ellis (1894) | 1894 | **Clear** | Annotations contextualizing colonial-era ethnography critically; glossary |
| **The Kebra Nagast (The Queen of Sheba and Her Only Son Menyelek)** | trans. E. A. Wallis Budge (1934) | 1922 | **Clear** — pre-1929; translator life+70 expired 2004 | Intro on Ethiopian Orthodox tradition; notes; lineage diagrams |

### Tier 2 — Kemetic / Gnostic secondary line

| Title | Author/Translator (death) | First pub. | Rights status | Notes |
|---|---|---|---|---|
| The Egyptian Book of the Dead (Papyrus of Ani) | E. A. Wallis Budge (1934) | 1895 | **Clear** | Heavily reissued — differentiate hard with original commentary |
| The Gods of the Egyptians | E. A. Wallis Budge (1934) | 1904 | **Clear** | Strong illustration angle |
| Pistis Sophia | trans. G. R. S. Mead (1933) | 1896 | **Clear** — translator life+70 expired 2003 | Gnostic; niche but devoted audience |
| The Voice of Africa | Leo Frobenius (1938) | 1913 (Eng.) | **Clear** in US (pre-1929); confirm Eng. translation | Ife/Yoruba ethnography |

### Do NOT publish (rights traps to avoid)

- **The Nag Hammadi library** — discovered 1945; *every* translation is modern
  and under copyright. Your interest here can't be served via reprint. Skip it.
- **Carter G. Woodson, *The Mis-Education of the Negro* (1933)** — not US public
  domain until **2029** (95 years from publication). Revisit later.
- **Any "critical edition"** of a Tier 1/2 title — the underlying text is free,
  but a living editor's introduction, notes, or new translation are protected.
  Source the *original* scan, not someone's modern reissue.

> **Action:** keep a dated rights file (PDF screenshots of author death dates +
> publication pages) for each title you publish. If KDP ever asks for proof, you
> want it ready.

---

## 4. Production line (leverage your dev skills)

This is your edge over hobbyists. Build it once, reuse it per title.

**Sourcing layer**
- Pull cleanest available source: prefer Wikisource/Standard Ebooks (proofread) →
  Internet Archive / HathiTrust scans (have OCR text layer) → raw page images
  last. (Johnson's *History* is on Internet Archive with an ABBYY OCR layer.)

**OCR cleanup layer (scriptable)**
- Build a small text-cleaning pipeline (Python) that handles the mechanical
  artefacts: rejoin hyphenated line-breaks, strip running heads / page numbers /
  catchwords, normalize quotes/dashes/ligatures, and flag common OCR confusions
  (`rn`↔`m`, `cl`↔`d`, `l`↔`1`↔`I`, `0`↔`O`, long-ſ). Output a diff for human
  review — never auto-accept.
- Optional AI-assist pass for spotting garbled passages, but **you do the final
  editorial calls.** Note the AI-disclosure rule below.

**Formatting layer**
- Template the interior once (trim size, body serif, margins/gutter, chapter
  openers, footnote style, front/back matter) so every title flows into the same
  template. A reusable converter (Markdown/HTML → print PDF + EPUB) pays for
  itself by title #3.

**Asset layer**
- Cover template system (thumbnail-first, genre-signaling); reusable back-cover
  and spine layout sized to page count.

**Tracking layer**
- The rights & pipeline tracker (section 8) — your single source of truth across
  all titles.

> **AI-disclosure compliance:** KDP requires you to *declare AI-generated* text,
> images, or translations (even if you edit them afterward). AI-*assisted* work
> you don't need to declare. So: if AI drafts an introduction you then rewrite in
> your own voice and judgment, that's assisted. If AI writes annotations
> wholesale, that's generated and must be disclosed. Keep your apparatus
> genuinely yours — it's also better differentiation.

---

## 5. Phase plan

### Phase 1 — Days 1–30: Foundation + first title edited

- **Lock the niche & flagship.** Commit to *The History of the Yorubas* as title
  #1. It's your strongest fit: clear rights, real demand, deep personal
  authority, and no quality competition.
- **Open the rights file** for title #1 (and draft entries for titles #2–3).
- **Source the cleanest scan** and extract the text layer.
- **Build the OCR-cleanup pipeline** and run it; begin human proofing against the
  page images (prioritize names, dates, the king-lists, and the map).
- **Build the interior template** once.
- **Decide formats:** launch as **paperback (POD) + Kindle ebook**; consider a
  premium hardcover later.
- *Milestone (Day 30):* title #1 text is clean and proofed; tooling and template
  exist and are reusable.

### Phase 2 — Days 31–60: First title shipped + second sourced

- **Content Creator pass on title #1:** write the original introduction (Johnson,
  Oyo, why the work matters, your editorial note), a Yoruba terms/names glossary,
  a chronology of the Alaafins, and clean up the map. *This is the product.*
- **Design pass:** finalize interior in the template; design the cover
  (thumbnail-first, signals serious African-history edition).
- **Build the listing:** title as *The History of the Yorubas [Annotated]*,
  subtitle carrying searchable terms, description that leads with *why this
  edition*, accurate categories, full keyword set. Select "public domain work"
  in KDP setup and disclose any AI-generated elements.
- **Publish title #1.** (Get a confirmation/approval before anything irreversible
  if you're unsure about a step.)
- **Start title #2** (Ellis *Yoruba-Speaking Peoples* or *Kebra Nagast*): source +
  begin cleanup using the now-built pipeline — much faster the second time.
- *Milestone (Day 60):* title #1 live and compliant; title #2 in production.

### Phase 3 — Days 61–90: Catalog of 2–3 + marketing + scale decision

- **Ship title #2**, and title #3 if the pipeline is humming.
- **Marketer pass:** set up KDP Ads (small budget, target keywords + comparable
  titles, measure, scale only what pays back). Iterate the title #1 listing
  (subtitle/keywords/cover thumbnail) based on early data.
- **Seed the direct channel:** because your niche has a *community*, start a
  simple landing page + email capture so you can sell direct (full margin) and
  build repeat buyers. Your dev background makes this cheap to stand up.
- **Reinvest** first royalties into titles #4–5.
- *Milestone (Day 90):* 2–3 live differentiated editions; a working production
  line; first ad data; an email list seed; and a go/no-go decision on scaling to
  a 20–30 title catalog.

---

## 6. Realistic financial model

Numbers are illustrative and niche-dependent — treat as planning ranges, not
promises. Public-domain ebooks earn the **35% royalty**; print earns on the
margin above print cost.

- *Per title, once it finds its audience:* roughly **$30–150/month** (wide
  range; premium annotated editions in a devoted niche can sit higher; many
  titles sit lower).
- *One title* = a hobby. *Three titles* (end of this project) = proof of model.
  ***20–30 titles*** = a real, compounding monthly stream that keeps paying while
  you build the next ones.
- *Reinvestment loop:* roll early royalties into the next batch for the first
  ~6–12 months rather than drawing income. The work is front-loaded; the income
  is back-loaded and durable.
- *Margin lever:* every sale you move to your **direct channel** keeps the full
  price instead of 35%.

**Honest expectation:** this won't replace dev income quickly, and months 1–3 are
mostly unpaid building. But in *your* niche, a couple of disciplined years of
catalog-building could become both meaningful recurring income and a body of work
that genuinely doesn't exist today.

---

## 7. Risks & guardrails

- **KDP account safety is paramount.** Publishing undifferentiated text, or text
  that's freely available and not clearly value-added, risks rejection or account
  termination. *Always* ship real differentiation and keep proof of public-domain
  status. One careless title isn't worth the account.
- **Differentiation must be substantive** — new fonts, spacing, a linked TOC, or
  a lightly reworded intro do **not** qualify. Original annotations, 10+ original
  illustrations, or a new translation do.
- **Per-territory rights.** A title clear in the US/your markets may not be clear
  everywhere; if you sell worldwide, confirm or restrict territories. (Your Tier-1
  picks are clear on life+70 globally.)
- **This is research, not legal advice.** For any high-value or borderline title,
  get a qualified IP opinion before investing.
- **Don't over-build tooling before shipping.** Build the minimum pipeline that
  gets title #1 out, then improve it with each title. Shipping beats polishing.

---

## 8. Rights & pipeline tracker (copy-paste into a sheet)

Maintain one row per title. This is your Copyright Researcher + project dashboard
in one.

| Title | Author | Author death | First pub. | Source URL | US PD? | Life+70 PD? | Territories cleared | Differentiation | Stage | Format(s) | Price | Status/Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| The History of the Yorubas | Samuel Johnson | 1901 | 1921 | archive.org/details/historyofyorubas00john | Yes | Yes (1971) | Worldwide | Intro + glossary + chronology + map | Editing | PB + Kindle | TBD | Flagship |
| The Yoruba-Speaking Peoples… | A. B. Ellis | 1894 | 1894 | (source) | Yes | Yes | Worldwide | Critical annotations + glossary | Sourcing | PB + Kindle | TBD | Title #2 candidate |
| The Kebra Nagast | trans. Budge | 1934 | 1922 | (source) | Yes | Yes (2004) | Worldwide | Intro + notes + diagrams | Backlog | PB + Kindle | TBD | Ethiopian line |

*Stages:* Backlog → Rights-checked → Sourcing → Editing → Content → Design →
Listing → **Live** → Optimizing.

---

## 9. Definition of done (Day 90)

- [ ] Niche locked; rights file maintained for every title touched.
- [ ] Reusable OCR-cleanup pipeline + interior/cover templates built.
- [ ] **2–3 differentiated editions live** and KDP-compliant (with AI disclosure
      where applicable).
- [ ] First KDP Ads data captured; flagship listing iterated once.
- [ ] Direct-sales landing page + email capture live.
- [ ] A documented go/no-go decision on scaling to a 20–30 title catalog.

---

*Rights checks in this plan are research, not legal advice. Re-verify the
specific source edition for each title, and consult an IP professional for any
high-stakes or borderline case.*
