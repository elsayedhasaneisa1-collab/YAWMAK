"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  BookOpen,
  Search,
  Play,
  Pause,
  Repeat,
  Volume2,
  Bookmark,
  Share2,
  Plus,
  Minus,
  CheckCircle2,
  Calendar,
} from "@/components/ui/icons";
import {
  YawmakCard,
  YawmakButton,
  YawmakBadge,
  YawmakSkeleton,
  YawmakProgressBar,
  YawmakDialog,
  YawmakTextarea,
} from "@/components/ui/DesignSystem";
import { useYawmak } from "@/components/providers/YawmakProvider";
import { QURAN_RECITERS, type SurahSummary } from "@/lib/islamic-data";
import type { SurahDetail } from "@/lib/islamic-api";

export default function QuranPage() {
  const { user, settings, toast, refreshUser } = useYawmak();
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [reciter, setReciter] = useState<string>(QURAN_RECITERS[0].id);
  const [detail, setDetail] = useState<SurahDetail | null>(null);
  const [loadingSurah, setLoadingSurah] = useState(true);

  const [fontSize, setFontSize] = useState(28);
  const [readingGlow, setReadingGlow] = useState(true);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [repeatAyah, setRepeatAyah] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [speed, setSpeed] = useState(1);

  const [khatmaDays, setKhatmaDays] = useState(30);
  const [khatmaJuz, setKhatmaJuz] = useState(1);
  const [bookmarkedKeys, setBookmarkedKeys] = useState<Set<string>>(new Set());
  const [noteDialog, setNoteDialog] = useState<{ key: string; title: string; subtitle: string } | null>(null);
  const [noteText, setNoteText] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/islamic/quran")
      .then((r) => r.json())
      .then((d) => setSurahs(d.surahs || []))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const sync = window.setTimeout(() => {
      if (settings) {
        setSelectedSurah(settings.lastQuranSurah || 1);
        setFontSize(settings.quranFontSize || 28);
        setKhatmaDays(settings.khatmaPlanDays || 30);
        setKhatmaJuz(settings.khatmaCurrentJuz || 1);
      }
    }, 0);
    return () => window.clearTimeout(sync);
  }, [settings]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/bookmarks?type=quran")
      .then((r) => (r.ok ? r.json() : { bookmarks: [] }))
      .then((d) => {
        setBookmarkedKeys(new Set((d.bookmarks || []).map((b: { itemKey: string }) => b.itemKey)));
      })
      .catch(() => undefined);
  }, [user]);

  useEffect(() => {
    const sync = window.setTimeout(() => {
      setLoadingSurah(true);
      setPlayingAyah(null);
    }, 0);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    fetch(`/api/islamic/quran?surah=${selectedSurah}&reciter=${encodeURIComponent(reciter)}`)
      .then((r) => r.json())
      .then((d) => setDetail(d))
      .catch(() => setDetail(null))
      .finally(() => setLoadingSurah(false));
    return () => window.clearTimeout(sync);
  }, [selectedSurah, reciter]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = speed;
    }
  }, [volume, speed]);

  const playAyahAudio = (ayahIndex: number) => {
    if (!detail?.ayahs[ayahIndex]) return;
    const ayah = detail.ayahs[ayahIndex];

    if (playingAyah === ayah.numberInSurah && audioRef.current) {
      audioRef.current.pause();
      setPlayingAyah(null);
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.src = ayah.audioUrl;
    audio.volume = volume;
    audio.playbackRate = speed;
    audio.onended = () => {
      if (repeatAyah) {
        audio.currentTime = 0;
        audio.play().catch(() => undefined);
      } else if (detail && ayahIndex + 1 < detail.ayahs.length) {
        playAyahAudio(ayahIndex + 1);
      } else {
        setPlayingAyah(null);
      }
    };
    audio
      .play()
      .then(() => setPlayingAyah(ayah.numberInSurah))
      .catch(() => {
        toast({ type: "warning", title: "تعذر تشغيل التلاوة حاليًا", message: "تحقق من الاتصال بالإنترنت أو اختر قارئًا آخر." });
      });
  };

  const saveLastPosition = async (surahNum: number, ayahNum: number) => {
    try {
      window.localStorage.setItem("yawmak_last_quran", JSON.stringify({ surahNum, ayahNum }));
    } catch {
      // Ignore
    }
    if (user) {
      await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: { lastQuranSurah: surahNum, lastQuranAyah: ayahNum, quranFontSize: fontSize },
        }),
      });
      toast({ type: "success", title: "تم حفظ موضع القراءة", message: `سورة رقم ${surahNum} — آية ${ayahNum}` });
    } else {
      toast({ type: "info", title: "تم الحفظ محليًا", message: "سجّل الدخول لحفظ موضعك عبر أجهزتك." });
    }
  };

  const saveKhatmaPlan = async (newDays: number, newJuz: number) => {
    setKhatmaDays(newDays);
    setKhatmaJuz(newJuz);
    if (user) {
      await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: { khatmaPlanDays: newDays, khatmaCurrentJuz: newJuz },
        }),
      });
      await refreshUser();
      toast({ type: "success", title: "تم تحديث خطة الختم" });
    }
  };

  const saveBookmarkWithNote = async () => {
    if (!noteDialog) return;
    if (!user) {
      toast({ type: "warning", title: "يرجى تسجيل الدخول لحفظ العلامات والملاحظات" });
      setNoteDialog(null);
      return;
    }
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemType: "quran",
        itemKey: noteDialog.key,
        title: noteDialog.title,
        subtitle: noteDialog.subtitle,
        note: noteText,
      }),
    });
    if (res.ok) {
      setBookmarkedKeys((prev) => new Set(prev).add(noteDialog.key));
      toast({ type: "success", title: "تم حفظ العلامة والملاحظة" });
      setNoteDialog(null);
      setNoteText("");
    }
  };

  const shareAyah = async (surahName: string, ayahNum: number, text: string) => {
    const formatted = `﴿ ${text} ﴾\n— ${surahName} (${ayahNum})`;
    try {
      await navigator.clipboard.writeText(formatted);
      toast({ type: "success", title: "تم نسخ الآية للمشاركة" });
    } catch {
      toast({ type: "info", title: "تعذر النسخ التلقائي" });
    }
  };

  const filteredSurahs = surahs.filter(
    (s) =>
      s.name.includes(search.trim()) ||
      s.englishName.toLowerCase().includes(search.trim().toLowerCase()) ||
      String(s.number) === search.trim()
  );

  const pagesPerDay = Math.ceil(604 / Math.max(1, khatmaDays));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Golden Quran Header */}
      <div className="rounded-3xl border border-[#B89545]/30 bg-gradient-to-l from-[#FAF3E3] via-[#FAF8F3] to-[#FAF8F3] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <YawmakBadge tone="gold">
            <BookOpen className="w-3.5 h-3.5" /> YAWMAK QURAN — نورٌ وهداية
          </YawmakBadge>
          <h1 className="font-display text-3xl sm:text-4xl font-bold yawmak-gold-text">
            القرآن الكريم
          </h1>
          <p className="text-xs sm:text-sm text-[var(--yawmak-text-muted)]">
            تلاوة وعلامات مرجعية وخطط ختم.
          </p>
        </div>

        {/* Khatma Plan Compact Card */}
        <div className="p-4 rounded-2xl bg-black/35 border border-[#B89545]/25 min-w-[270px] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#D4AF62] flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> خطة الختم الحالية
            </span>
            <span className="text-[var(--yawmak-text-muted)]">~{pagesPerDay} صفحة/يوم</span>
          </div>
          <YawmakProgressBar value={khatmaJuz} max={30} />
          <div className="flex items-center justify-between gap-2 text-xs">
            <span>الجزء {khatmaJuz} من 30</span>
            <div className="flex items-center gap-1">
              <select
                aria-label="مدة الختمة"
                value={khatmaDays}
                onChange={(e) => saveKhatmaPlan(Number(e.target.value), khatmaJuz)}
                className="h-7 px-2 rounded-lg bg-black/50 border border-white/15 text-[11px]"
              >
                <option value={15}>ختمة 15 يومًا</option>
                <option value={30}>ختمة 30 يومًا</option>
                <option value={60}>ختمة 60 يومًا</option>
                <option value={90}>ختمة 90 يومًا</option>
              </select>
              <button
                type="button"
                onClick={() => saveKhatmaPlan(khatmaDays, Math.min(30, khatmaJuz + 1))}
                className="px-2 h-7 rounded-lg bg-emerald-600/30 border border-emerald-400/30 text-[11px] font-bold hover:bg-emerald-600/45 cursor-pointer"
              >
                + جزء
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Surah Sidebar + Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Surah Index */}
        <div className="lg:col-span-4 space-y-3">
          <YawmakCard className="!p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--yawmak-text-muted)] absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث باسم السورة أو رقمها..."
                className="w-full h-10 pr-9 pl-3 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border-subtle)] text-xs outline-none focus:border-[var(--yawmak-gold)]"
              />
            </div>

            <div className="max-h-[540px] overflow-y-auto space-y-1 pl-1">
              {filteredSurahs.map((s) => {
                const active = s.number === selectedSurah;
                return (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => setSelectedSurah(s.number)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-right transition-colors cursor-pointer ${
                      active
                        ? "bg-[var(--yawmak-gold)]/15 border border-[var(--yawmak-gold)]/45 text-[var(--yawmak-gold-soft)]"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-white/5 border border-[var(--yawmak-border-subtle)] text-[11px] font-bold flex items-center justify-center">
                        {s.number}
                      </span>
                      <div>
                        <p className="font-quran text-base leading-none">{s.name}</p>
                        <p className="text-[10px] text-[var(--yawmak-text-muted)] mt-1">
                          {s.revelationType} • {s.ayahCount} آية
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </YawmakCard>
        </div>

        {/* Mushaf Reader & Audio Controls */}
        <div className="lg:col-span-8 space-y-4">
          {/* Audio & Typography Controls */}
          <YawmakCard className="!p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="اختيار القارئ"
                value={reciter}
                onChange={(e) => setReciter(e.target.value)}
                className="h-9 px-3 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border-subtle)] text-xs"
              >
                {QURAN_RECITERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    القارئ: {r.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setRepeatAyah((v) => !v)}
                className={`h-9 px-3 rounded-xl border text-xs flex items-center gap-1.5 cursor-pointer ${
                  repeatAyah
                    ? "bg-[var(--yawmak-gold)]/20 border-[var(--yawmak-gold)] text-[var(--yawmak-gold-soft)]"
                    : "border-[var(--yawmak-border-subtle)] text-[var(--yawmak-text-muted)]"
                }`}
              >
                <Repeat className="w-3.5 h-3.5" /> تكرار الآية
              </button>

              <select
                aria-label="سرعة التلاوة"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="h-9 px-2.5 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border-subtle)] text-xs"
              >
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[var(--yawmak-gold)]" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="مستوى الصوت"
                className="w-20 accent-[#B89545]"
              />
              <button
                type="button"
                onClick={() => setFontSize((f) => Math.max(20, f - 2))}
                aria-label="تصغير الخط"
                className="w-8 h-8 rounded-lg border border-[var(--yawmak-border-subtle)] flex items-center justify-center cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setFontSize((f) => Math.min(44, f + 2))}
                aria-label="تكبير الخط"
                className="w-8 h-8 rounded-lg border border-[var(--yawmak-border-subtle)] flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setReadingGlow((g) => !g)}
                className="px-2.5 h-8 rounded-lg border border-[var(--yawmak-border-subtle)] text-[11px] cursor-pointer"
              >
                {readingGlow ? "نور ذهبي" : "هادئ"}
              </button>
            </div>
          </YawmakCard>

          {/* Surah Content */}
          <YawmakCard
            glow={readingGlow}
            className={`space-y-4 ${readingGlow ? "bg-gradient-to-b from-[#FAF3E3]/85 to-[var(--yawmak-surface)]" : ""}`}
          >
            {loadingSurah ? (
              <div className="space-y-3">
                <YawmakSkeleton className="h-12" />
                <YawmakSkeleton className="h-28" />
                <YawmakSkeleton className="h-28" />
              </div>
            ) : !detail || detail.ayahs.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <p className="text-sm font-bold">تعذر تحميل نص السورة من المصدر الموثق حاليًا</p>
                <p className="text-xs text-[var(--yawmak-text-muted)]">
                  حفاظًا على قدسية النص القرآني، لا نقوم بتوليد أو تخمين الآيات عند انقطاع المصدر. يرجى المحاولة مجددًا.
                </p>
                <YawmakButton
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSurah((s) => s)}
                >
                  إعادة المحاولة
                </YawmakButton>
              </div>
            ) : (
              <>
                <div className="text-center pb-4 border-b border-[var(--yawmak-border)] space-y-1">
                  <h2 className="font-quran text-3xl yawmak-gold-text">{detail.name}</h2>
                  <p className="text-xs text-[var(--yawmak-text-muted)]">
                    {detail.revelationType} • {detail.ayahCount} آية • المصدر: AlQuran Cloud (الرسم العثماني)
                  </p>
                </div>

                <div className="space-y-3 max-h-[650px] overflow-y-auto pl-1">
                  {detail.ayahs.map((ayah, idx) => {
                    const key = `${detail.number}:${ayah.numberInSurah}`;
                    const isPlaying = playingAyah === ayah.numberInSurah;
                    const isBookmarked = bookmarkedKeys.has(key);
                    return (
                      <div
                        key={ayah.number}
                        className={`p-4 rounded-2xl border transition-colors ${
                          isPlaying
                            ? "bg-[var(--yawmak-gold)]/12 border-[var(--yawmak-gold)]/55"
                            : "bg-white/[0.02] border-[var(--yawmak-border-subtle)] hover:border-[var(--yawmak-border)]"
                        }`}
                      >
                        <p
                          className="font-quran text-right leading-[2.3] text-[var(--yawmak-text)]"
                          style={{ fontSize: `${fontSize}px` }}
                        >
                          {ayah.text}{" "}
                          <span className="inline-flex items-center justify-center text-sm px-2 py-0.5 rounded-full bg-[var(--yawmak-gold)]/15 text-[var(--yawmak-gold-soft)] font-sans mx-1">
                            ﴿{ayah.numberInSurah}﴾
                          </span>
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-[var(--yawmak-border-subtle)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--yawmak-text-muted)]">
                          <span>
                            الجزء {ayah.juz} • صفحة {ayah.page}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => playAyahAudio(idx)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[var(--yawmak-gold)]/15 text-[var(--yawmak-gold-soft)] cursor-pointer"
                            >
                              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                              {isPlaying ? "إيقاف" : "تلاوة"}
                            </button>
                            <button
                              type="button"
                              onClick={() => saveLastPosition(detail.number, ayah.numberInSurah)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/15 text-emerald-300 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> حفظ الموضع
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setNoteDialog({
                                  key,
                                  title: `${detail.name} — آية ${ayah.numberInSurah}`,
                                  subtitle: ayah.text.slice(0, 120),
                                })
                              }
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg cursor-pointer ${
                                isBookmarked
                                  ? "bg-[var(--yawmak-gold)]/20 text-[var(--yawmak-gold-soft)]"
                                  : "bg-white/5 hover:bg-white/10"
                              }`}
                            >
                              <Bookmark className="w-3.5 h-3.5" /> {isBookmarked ? "محفوظة" : "علامة وملاحظة"}
                            </button>
                            <button
                              type="button"
                              onClick={() => shareAyah(detail.name, ayah.numberInSurah, ayah.text)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5" /> مشاركة
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </YawmakCard>
        </div>
      </div>

      {/* Bookmark + Reflection Note Dialog */}
      <YawmakDialog
        open={Boolean(noteDialog)}
        onClose={() => setNoteDialog(null)}
        title="حفظ علامة مرجعية وملاحظة تدبر"
        description={noteDialog?.title}
        footer={
          <>
            <YawmakButton variant="ghost" size="sm" onClick={() => setNoteDialog(null)}>
              إلغاء
            </YawmakButton>
            <YawmakButton variant="primary" size="sm" onClick={saveBookmarkWithNote}>
              حفظ العلامة
            </YawmakButton>
          </>
        }
      >
        <YawmakTextarea
          label="ملاحظة تدبر شخصية (اختياري)"
          placeholder="اكتب خاطرة أو فائدة من هذه الآية الكريمة..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />
      </YawmakDialog>
    </div>
  );
}
