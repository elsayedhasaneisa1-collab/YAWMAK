"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Search,
  Target,
} from "@/components/ui/icons";
import {
  YawmakCard,
  YawmakBadge,
  YawmakButton,
  YawmakSkeleton,
  YawmakInput,
} from "@/components/ui/DesignSystem";
import type { SurahDetail } from "@/lib/islamic-api";
import { usePrefersReducedMotion } from "@/components/three/Depth";

interface SurahSummary {
  number: number;
  name: string;
  englishName: string;
  ayahCount: number;
  revelationType: string;
}

const POSITION_STORE = "yawmak_quran_position_v2";

export interface QuranReadingSectionProps {
  invitationId?: string | null;
  heading?: string;
  subheading?: string;
}

export default function QuranReadingSection({
  invitationId = null,
  heading = "قرآن يُتلى وأجر نرجوه",
  subheading = "اختر السورة واقرأ بتأنٍّ، وأتمم القراءة ليُسجَّل في عداد الأجر",
}: QuranReadingSectionProps) {
  const reduced = usePrefersReducedMotion();
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number>(36);
  const [detail, setDetail] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(30);
  const [width, setWidth] = useState<"narrow" | "normal" | "wide">("normal");
  const [readings, setReadings] = useState(0);
  const [bySurah, setBySurah] = useState<Array<{ surahNumber: number; surahName: string; total: number }>>([]);
  const [completing, setCompleting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);
  const [jumpAyah, setJumpAyah] = useState("");
  const [savedAyah, setSavedAyah] = useState<number | null>(null);
  const scrollTimer = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/islamic/quran")
      .then((r) => r.json())
      .then((d) => {
        const list: SurahSummary[] = d.surahs || [];
        setSurahs(list);
      })
      .catch(() => undefined);

    const restore = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(POSITION_STORE);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.surahNumber) {
            setSelected(Number(parsed.surahNumber));
            if (parsed?.fontSize) setFontSize(Number(parsed.fontSize));
            if (parsed?.ayahNumber) setSavedAyah(Number(parsed.ayahNumber));
          }
        }
      } catch {
        return;
      }
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  const handleReaderScroll = () => {
    if (scrollTimer.current !== null) return;
    scrollTimer.current = window.setTimeout(() => {
      scrollTimer.current = null;
      const container = readerRef.current;
      if (!container) return;
      const marks = Array.from(container.querySelectorAll<HTMLElement>("[data-ayah]"));
      const anchor = container.getBoundingClientRect().top + 60;
      let current = marks[0];
      for (const mark of marks) {
        if (mark.getBoundingClientRect().top <= anchor) current = mark;
        else break;
      }
      if (!current) return;
      const ayahNumber = Number(current.dataset.ayah || 0);
      if (!ayahNumber) return;
      setSavedAyah(ayahNumber);
      try {
        const raw = window.localStorage.getItem(POSITION_STORE);
        const parsed = raw ? JSON.parse(raw) : {};
        window.localStorage.setItem(
          POSITION_STORE,
          JSON.stringify({ ...parsed, surahNumber: selected, fontSize, ayahNumber })
        );
      } catch {
        return;
      }
    }, 900);
  };

  const jumpToAyah = (value: number) => {
    const container = readerRef.current;
    if (!container || !value) return;
    const target = container.querySelector<HTMLElement>(`[data-ayah="${value}"]`);
    if (target) {
      container.scrollTo({
        top: Math.max(0, target.offsetTop - container.offsetTop - 12),
        behavior: reduced ? "auto" : "smooth",
      });
    }
  };

  const loadReadings = useCallback(() => {
    const qs = invitationId ? `?invitationId=${encodeURIComponent(invitationId)}` : "";
    fetch(`/api/quran-readings${qs}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setReadings(Number(d.totalReadings || 0));
        setBySurah(d.bySurah || []);
      })
      .catch(() => undefined);
  }, [invitationId]);

  useEffect(() => {
    loadReadings();
  }, [loadReadings]);

  useEffect(() => {
    const sync = window.setTimeout(() => {
      setLoading(true);
      setDetail(null);
    }, 0);
    fetch(`/api/islamic/quran?surah=${selected}`)
      .then((r) => r.json())
      .then((d) => setDetail(d))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));

    try {
      const raw = window.localStorage.getItem(POSITION_STORE);
      const parsed = raw ? JSON.parse(raw) : {};
      window.localStorage.setItem(
        POSITION_STORE,
        JSON.stringify({ ...parsed, surahNumber: selected, fontSize })
      );
    } catch {
      window.clearTimeout(sync);
      return;
    }
    return () => window.clearTimeout(sync);
  }, [selected, fontSize]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return surahs;
    return surahs.filter(
      (s) => s.name.includes(q) || s.englishName.toLowerCase().includes(q.toLowerCase()) || String(s.number) === q
    );
  }, [surahs, query]);

  const completeReading = async () => {
    if (completing || !detail) return;
    setCompleting(true);
    try {
      const res = await fetch("/api/quran-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surahNumber: detail.number,
          surahName: detail.name,
          invitationId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReadings(Number(data.totalReadings || 0));
        setJustCompleted(true);
        window.setTimeout(() => setJustCompleted(false), 3200);
        loadReadings();
      }
    } finally {
      setCompleting(false);
    }
  };

  const widthClass =
    width === "narrow" ? "max-w-2xl" : width === "wide" ? "max-w-none" : "max-w-4xl";

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <YawmakBadge tone="gold">
            <BookOpen className="w-3.5 h-3.5" /> {subheading}
          </YawmakBadge>
          <h2 className="font-display text-2xl sm:text-3xl font-bold yawmak-gold-text">{heading}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <YawmakBadge tone="emerald">
            <Target className="w-3.5 h-3.5" /> القراءات المكتملة: {readings}
          </YawmakBadge>
          <YawmakButton
            variant={justCompleted ? "success" : "primary"}
            size="sm"
            loading={completing}
            onClick={completeReading}
            disabled={!detail}
          >
            {justCompleted ? <Check className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
            {justCompleted ? "تم تسجيل إتمام القراءة" : "إتمام القراءة"}
          </YawmakButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-4 space-y-3">
          <YawmakCard className="!p-4 space-y-3">
            <YawmakInput
              placeholder="ابحث باسم السورة أو رقمها…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="yawmak-scroll-slim max-h-[520px] overflow-y-auto space-y-1 pl-1">
              {filtered.map((s) => {
                const active = s.number === selected;
                return (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => {
                      setSelected(s.number);
                      readerRef.current?.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
                    }}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-right transition-colors cursor-pointer ${
                      active
                        ? "bg-[var(--yawmak-gold)]/15 border border-[var(--yawmak-gold)]/45"
                        : "border border-transparent hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-white/5 border border-[var(--yawmak-border-subtle)] text-[11px] font-bold flex items-center justify-center shrink-0">
                        {s.number}
                      </span>
                      <div className="min-w-0">
                        <p className="font-quran text-base leading-none truncate">{s.name}</p>
                        <p className="text-[10px] text-[var(--yawmak-text-muted)] mt-1">
                          {s.revelationType} • {s.ayahCount} آية
                        </p>
                      </div>
                    </div>
                    {active && <ChevronLeft className="w-3.5 h-3.5 text-[var(--yawmak-gold)] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </YawmakCard>

          {bySurah.length > 0 && (
            <YawmakCard className="!p-4 space-y-2">
              <p className="text-xs font-bold text-[var(--yawmak-gold-soft)]">أكثر السور تلاوة وإتمامًا هنا</p>
              {bySurah.slice(0, 5).map((s) => (
                <div key={s.surahNumber} className="flex items-center justify-between text-xs">
                  <span className="truncate">{s.surahName}</span>
                  <span className="font-mono text-[var(--yawmak-gold-soft)]">{s.total} إتمام</span>
                </div>
              ))}
            </YawmakCard>
          )}
        </div>

        <div className="lg:col-span-8">
          <YawmakCard glow className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <YawmakButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected((n) => Math.max(1, n - 1))}
                  aria-label="السورة السابقة"
                >
                  <ChevronRight className="w-4 h-4" />
                </YawmakButton>
                <YawmakButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected((n) => Math.min(114, n + 1))}
                  aria-label="السورة التالية"
                >
                  <ChevronLeft className="w-4 h-4" />
                </YawmakButton>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="تصغير خط القراءة"
                    onClick={() => setFontSize((f) => Math.max(22, f - 2))}
                    className="w-8 h-8 rounded-lg border border-[var(--yawmak-border-subtle)] flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono text-[var(--yawmak-text-muted)] w-8 text-center">
                    {fontSize}
                  </span>
                  <button
                    type="button"
                    aria-label="تكبير خط القراءة"
                    onClick={() => setFontSize((f) => Math.min(52, f + 2))}
                    className="w-8 h-8 rounded-lg border border-[var(--yawmak-border-subtle)] flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] text-[var(--yawmak-text-muted)]" htmlFor="ayah-jump">
                    الانتقال إلى آية
                  </label>
                  <input
                    id="ayah-jump"
                    type="number"
                    min={1}
                    max={detail?.ayahCount || 286}
                    value={jumpAyah}
                    onChange={(e) => setJumpAyah(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") jumpToAyah(Number(jumpAyah));
                    }}
                    className="w-16 h-8 px-2 rounded-lg bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border-subtle)] text-xs text-center"
                  />
                  <YawmakButton size="sm" variant="outline" onClick={() => jumpToAyah(Number(jumpAyah))}>
                    اذهب
                  </YawmakButton>
                  {savedAyah && (
                    <YawmakButton size="sm" variant="ghost" onClick={() => jumpToAyah(savedAyah)}>
                      متابعة من الآية {savedAyah}
                    </YawmakButton>
                  )}
                </div>

                <div className="flex items-center gap-1 rounded-xl border border-[var(--yawmak-border-subtle)] p-1">
                  {(
                    [
                      { id: "narrow", label: "ضيق" },
                      { id: "normal", label: "متوسط" },
                      { id: "wide", label: "واسع" },
                    ] as const
                  ).map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWidth(w.id)}
                      className={`px-2.5 h-7 rounded-lg text-[11px] cursor-pointer ${
                        width === w.id ? "bg-[var(--yawmak-gold)]/20 text-[var(--yawmak-gold-soft)]" : "text-[var(--yawmak-text-muted)]"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              ref={readerRef}
              onScroll={handleReaderScroll}
              className="yawmak-scroll-slim max-h-[640px] overflow-y-auto"
            >
              {loading ? (
                <div className="space-y-3">
                  <YawmakSkeleton className="h-12" />
                  <YawmakSkeleton className="h-24" />
                  <YawmakSkeleton className="h-24" />
                </div>
              ) : !detail || detail.ayahs.length === 0 ? (
                <div className="text-center py-14 space-y-2">
                  <Search className="w-8 h-8 text-[var(--yawmak-gold)] mx-auto" />
                  <p className="text-sm font-bold">تعذر تحميل نص السورة من المصدر الموثق حاليًا</p>
                  <p className="text-xs text-[var(--yawmak-text-muted)] max-w-md mx-auto">
                    حفاظًا على قدسية النص القرآني، لا نولّد آيات أو نخمّن التشكيل؛ نعرض النص العثماني كما يرد من
                    المصدر الموثق فقط.
                  </p>
                  <YawmakButton variant="outline" size="sm" onClick={() => setSelected((n) => n)}>
                    إعادة المحاولة
                  </YawmakButton>
                </div>
              ) : (
                <div className={`${widthClass} mx-auto space-y-3`}>
                  {detail.number !== 1 && detail.number !== 9 && (
                    <p className="font-quran text-center text-2xl text-[var(--yawmak-gold-soft)]">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  )}
                  {detail.ayahs.map((ayah) => (
                    <div
                      key={ayah.number}
                      className="p-4 rounded-2xl border border-[var(--yawmak-border-subtle)] bg-white/[0.02] hover:border-[var(--yawmak-border)] transition-colors"
                    >
                      <p
                        data-ayah={ayah.numberInSurah}
                        className="font-quran text-right leading-[2.35]"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {ayah.text}{" "}
                        <span className="inline-flex items-center justify-center text-sm px-2 py-0.5 rounded-full bg-[var(--yawmak-gold)]/15 text-[var(--yawmak-gold-soft)] font-sans mx-1">
                          ﴿{ayah.numberInSurah}﴾
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--yawmak-border-subtle)]">
              <p className="text-[11px] text-[var(--yawmak-text-muted)]">
                المصدر: AlQuran Cloud (الرسم العثماني) — النص كما ورد دون تعديل أو إعادة إملاء.
              </p>
              <YawmakButton
                variant="primary"
                size="sm"
                loading={completing}
                onClick={completeReading}
                disabled={!detail}
              >
                <Check className="w-4 h-4" /> إتمام قراءة {detail?.name || "السورة"}
              </YawmakButton>
            </div>
          </YawmakCard>
        </div>
      </div>
    </section>
  );
}
