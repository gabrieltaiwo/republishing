"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  FileCode2,
  Volume2,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

type CatalogType = typeof catalogData;
type BookItem = CatalogType["titles"][number];

interface ReaderSection {
  id: string;
  title: string;
  word_count: number;
  content: string;
}

interface BookReaderPayload {
  slug: string;
  title: string;
  author: string;
  sections: ReaderSection[];
}

type ModalTab =
  | "reader"
  | "gates"
  | "ocr"
  | "apparatus"
  | "listing"
  | "covers";

export default function DashboardPage() {
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>("reader");
  const [coverVariant, setCoverVariant] = useState<"centered" | "watermark">(
    "centered"
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [filterProof, setFilterProof] = useState<string>("all");

  // Book Reader State
  const [readerMode, setReaderMode] = useState<"ereader" | "pdf">("ereader");
  const [bookContent, setBookContent] = useState<BookReaderPayload | null>(
    null
  );
  const [loadingBook, setLoadingBook] = useState(false);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [readerTheme, setReaderTheme] = useState<"cream" | "white" | "dark">(
    "cream"
  );
  const [fontSize, setFontSize] = useState<number>(17);

  // In-Book Text Search & Match Navigation State
  const [readerSearch, setReaderSearch] = useState<string>("");
  const [activeMatchIdx, setActiveMatchIdx] = useState<number>(0);

  // Audio Reader (Web Speech API) State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speakingParaIdx, setSpeakingParaIdx] = useState<number>(0);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const readerPaneRef = useRef<HTMLDivElement | null>(null);
  const paraRefs = useRef<Record<number, HTMLParagraphElement | null>>({});
  const matchRefs = useRef<Record<number, HTMLElement | null>>({});
  const isPlayingRef = useRef<boolean>(false);
  const speechRateRef = useRef<number>(1.0);
  const selectedVoiceURIRef = useRef<string>("");

  useEffect(() => {
    speechRateRef.current = speechRate;
  }, [speechRate]);

  useEffect(() => {
    selectedVoiceURIRef.current = selectedVoiceURI;
  }, [selectedVoiceURI]);

  // Load browser TTS voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      const englishVoices = available.filter((v) =>
        v.lang.toLowerCase().startsWith("en")
      );
      const list = englishVoices.length > 0 ? englishVoices : available;
      setVoices(list);
      if (list.length > 0 && !selectedVoiceURIRef.current) {
        const preferred =
          list.find(
            (v) =>
              v.name.includes("Daniel") ||
              v.name.includes("Samantha") ||
              v.name.includes("Natural")
          ) || list[0];
        setSelectedVoiceURI(preferred.voiceURI);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const stopAudio = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const openBookModal = (book: BookItem, defaultTab: ModalTab = "reader") => {
    stopAudio();
    setSelectedBook(book);
    setActiveTab(defaultTab);
    setCurrentSectionIdx(0);
    setSpeakingParaIdx(0);
    setReaderSearch("");
    setActiveMatchIdx(0);
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  };

  useEffect(() => {
    if (!selectedBook) {
      setBookContent(null);
      return;
    }
    let cancelled = false;
    setLoadingBook(true);
    fetch(`/books/${selectedBook.slug}.json`)
      .then((res) => res.json())
      .then((data: BookReaderPayload) => {
        if (!cancelled) {
          setBookContent(data);
          setCurrentSectionIdx(0);
          setSpeakingParaIdx(0);
          setLoadingBook(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingBook(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBook]);

  const activeSection =
    bookContent && bookContent.sections[currentSectionIdx]
      ? bookContent.sections[currentSectionIdx]
      : null;

  // Split current section into paragraphs for audio reading & search rendering
  const paragraphs = useMemo(() => {
    if (!activeSection) return [];
    return activeSection.content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [activeSection]);

  // Speak a specific paragraph index and chain to the next one
  const speakParagraph = (idx: number, parasList: string[]) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    if (idx < 0 || idx >= parasList.length) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    isPlayingRef.current = true;
    setIsPlaying(true);
    setIsPaused(false);
    setSpeakingParaIdx(idx);

    const el = paraRefs.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const cleanText = parasList[idx].replace(/[#*_`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRateRef.current;

    const avail = window.speechSynthesis.getVoices();
    const chosen = avail.find((v) => v.voiceURI === selectedVoiceURIRef.current);
    if (chosen) {
      utterance.voice = chosen;
    }

    utterance.onend = () => {
      if (!isPlayingRef.current) return;
      if (idx + 1 < parasList.length) {
        speakParagraph(idx + 1, parasList);
      } else {
        isPlayingRef.current = false;
        setIsPlaying(false);
        setIsPaused(false);
      }
    };

    utterance.onerror = () => {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const togglePlayPause = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPlaying && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      speakParagraph(speakingParaIdx, paragraphs);
    }
  };

  const skipParagraph = (delta: number) => {
    const nextIdx = Math.max(
      0,
      Math.min(paragraphs.length - 1, speakingParaIdx + delta)
    );
    setSpeakingParaIdx(nextIdx);
    if (isPlaying) {
      speakParagraph(nextIdx, paragraphs);
    } else {
      const el = paraRefs.current[nextIdx];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSpeedChange = (newRate: number) => {
    setSpeechRate(newRate);
    speechRateRef.current = newRate;
    if (isPlaying) {
      speakParagraph(speakingParaIdx, paragraphs);
    }
  };

  const selectReaderSection = (idx: number) => {
    stopAudio();
    setCurrentSectionIdx(idx);
    setSpeakingParaIdx(0);
    setActiveMatchIdx(0);
    if (readerPaneRef.current) {
      readerPaneRef.current.scrollTop = 0;
    }
  };

  const closeBookModal = () => {
    stopAudio();
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

  // Calculate book-wide search matches per section
  const searchQuery = readerSearch.trim();
  const sectionSearchResults = useMemo(() => {
    if (!bookContent || searchQuery.length < 2) return null;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");

    return bookContent.sections
      .map((sec, idx) => {
        const matches = sec.content.match(regex);
        const count = matches ? matches.length : 0;
        const titleMatch = sec.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        return { sec, idx, count, titleMatch };
      })
      .filter((item) => item.count > 0 || item.titleMatch);
  }, [bookContent, searchQuery]);

  // Count matches in the currently open section
  const currentSectionMatchCount = useMemo(() => {
    if (!activeSection || searchQuery.length < 2) return 0;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");
    let total = 0;
    for (const p of paragraphs) {
      const m = p.match(regex);
      if (m) total += m.length;
    }
    return total;
  }, [activeSection, paragraphs, searchQuery]);

  const totalBookMatches = useMemo(() => {
    if (!sectionSearchResults) return 0;
    return sectionSearchResults.reduce((acc, r) => acc + r.count, 0);
  }, [sectionSearchResults]);

  // Scroll to active match when activeMatchIdx changes
  useEffect(() => {
    if (currentSectionMatchCount === 0) return;
    const el = matchRefs.current[activeMatchIdx];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeMatchIdx, currentSectionMatchCount, currentSectionIdx]);

  const jumpMatch = (delta: number) => {
    if (currentSectionMatchCount === 0) return;
    setActiveMatchIdx(
      (prev) =>
        (prev + delta + currentSectionMatchCount) % currentSectionMatchCount
    );
  };

  // Helper to render paragraph text with highlighted search matches
  const renderHighlightedParagraph = (
    text: string,
    startingMatchCounter: { current: number }
  ) => {
    if (searchQuery.length < 2) return text;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((part, i) => {
      if (part.toLowerCase() === searchQuery.toLowerCase()) {
        const matchIndex = startingMatchCounter.current++;
        const isCurrent = matchIndex === activeMatchIdx;
        return (
          <mark
            key={i}
            ref={(el) => {
              matchRefs.current[matchIndex] = el;
            }}
            className={`rounded px-0.5 transition-all ${
              isCurrent
                ? "bg-amber-500 text-stone-950 font-bold ring-2 ring-amber-700"
                : "bg-yellow-200/90 text-stone-900"
            }`}
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // Counter used during render to assign sequential indices to <mark> tags
  const renderMatchCounter = { current: 0 };
  matchRefs.current = {};

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
              Pipeline, E-Reader &amp; Audio Narrator
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
                  <th className="py-3 pl-3 text-right">Actions</th>
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
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openBookModal(book, "reader")}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-900 text-white hover:bg-amber-800 transition cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            Read / Listen
                          </button>
                          <button
                            onClick={() => openBookModal(book, "gates")}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-800 hover:bg-stone-200 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Gates
                          </button>
                        </div>
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
              Click &ldquo;Read &amp; Listen&rdquo; on any card to open the
              E-Reader, Audio Narrator, or Print PDF preview
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
                        onClick={() => openBookModal(book, "reader")}
                        className="w-20 shrink-0 rounded-md border border-stone-200 overflow-clip shadow-xs hover:opacity-90 transition cursor-pointer"
                        style={{ aspectRatio: "2 / 3" }}
                        title="Click to read or listen to this book"
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
                      onClick={() => openBookModal(book, "reader")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-amber-900 text-white hover:bg-amber-800 transition cursor-pointer ml-auto"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Read &amp; Listen
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      {/* Native HTML <dialog> Modal for Book Reading, Audio Narration & Deep Inspection */}
      <dialog
        ref={dialogRef}
        className="detail-modal m-auto"
        onClose={() => {
          stopAudio();
          setSelectedBook(null);
        }}
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
                  {selectedBook.clean_word_count.toLocaleString("en-US")} words
                  (~{selectedBook.estimated_pages} pages)
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
                  id: "reader",
                  label: "📖 Read & Audio Narrator",
                  icon: BookOpen,
                },
                {
                  id: "gates",
                  label: "Gate Checklist",
                  icon: Layers,
                },
                {
                  id: "ocr",
                  label: `Proofing & OCR (${selectedBook.ocr.flagged_count} flags)`,
                  icon: Search,
                },
                {
                  id: "apparatus",
                  label: `Apparatus Files (${selectedBook.apparatus.length})`,
                  icon: FileCode2,
                },
                {
                  id: "covers",
                  label: "Cover Studio",
                  icon: Eye,
                },
                {
                  id: "listing",
                  label: "KDP Listing Copy",
                  icon: FileText,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id !== "reader") stopAudio();
                      setActiveTab(tab.id as ModalTab);
                    }}
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
              {/* TAB 0: INTERACTIVE BOOK READER, TEXT SEARCH & AUDIO NARRATOR */}
              {activeTab === "reader" && (
                <div className="space-y-3">
                  {/* Row 1: Mode Switcher + Full-Text Search Bar + Typography */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-100 p-3 rounded-lg border border-stone-200">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setReaderMode("ereader")}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                          readerMode === "ereader"
                            ? "bg-stone-900 text-white"
                            : "bg-white text-stone-700 border border-stone-300"
                        }`}
                      >
                        E-Reader &amp; Audio
                      </button>
                      <button
                        onClick={() => {
                          stopAudio();
                          setReaderMode("pdf");
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                          readerMode === "pdf"
                            ? "bg-stone-900 text-white"
                            : "bg-white text-stone-700 border border-stone-300"
                        }`}
                      >
                        Typeset Print PDF Preview
                      </button>
                    </div>

                    {readerMode === "ereader" && (
                      <div className="flex flex-wrap items-center gap-2">
                        {/* In-Book Full-Text Search + Match Navigator */}
                        <div className="flex items-center bg-white rounded-md border border-stone-300 overflow-clip">
                          <Search className="w-3.5 h-3.5 text-stone-400 ml-2.5 shrink-0" />
                          <input
                            type="text"
                            value={readerSearch}
                            onChange={(e) => {
                              setReaderSearch(e.target.value);
                              setActiveMatchIdx(0);
                            }}
                            placeholder="Search text in book..."
                            className="text-xs px-2 py-1.5 bg-transparent text-stone-900 w-44 focus:outline-none"
                          />
                          {searchQuery.length >= 2 && (
                            <div className="flex items-center gap-1 pr-1.5 border-l border-stone-200 pl-2 bg-stone-50 text-[11px] font-mono text-stone-600">
                              <span>
                                {currentSectionMatchCount > 0
                                  ? `${activeMatchIdx + 1}/${currentSectionMatchCount}`
                                  : `0 (${totalBookMatches} in book)`}
                              </span>
                              <button
                                onClick={() => jumpMatch(-1)}
                                disabled={currentSectionMatchCount === 0}
                                className="p-0.5 hover:bg-stone-200 rounded disabled:opacity-30 cursor-pointer"
                                title="Previous match in chapter"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => jumpMatch(1)}
                                disabled={currentSectionMatchCount === 0}
                                className="p-0.5 hover:bg-stone-200 rounded disabled:opacity-30 cursor-pointer"
                                title="Next match in chapter"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  setReaderSearch("");
                                  setActiveMatchIdx(0);
                                }}
                                className="p-0.5 hover:bg-stone-200 rounded text-stone-500 cursor-pointer"
                                title="Clear search"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Font Size Controls */}
                        <div className="inline-flex items-center rounded-md border border-stone-300 bg-white overflow-clip text-xs">
                          <button
                            onClick={() =>
                              setFontSize((f) => Math.max(13, f - 2))
                            }
                            className="px-2.5 py-1 hover:bg-stone-100 font-serif font-bold cursor-pointer"
                            title="Smaller font"
                          >
                            A-
                          </button>
                          <span className="px-2 py-1 border-x border-stone-200 text-stone-500 font-mono text-[11px]">
                            {fontSize}px
                          </span>
                          <button
                            onClick={() =>
                              setFontSize((f) => Math.min(25, f + 2))
                            }
                            className="px-2.5 py-1 hover:bg-stone-100 font-serif font-bold cursor-pointer"
                            title="Larger font"
                          >
                            A+
                          </button>
                        </div>

                        {/* Paper Theme Controls */}
                        <div className="inline-flex items-center rounded-md border border-stone-300 bg-white overflow-clip text-xs">
                          {[
                            { id: "cream", label: "Cream" },
                            { id: "white", label: "White" },
                            { id: "dark", label: "Night" },
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() =>
                                setReaderTheme(
                                  t.id as "cream" | "white" | "dark"
                                )
                              }
                              className={`px-2.5 py-1 font-medium cursor-pointer ${
                                readerTheme === t.id
                                  ? "bg-amber-900 text-white"
                                  : "text-stone-700 hover:bg-stone-100"
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Row 2: Audio Reader Bar (TTS Narrator) */}
                  {readerMode === "ereader" && (
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-950 text-amber-50 px-4 py-2.5 rounded-lg shadow-xs">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-amber-300 shrink-0" />
                        <span className="text-xs font-semibold tracking-wide uppercase text-amber-200">
                          Audio Reader
                        </span>

                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => skipParagraph(-1)}
                            disabled={speakingParaIdx <= 0}
                            className="p-1.5 rounded hover:bg-amber-900/80 disabled:opacity-30 cursor-pointer"
                            title="Previous paragraph"
                          >
                            <SkipBack className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={togglePlayPause}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-400 text-stone-950 font-bold text-xs hover:bg-amber-300 transition cursor-pointer"
                          >
                            {isPlaying && !isPaused ? (
                              <>
                                <Pause className="w-3.5 h-3.5" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                {isPlaying && isPaused
                                  ? "Resume"
                                  : "Listen to Chapter"}
                              </>
                            )}
                          </button>

                          {isPlaying && (
                            <button
                              onClick={stopAudio}
                              className="p-1.5 rounded bg-amber-900/80 hover:bg-rose-800 text-amber-100 transition cursor-pointer"
                              title="Stop narration"
                            >
                              <Square className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => skipParagraph(1)}
                            disabled={speakingParaIdx >= paragraphs.length - 1}
                            className="p-1.5 rounded hover:bg-amber-900/80 disabled:opacity-30 cursor-pointer"
                            title="Next paragraph"
                          >
                            <SkipForward className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-[11px] font-mono text-amber-200/80 ml-2 hidden sm:inline">
                          Paragraph {speakingParaIdx + 1} of {paragraphs.length}{" "}
                          (click any paragraph to play from there)
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Speed selector */}
                        <div className="flex items-center gap-1 bg-amber-900/70 rounded px-2 py-1">
                          <span className="text-[11px] text-amber-200">
                            Speed:
                          </span>
                          {[0.85, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => handleSpeedChange(rate)}
                              className={`px-1.5 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                                speechRate === rate
                                  ? "bg-amber-300 text-stone-950 font-bold"
                                  : "text-amber-100 hover:bg-amber-800"
                              }`}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>

                        {/* Voice selector */}
                        {voices.length > 0 && (
                          <select
                            value={selectedVoiceURI}
                            onChange={(e) => {
                              setSelectedVoiceURI(e.target.value);
                              selectedVoiceURIRef.current = e.target.value;
                              if (isPlaying) {
                                speakParagraph(speakingParaIdx, paragraphs);
                              }
                            }}
                            className="bg-amber-900/70 text-amber-100 border border-amber-800 rounded px-2 py-1 text-xs max-w-44 truncate focus:outline-none"
                            aria-label="Select narrator voice"
                          >
                            {voices.map((v) => (
                              <option
                                key={v.voiceURI}
                                value={v.voiceURI}
                                className="text-stone-900 bg-white"
                              >
                                {v.name} ({v.lang})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mode A: Embedded Print PDF Viewer */}
                  {readerMode === "pdf" && selectedBook.build.pdf_url && (
                    <div className="rounded-xl border border-stone-300 overflow-clip bg-stone-900">
                      <iframe
                        src={selectedBook.build.pdf_url}
                        title={`PDF Preview of ${selectedBook.title}`}
                        className="w-full h-[65dvh] border-0"
                      />
                    </div>
                  )}

                  {/* Mode B: Interactive Chapter E-Reader */}
                  {readerMode === "ereader" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                      {/* Left Chapter Sidebar */}
                      <aside className="lg:col-span-4 rounded-xl border border-stone-200 bg-stone-50 overflow-clip">
                        <div className="px-3.5 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                            {sectionSearchResults
                              ? `Search Results (${totalBookMatches} hits)`
                              : "Table of Contents"}
                          </span>
                          {bookContent && (
                            <span className="text-[11px] font-mono text-stone-500">
                              {bookContent.sections.length} sections
                            </span>
                          )}
                        </div>

                        <div className="max-h-[54dvh] overflow-y-auto divide-y divide-stone-200/60">
                          {loadingBook && (
                            <div className="p-4 text-xs text-stone-500">
                              Loading book text...
                            </div>
                          )}

                          {sectionSearchResults ? (
                            sectionSearchResults.length === 0 ? (
                              <div className="p-4 text-xs text-stone-500">
                                No matches found for &ldquo;{readerSearch}
                                &rdquo; in this book.
                              </div>
                            ) : (
                              sectionSearchResults.map(
                                ({ sec, idx, count }) => (
                                  <button
                                    key={sec.id}
                                    onClick={() => selectReaderSection(idx)}
                                    className={`w-full text-left px-3.5 py-2.5 text-xs transition cursor-pointer ${
                                      currentSectionIdx === idx
                                        ? "bg-amber-900 text-white font-semibold"
                                        : "hover:bg-stone-200/60 text-stone-800"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="truncate">
                                        {sec.title}
                                      </span>
                                      <span
                                        className={`shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                          currentSectionIdx === idx
                                            ? "bg-amber-400 text-stone-950 font-bold"
                                            : "bg-amber-100 text-amber-900"
                                        }`}
                                      >
                                        {count} {count === 1 ? "hit" : "hits"}
                                      </span>
                                    </div>
                                  </button>
                                )
                              )
                            )
                          ) : (
                            bookContent?.sections.map((sec, idx) => (
                              <button
                                key={sec.id}
                                onClick={() => selectReaderSection(idx)}
                                className={`w-full text-left px-3.5 py-2.5 text-xs transition cursor-pointer ${
                                  currentSectionIdx === idx
                                    ? "bg-amber-900 text-white font-semibold"
                                    : "hover:bg-stone-200/60 text-stone-800"
                                }`}
                              >
                                <div className="truncate">{sec.title}</div>
                                <div
                                  className={`text-[10px] mt-0.5 ${
                                    currentSectionIdx === idx
                                      ? "text-amber-100"
                                      : "text-stone-400"
                                  }`}
                                >
                                  {sec.word_count.toLocaleString("en-US")} words
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </aside>

                      {/* Right Book Page Canvas */}
                      <div
                        ref={readerPaneRef}
                        className={`lg:col-span-8 rounded-xl border p-6 sm:p-10 max-h-[56dvh] overflow-y-auto shadow-inner transition-colors ${
                          readerTheme === "cream"
                            ? "bg-[#f8f4ec] text-[#1f1c18] border-[#e2d9c8]"
                            : readerTheme === "white"
                            ? "bg-white text-stone-900 border-stone-200"
                            : "bg-[#161514] text-[#e6e1d6] border-stone-800"
                        }`}
                      >
                        {activeSection ? (
                          <article className="max-w-2xl mx-auto">
                            <div className="pb-4 mb-6 border-b border-current/15 flex items-center justify-between text-xs opacity-70">
                              <span>{selectedBook.title}</span>
                              <span>
                                Section {currentSectionIdx + 1} of{" "}
                                {bookContent?.sections.length}
                              </span>
                            </div>

                            <h3 className="text-xl sm:text-2xl font-serif-editorial font-bold mb-6">
                              {activeSection.title}
                            </h3>

                            <div
                              className="font-serif-editorial leading-relaxed space-y-4"
                              style={{ fontSize: `${fontSize}px` }}
                            >
                              {paragraphs.map((para, pIdx) => {
                                const isBeingSpoken =
                                  isPlaying && speakingParaIdx === pIdx;
                                return (
                                  <p
                                    key={pIdx}
                                    ref={(el) => {
                                      paraRefs.current[pIdx] = el;
                                    }}
                                    onClick={() => {
                                      setSpeakingParaIdx(pIdx);
                                      if (isPlaying) {
                                        speakParagraph(pIdx, paragraphs);
                                      }
                                    }}
                                    title="Click to set audio narrator to this paragraph"
                                    className={`whitespace-pre-wrap rounded-md transition-colors cursor-pointer ${
                                      isBeingSpoken
                                        ? readerTheme === "dark"
                                          ? "bg-amber-950/80 ring-2 ring-amber-500/60 px-3 py-2 -mx-3"
                                          : "bg-amber-200/50 ring-2 ring-amber-700/40 px-3 py-2 -mx-3"
                                        : "hover:opacity-95"
                                    }`}
                                  >
                                    {renderHighlightedParagraph(
                                      para,
                                      renderMatchCounter
                                    )}
                                  </p>
                                );
                              })}
                            </div>

                            {/* Bottom Chapter Pagination */}
                            <div className="mt-10 pt-5 border-t border-current/15 flex items-center justify-between">
                              <button
                                disabled={currentSectionIdx === 0}
                                onClick={() =>
                                  selectReaderSection(
                                    Math.max(0, currentSectionIdx - 1)
                                  )
                                }
                                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded border border-current/25 disabled:opacity-30 cursor-pointer"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                Previous Section
                              </button>

                              <span className="text-xs opacity-60 font-mono">
                                {currentSectionIdx + 1} /{" "}
                                {bookContent?.sections.length}
                              </span>

                              <button
                                disabled={
                                  !bookContent ||
                                  currentSectionIdx >=
                                    bookContent.sections.length - 1
                                }
                                onClick={() =>
                                  selectReaderSection(currentSectionIdx + 1)
                                }
                                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded border border-current/25 disabled:opacity-30 cursor-pointer"
                              >
                                Next Section
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </article>
                        ) : (
                          <div className="text-center py-12 text-sm opacity-60">
                            Select a section from the Table of Contents to begin
                            reading.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
