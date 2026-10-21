"use client";

import React, { useRef, useState } from "react";
import catalogData from "../data/catalog.json";
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  X,
  Layers,
  Eye,
  Search,
  Terminal,
} from "lucide-react";

type CatalogType = typeof catalogData;
type BookItem = CatalogType["titles"][number];

export default function DashboardPage() {
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [activeTab, setActiveTab] = useState<
    "gates" | "ocr" | "apparatus" | "listing" | "covers"
  >("gates");
  const [coverVariant, setCoverVariant] = useState<"centered" | "watermark">(
    "centered"
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [filterProof, setFilterProof] = useState<string>("all");
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const openBookModal = (
    book: BookItem,
    defaultTab: "gates" | "ocr" | "apparatus" | "listing" | "covers" = "gates"
  ) => {
    setSelectedBook(book);
    setActiveTab(defaultTab);
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  };

  const closeBookModal = () => {
    if (dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close();
    }
    setSelectedBook(null);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredTitles = catalogData.titles.filter((t) => {
    if (filterProof === "all") return true;
    return t.proof_level === filterProof;
  });

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Top Editorial Header */}
      <header className="border-b border-[#e5dfd5] bg-[#fdfbf8] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-stone-900 text-amber-50 font-serif-editorial font-bold text-lg">
                R
              </span>
              <h1 className="text-xl sm:text-2xl font-serif-editorial font-bold tracking-tight text-stone-900">
                Public-Domain Republishing Factory
              </h1>
              <span className="text-xs font-medium uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-900/10 text-amber-900 border border-amber-900/20">
                Catalog Command Center
              </span>
            </div>
            <p className="text-sm text-stone-600 mt-1">
              Foundational West African &amp; Historical Editions · 6-Gate
              Production Pipeline
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-600 bg-stone-100 px-3.5 py-2 rounded-lg border border-stone-200">
            <Terminal className="w-4 h-4 text-amber-800 shrink-0" />
            <span>
              Sync command:{" "}
              <code className="font-mono text-stone-900 font-semibold">
                python3 tools/export_state.py
              </code>
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Metric Strip */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#e5dfd5] shadow-2xs">
            <div className="text-xs font-medium uppercase tracking-wider text-stone-500">
              Active Catalog
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-serif-editorial font-bold text-stone-900">
                {catalogData.total_titles}
              </span>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                {catalogData.built_titles} Built (EPUB+PDF)
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#e5dfd5] shadow-2xs">
            <div className="text-xs font-medium uppercase tracking-wider text-stone-500">
              Total Words Restored
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-serif-editorial font-bold text-stone-900">
                {(catalogData.total_words_cleaned / 1000).toFixed(1)}k
              </span>
              <span className="text-xs text-stone-500">Primary text</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#e5dfd5] shadow-2xs">
            <div className="text-xs font-medium uppercase tracking-wider text-stone-500">
              Mechanical OCR Fixes
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-serif-editorial font-bold text-stone-900">
                {catalogData.total_ocr_auto_fixes.toLocaleString("en-US")}
              </span>
              <span className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-medium">
                Auto-cleaned
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#e5dfd5] shadow-2xs">
            <div className="text-xs font-medium uppercase tracking-wider text-stone-500">
              Pending Proof Flags
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-serif-editorial font-bold text-amber-700">
                {catalogData.total_ocr_flags_remaining}
              </span>
              <span className="text-xs text-stone-500">Human Gate 2</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#e5dfd5] shadow-2xs col-span-2 lg:col-span-1">
            <div className="text-xs font-medium uppercase tracking-wider text-stone-500">
              Scholarly Apparatus
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-serif-editorial font-bold text-stone-900">
                {catalogData.total_apparatus_words.toLocaleString("en-US")}
              </span>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                Words written
              </span>
            </div>
          </div>
        </section>

        {/* 6-Gate Pipeline Matrix Overview */}
        <section className="bg-white rounded-xl border border-[#e5dfd5] p-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-serif-editorial font-bold text-stone-900">
                Gate-by-Gate Pipeline Matrix
              </h2>
              <p className="text-xs text-stone-500">
                Every book passes sequentially through 6 strict quality gates
                before Amazon KDP publication.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium">
                Filter by Proofreading Status:
              </span>
              {[
                { key: "all", label: "All Titles" },
                { key: "high", label: "0 Flags (Clean)" },
                { key: "medium", label: "Light Review" },
                { key: "low", label: "Needs Proofing" },
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setFilterProof(btn.key)}
                  className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                    filterProof === btn.key
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-xs uppercase tracking-wider text-stone-500">
                  <th className="py-3 pr-4">Title &amp; Author</th>
                  <th className="py-3 px-3">Gate 1: Rights</th>
                  <th className="py-3 px-3">Gate 2: Text &amp; Proof</th>
                  <th className="py-3 px-3">Gate 3: Apparatus</th>
                  <th className="py-3 px-3">Gate 4: Build</th>
                  <th className="py-3 px-3">Gate 5: KDP Listing</th>
                  <th className="py-3 pl-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredTitles.map((book) => {
                  const g1 = book.gates[0];
                  const g2 = book.gates[1];
                  const g3 = book.gates[2];
                  const g4 = book.gates[3];
                  const g5 = book.gates[4];

                  return (
                    <tr
                      key={book.slug}
                      className="hover:bg-stone-50/80 transition"
                    >
                      <td className="py-3.5 pr-4">
                        <div className="font-serif-editorial font-bold text-stone-900">
                          {book.title}
                        </div>
                        <div className="text-xs text-stone-500">
                          {book.author} (d. {book.death_year}) · First pub.{" "}
                          {book.pub_year}
                        </div>
                      </td>

                      {/* Gate 1 */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Worldwide PD
                        </span>
                        {g1 && (
                          <div className="text-[11px] text-stone-500 mt-1">
                            {g1.completed}/{g1.total} checks
                          </div>
                        )}
                      </td>

                      {/* Gate 2 */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => openBookModal(book, "ocr")}
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border cursor-pointer ${
                            book.proof_level === "high"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : book.proof_level === "medium"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {book.proof_level === "high" ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          {book.proof_status}
                        </button>
                        {g2 && (
                          <div className="text-[11px] text-stone-500 mt-1">
                            {g2.completed}/{g2.total} checks
                          </div>
                        )}
                      </td>

                      {/* Gate 3 */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => openBookModal(book, "apparatus")}
                          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {book.apparatus_word_count} words
                        </button>
                        {g3 && (
                          <div className="text-[11px] text-stone-500 mt-1">
                            {g3.completed}/{g3.total} checks
                          </div>
                        )}
                      </td>

                      {/* Gate 4 */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          EPUB + PDF
                        </span>
                        {g4 && (
                          <div className="text-[11px] text-stone-500 mt-1">
                            {g4.completed}/{g4.total} checks
                          </div>
                        )}
                      </td>

                      {/* Gate 5 */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => openBookModal(book, "listing")}
                          className="inline-flex items-center gap-1 text-xs font-medium text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Copy Ready
                        </button>
                        {g5 && (
                          <div className="text-[11px] text-stone-500 mt-1">
                            {g5.completed}/{g5.total} checks
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 pl-3 text-right">
                        <button
                          onClick={() => openBookModal(book, "gates")}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Open Card
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Subgrid Catalog Cards */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif-editorial font-bold text-stone-900">
              Edition Production Cards ({filteredTitles.length})
            </h2>
            <span className="text-xs text-stone-500">
              Click any section on a card to inspect its files, OCR flags, or
              KDP metadata
            </span>
          </div>

          <div className="catalog-card-grid">
            {filteredTitles.map((book) => {
              const totalChecks = book.gates.reduce(
                (acc, g) => acc + g.total,
                0
              );
              const doneChecks = book.gates.reduce(
                (acc, g) => acc + g.completed,
                0
              );
              const progressPct =
                totalChecks > 0
                  ? Math.round((doneChecks / totalChecks) * 100)
                  : 0;

              return (
                <article
                  key={book.slug}
                  className="catalog-card bg-white rounded-xl border border-[#e5dfd5] p-5 shadow-2xs hover:shadow-md transition"
                >
                  {/* Row 1: Cover Thumbnail + Title Header */}
                  <div className="flex gap-4">
                    {book.build.cover_url ? (
                      <button
                        onClick={() => openBookModal(book, "covers")}
                        className="w-20 shrink-0 rounded-md border border-stone-200 overflow-clip shadow-xs hover:opacity-90 transition cursor-pointer"
                        style={{ aspectRatio: "2 / 3" }}
                        title="Click to preview both cover variants"
                      >
                        <img
                          src={book.build.cover_url}
                          alt={`Cover of ${book.title}`}
                          className="w-full h-full object-cover block"
                        />
                      </button>
                    ) : (
                      <div
                        className="w-20 shrink-0 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400"
                        style={{ aspectRatio: "2 / 3" }}
                      >
                        <BookOpen className="w-6 h-6" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-900/10 text-amber-900">
                          {book.listing.series || "Catalog Edition"}
                        </span>
                      </div>
                      <h3 className="text-base font-serif-editorial font-bold text-stone-900 mt-1.5 leading-snug">
                        {book.title}
                      </h3>
                      <p className="text-xs text-stone-600 mt-0.5">
                        {book.author} · First pub. {book.pub_year} (d.{" "}
                        {book.death_year})
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                            book.proof_level === "high"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : book.proof_level === "medium"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {book.proof_status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Gate Checklist Progress Bar */}
                  <div className="pt-3 border-t border-stone-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-stone-700">
                        {book.current_stage}
                      </span>
                      <span className="text-stone-500 font-mono">
                        {doneChecks}/{totalChecks} checks ({progressPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-clip">
                      <div
                        className="h-full bg-amber-800 rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Row 3: Key Metrics & Apparatus Breakdown */}
                  <div className="py-3 grid grid-cols-3 gap-2 text-center bg-stone-50/70 rounded-lg border border-stone-200/70 px-2 my-1">
                    <div>
                      <div className="text-[11px] text-stone-500">Length</div>
                      <div className="text-xs font-semibold text-stone-900 mt-0.5">
                        {(book.clean_word_count / 1000).toFixed(1)}k words
                      </div>
                      <div className="text-[10px] text-stone-400">
                        ~{book.estimated_pages} pages
                      </div>
                    </div>
                    <div className="border-x border-stone-200/70">
                      <div className="text-[11px] text-stone-500">
                        OCR Cleanup
                      </div>
                      <div className="text-xs font-semibold text-stone-900 mt-0.5">
                        {book.ocr.auto_changes.toLocaleString("en-US")} fixes
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {book.ocr.flagged_count} flags left
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-stone-500">
                        Apparatus
                      </div>
                      <div className="text-xs font-semibold text-emerald-800 mt-0.5">
                        {book.apparatus.length} files ready
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {book.apparatus_word_count} words
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Action Bar & Direct Downloads */}
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {book.build.pdf_url && (
                        <a
                          href={book.build.pdf_url}
                          download
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 transition"
                          title="Download Print-Ready PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-stone-600" />
                          PDF ({book.build.pdf_size})
                        </a>
                      )}
                      {book.build.epub_url && (
                        <a
                          href={book.build.epub_url}
                          download
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 transition"
                          title="Download Kindle EPUB"
                        >
                          <Download className="w-3.5 h-3.5 text-stone-600" />
                          EPUB ({book.build.epub_size})
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => openBookModal(book, "gates")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-amber-900 text-white hover:bg-amber-800 transition cursor-pointer ml-auto"
                    >
                      Inspect Edition
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      {/* Native HTML <dialog> Modal for Deep Title Inspection */}
      <dialog
        ref={dialogRef}
        className="detail-modal m-auto"
        onClose={() => setSelectedBook(null)}
      >
        {selectedBook && (
          <div className="flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-200 bg-[#fdfbf8] flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-stone-200/80 text-stone-700 px-2 py-0.5 rounded">
                    {selectedBook.slug}
                  </span>
                  <span className="text-xs font-medium text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    {selectedBook.current_stage}
                  </span>
                </div>
                <h2 className="text-xl font-serif-editorial font-bold text-stone-900 mt-1">
                  {selectedBook.title}
                </h2>
                <p className="text-xs text-stone-600">
                  By {selectedBook.author} (d. {selectedBook.death_year}) ·
                  First published {selectedBook.pub_year} ·{" "}
                  {selectedBook.clean_word_count.toLocaleString("en-US")} words (~
                  {selectedBook.estimated_pages} pages)
                </p>
              </div>

              <button
                onClick={closeBookModal}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="px-6 border-b border-stone-200 bg-stone-50 flex flex-wrap gap-1">
              {[
                {
                  id: "gates",
                  label: "1. Gate Checklist",
                  icon: Layers,
                },
                {
                  id: "ocr",
                  label: `2. Proofing & OCR (${selectedBook.ocr.flagged_count} flags)`,
                  icon: Search,
                },
                {
                  id: "apparatus",
                  label: `3. Scholarly Apparatus (${selectedBook.apparatus.length})`,
                  icon: BookOpen,
                },
                {
                  id: "covers",
                  label: "4. Cover Studio",
                  icon: Eye,
                },
                {
                  id: "listing",
                  label: "5. KDP Listing Copy",
                  icon: FileText,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(
                        tab.id as
                          | "gates"
                          | "ocr"
                          | "apparatus"
                          | "listing"
                          | "covers"
                      )
                    }
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                      active
                        ? "border-amber-900 text-amber-950 bg-white"
                        : "border-transparent text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Scrollable Content Region */}
            <div className="modal-scroll-region p-6 space-y-6">
              {/* TAB 1: GATES */}
              {activeTab === "gates" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedBook.gates.map((gate) => (
                    <div
                      key={gate.id}
                      className="rounded-lg border border-stone-200 p-4 bg-stone-50/40"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-serif-editorial font-bold text-stone-900">
                          {gate.id} — {gate.title}
                        </h3>
                        <span
                          className={`text-xs font-mono px-2 py-0.5 rounded ${
                            gate.completed === gate.total
                              ? "bg-emerald-100 text-emerald-900 font-semibold"
                              : "bg-stone-200 text-stone-700"
                          }`}
                        >
                          {gate.completed}/{gate.total}
                        </span>
                      </div>
                      <ul className="space-y-2 text-xs">
                        {gate.items.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 leading-relaxed"
                          >
                            <span
                              className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 text-[10px] ${
                                item.done
                                  ? "bg-emerald-700 text-white"
                                  : "border border-stone-300 bg-white text-transparent"
                              }`}
                            >
                              ✓
                            </span>
                            <span
                              className={
                                item.done
                                  ? "text-stone-700"
                                  : "text-stone-900 font-medium"
                              }
                            >
                              {item.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: OCR & PROOFING */}
              {activeTab === "ocr" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200">
                      <div className="text-xs text-stone-500">Raw Lines</div>
                      <div className="text-lg font-bold text-stone-900 mt-0.5">
                        {selectedBook.ocr.input_lines.toLocaleString("en-US")}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200">
                      <div className="text-xs text-stone-500">
                        Cleaned Lines
                      </div>
                      <div className="text-lg font-bold text-stone-900 mt-0.5">
                        {selectedBook.ocr.output_lines.toLocaleString("en-US")}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                      <div className="text-xs text-emerald-800">
                        Mechanical Fixes
                      </div>
                      <div className="text-lg font-bold text-emerald-900 mt-0.5">
                        {selectedBook.ocr.auto_changes.toLocaleString("en-US")}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200">
                      <div className="text-xs text-amber-900">
                        Flagged for Human Review
                      </div>
                      <div className="text-lg font-bold text-amber-900 mt-0.5">
                        {selectedBook.ocr.flagged_count}
                      </div>
                    </div>
                  </div>

                  {selectedBook.ocr.flag_groups.length === 0 ? (
                    <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-emerald-950">
                        Zero Unresolved OCR Flags
                      </h4>
                      <p className="text-xs text-emerald-800 mt-1">
                        This text passed through{" "}
                        <code className="font-mono">tools/ocr_cleanup.py</code>{" "}
                        with 0 suspicious OCR patterns flagged.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-xs text-stone-600 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                        <strong>Editorial Proofing Queue:</strong> The items
                        below were intentionally left untouched by{" "}
                        <code className="font-mono">ocr_cleanup.py</code> so a
                        human editor can verify them in{" "}
                        <code className="font-mono">
                          {selectedBook.slug}/text/report.md
                        </code>
                        .
                      </div>
                      {selectedBook.ocr.flag_groups.map((grp, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-stone-200 overflow-clip"
                        >
                          <div className="bg-stone-100 px-4 py-2.5 flex items-center justify-between border-b border-stone-200">
                            <span className="text-xs font-bold text-stone-800">
                              {grp.category}
                            </span>
                            <span className="text-xs font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                              {grp.count} occurrences
                            </span>
                          </div>
                          <div className="p-3 bg-stone-950 text-stone-200 font-mono text-xs space-y-1.5 overflow-x-auto">
                            {grp.samples.map((s, idx) => (
                              <div key={idx} className="leading-relaxed">
                                {s}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: APPARATUS READER */}
              {activeTab === "apparatus" && (
                <div className="space-y-5">
                  <div className="text-xs text-stone-600 bg-stone-100 p-3 rounded-lg border border-stone-200">
                    Amazon KDP requires substantive differentiation for public
                    domain works. These original markdown files in{" "}
                    <code className="font-mono">
                      {selectedBook.slug}/apparatus/
                    </code>{" "}
                    are automatically compiled into the front matter of your
                    EPUB and PDF by <code className="font-mono">build.sh</code>.
                  </div>
                  {selectedBook.apparatus.map((doc) => (
                    <div
                      key={doc.filename}
                      className="rounded-lg border border-stone-200 bg-white overflow-clip"
                    >
                      <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-mono text-amber-900 font-semibold">
                            {doc.filename}
                          </span>
                          <h4 className="text-sm font-serif-editorial font-bold text-stone-900">
                            {doc.title}
                          </h4>
                        </div>
                        <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded font-medium">
                          {doc.word_count} words
                        </span>
                      </div>
                      <pre className="p-4 text-xs text-stone-800 whitespace-pre-wrap font-serif leading-relaxed max-h-72 overflow-y-auto">
                        {doc.content}
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: COVER STUDIO */}
              {activeTab === "covers" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-50 p-3.5 rounded-lg border border-stone-200">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">
                        Programmatic XeLaTeX Cover Variants
                      </h4>
                      <p className="text-xs text-stone-500">
                        Generated automatically by{" "}
                        <code className="font-mono">
                          ./tools/generate_cover.sh {selectedBook.slug}
                        </code>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCoverVariant("centered")}
                        className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${
                          coverVariant === "centered"
                            ? "bg-stone-900 text-white"
                            : "bg-white border border-stone-300 text-stone-700"
                        }`}
                      >
                        Centered Motif (Default)
                      </button>
                      <button
                        onClick={() => setCoverVariant("watermark")}
                        className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${
                          coverVariant === "watermark"
                            ? "bg-stone-900 text-white"
                            : "bg-white border border-stone-300 text-stone-700"
                        }`}
                      >
                        75% Watermark Underlay
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4 bg-stone-100 rounded-xl border border-stone-200">
                    {coverVariant === "centered" &&
                      selectedBook.build.cover_url && (
                        <img
                          src={selectedBook.build.cover_url}
                          alt="Centered cover"
                          className="w-64 rounded shadow-lg border border-stone-300"
                        />
                      )}
                    {coverVariant === "watermark" &&
                      selectedBook.build.cover_watermark_url && (
                        <img
                          src={selectedBook.build.cover_watermark_url}
                          alt="Watermark cover"
                          className="w-64 rounded shadow-lg border border-stone-300"
                        />
                      )}
                  </div>
                </div>
              )}

              {/* TAB 5: KDP LISTING COPY */}
              {activeTab === "listing" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-stone-200 bg-stone-50/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold uppercase text-stone-500">
                          KDP Title
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              selectedBook.listing.title,
                              "title"
                            )
                          }
                          className="inline-flex items-center gap-1 text-xs text-amber-900 hover:underline cursor-pointer"
                        >
                          {copiedField === "title" ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {copiedField === "title" ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <div className="text-sm font-bold text-stone-900">
                        {selectedBook.listing.title}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-stone-200 bg-stone-50/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold uppercase text-stone-500">
                          KDP Subtitle
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              selectedBook.listing.subtitle,
                              "subtitle"
                            )
                          }
                          className="inline-flex items-center gap-1 text-xs text-amber-900 hover:underline cursor-pointer"
                        >
                          {copiedField === "subtitle" ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {copiedField === "subtitle" ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <div className="text-sm font-medium text-stone-800">
                        {selectedBook.listing.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* HTML Description */}
                  <div className="p-4 rounded-lg border border-stone-200 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase text-stone-500">
                        Amazon HTML Description (Paste directly into KDP source
                        view)
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            selectedBook.listing.description_html,
                            "desc"
                          )
                        }
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-amber-900 text-white hover:bg-amber-800 cursor-pointer"
                      >
                        {copiedField === "desc" ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedField === "desc"
                          ? "Copied HTML!"
                          : "Copy HTML Description"}
                      </button>
                    </div>
                    <pre className="p-3 rounded bg-stone-950 text-stone-200 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                      {selectedBook.listing.description_html}
                    </pre>
                  </div>

                  {/* Backend Keywords & Categories */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-stone-200 bg-stone-50/50">
                      <div className="text-xs font-semibold uppercase text-stone-500 mb-2">
                        7 Backend Search Keywords
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-stone-800 font-mono">
                        {selectedBook.listing.keywords.map((kw, i) => (
                          <li key={i}>{kw}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="p-4 rounded-lg border border-stone-200 bg-stone-50/50 space-y-3">
                      <div>
                        <div className="text-xs font-semibold uppercase text-stone-500 mb-1.5">
                          BISAC Categories
                        </div>
                        <ul className="space-y-1 text-xs text-stone-800">
                          {selectedBook.listing.categories.map((cat, i) => (
                            <li key={i}>• {cat}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase text-stone-500 mb-1.5">
                          Pricing Strategy
                        </div>
                        <ul className="space-y-1 text-xs text-stone-800">
                          {selectedBook.listing.pricing.map((p, i) => (
                            <li key={i}>• {p}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
