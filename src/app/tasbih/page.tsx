"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  CircleDot,
  RotateCcw,
  Volume2,
  VolumeX,
  Vibrate,
  Plus,
  CloudUpload,
  Check,
} from "@/components/ui/icons";
import {
  YawmakCard,
  YawmakButton,
  YawmakBadge,
  YawmakDialog,
  YawmakInput,
} from "@/components/ui/DesignSystem";
import { useYawmak } from "@/components/providers/YawmakProvider";
import { DEFAULT_TASBIH_PRESETS } from "@/lib/islamic-data";
import DhikrCounters from "@/components/dhikr/DhikrCounters";

interface TasbihEntry {
  dhikrKey: string;
  dhikrText: string;
  count: number;
  target: number;
  totalAllTime: number;
}

const STORAGE_KEY = "yawmak_tasbih_state_v1";

export default function TasbihPage() {
  const { user, toast } = useYawmak();
  const [items, setItems] = useState<TasbihEntry[]>(() =>
    DEFAULT_TASBIH_PRESETS.map((p) => ({
      dhikrKey: p.key,
      dhikrText: p.text,
      count: 0,
      target: p.target,
      totalAllTime: 0,
    }))
  );
  const [activeKey, setActiveKey] = useState<string>(DEFAULT_TASBIH_PRESETS[0].key);
  const [vibrateOn, setVibrateOn] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customText, setCustomText] = useState("");
  const [customTarget, setCustomTarget] = useState(33);
  const [syncing, setSyncing] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Hydrate offline-first from localStorage, then merge server state if logged in
  useEffect(() => {
    const hydrate = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) setItems(parsed);
        }
      } catch {
        return;
      }
    }, 0);
    return () => window.clearTimeout(hydrate);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/tasbih")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.items?.length) return;
        setItems((prev) => {
          const map = new Map(prev.map((x) => [x.dhikrKey, x]));
          for (const srv of d.items) {
            const local = map.get(srv.dhikrKey);
            map.set(srv.dhikrKey, {
              dhikrKey: srv.dhikrKey,
              dhikrText: srv.dhikrText,
              count: Math.max(local?.count || 0, srv.count || 0),
              target: srv.target || 33,
              totalAllTime: Math.max(local?.totalAllTime || 0, srv.totalAllTime || 0),
            });
          }
          return Array.from(map.values());
        });
      })
      .catch(() => undefined);
  }, [user]);

  const persistLocal = useCallback((next: TasbihEntry[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore
    }
  }, []);

  const playSoftTick = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 528;
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio unavailable
    }
  };

  const active = items.find((i) => i.dhikrKey === activeKey) || items[0];

  const handleTap = () => {
    if (vibrateOn && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(18);
    }
    if (soundOn) playSoftTick();

    // Pure Local State update — NEVER calls DB per tap!
    setItems((prev) => {
      const next = prev.map((it) =>
        it.dhikrKey === active.dhikrKey
          ? { ...it, count: it.count + 1, totalAllTime: it.totalAllTime + 1 }
          : it
      );
      persistLocal(next);
      return next;
    });
    setDirty(true);
  };

  const confirmReset = () => {
    setItems((prev) => {
      const next = prev.map((it) =>
        it.dhikrKey === active.dhikrKey ? { ...it, count: 0 } : it
      );
      persistLocal(next);
      return next;
    });
    setResetDialogOpen(false);
    setDirty(true);
  };

  const syncToCloud = async () => {
    if (!user) {
      toast({ type: "info", title: "تم الحفظ محليًا على جهازك", message: "سجّل الدخول للمزامنة السحابية مع حسابك." });
      return;
    }
    setSyncing(true);
    try {
      const res = await fetch("/api/tasbih", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        setDirty(false);
        toast({ type: "success", title: "تم حفظ تقدم المسبحة في حسابك بنجاح" });
      }
    } finally {
      setSyncing(false);
    }
  };

  const addCustomDhikr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    const key = `custom_${Date.now()}`;
    const entry: TasbihEntry = {
      dhikrKey: key,
      dhikrText: customText.trim(),
      count: 0,
      target: Math.max(1, Math.min(10000, customTarget)),
      totalAllTime: 0,
    };
    const next = [...items, entry];
    setItems(next);
    persistLocal(next);
    setActiveKey(key);
    setCustomText("");
    setCustomDialogOpen(false);
    setDirty(true);
  };

  const pct = Math.min(100, Math.round((active.count / Math.max(1, active.target)) * 100));
  const strokeDashoffset = 565 - (565 * pct) / 100;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <YawmakBadge tone="emerald">
            <CircleDot className="w-3.5 h-3.5" /> YAWMAK TASBIH — الزمرد والذهب
          </YawmakBadge>
          <h1 className="font-display text-3xl font-bold yawmak-gold-text mt-1">المسبحة الإلكترونية</h1>
          <p className="text-xs text-[var(--yawmak-text-muted)]">
            عدادك الشخصي مع عدادات مشتركة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <YawmakButton
            variant={dirty ? "primary" : "outline"}
            size="sm"
            loading={syncing}
            onClick={syncToCloud}
          >
            <CloudUpload className="w-4 h-4" />
            {dirty ? "حفظ التقدم الآن" : "متزامن"}
          </YawmakButton>
          <YawmakButton variant="secondary" size="sm" onClick={() => setCustomDialogOpen(true)}>
            <Plus className="w-4 h-4" /> ذكر مخصص
          </YawmakButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Tactile Counter Ring */}
        <div className="lg:col-span-7">
          <YawmakCard
            glow
            className="bg-gradient-to-b from-[#FAF3E3]/90 to-[#FAF8F3]/90 flex flex-col items-center text-center py-8 space-y-6"
          >
            <div className="space-y-1 max-w-md">
              <p className="font-quran text-2xl sm:text-3xl text-[#292638] leading-relaxed">
                {active.dhikrText}
              </p>
              <p className="text-xs text-emerald-300">
                الهدف: {active.target} • المجموع الكلي: {active.totalAllTime}
              </p>
            </div>

            {/* Huge Touch-Friendly Ring Button */}
            <button
              type="button"
              onClick={handleTap}
              aria-label="زيادة عداد التسبيح"
              className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full flex items-center justify-center select-none active:scale-95 transition-transform cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B89545]"
            >
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="rgba(6,16,13,0.85)" stroke="rgba(212,175,98,0.2)" strokeWidth="8" />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="url(#tasbihGold)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="565"
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-200"
                />
                <defs>
                  <linearGradient id="tasbihGold" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#D4AF62" />
                    <stop offset="50%" stopColor="#B89545" />
                    <stop offset="100%" stopColor="#D4AF62" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-6xl sm:text-7xl font-extrabold yawmak-gold-text font-mono">
                  {active.count}
                </span>
                <span className="text-xs text-[var(--yawmak-text-muted)] mt-2">
                  {active.count >= active.target ? "اكتمل الهدف — بارك الله فيك" : "انقر للتسبيح"}
                </span>
              </div>
            </button>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setVibrateOn((v) => !v)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                  vibrateOn
                    ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300"
                    : "border-white/10 text-[var(--yawmak-text-muted)]"
                }`}
              >
                <Vibrate className="w-4 h-4" /> الاهتزاز
              </button>
              <button
                type="button"
                onClick={() => setSoundOn((s) => !s)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                  soundOn
                    ? "bg-[var(--yawmak-gold)]/15 border-[var(--yawmak-gold)]/40 text-[var(--yawmak-gold-soft)]"
                    : "border-white/10 text-[var(--yawmak-text-muted)]"
                }`}
              >
                {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />} الصوت
              </button>
              <button
                type="button"
                onClick={() => setResetDialogOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-red-400/30 text-red-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-red-500/10 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> إعادة ضبط
              </button>
            </div>
          </YawmakCard>
        </div>

        {/* Preset & Custom Dhikr List */}
        <div className="lg:col-span-5 space-y-3">
          <YawmakCard className="space-y-2.5">
            <h2 className="text-sm font-bold text-[var(--yawmak-gold-soft)]">اختر الذكر</h2>
            <div className="space-y-2 max-h-[460px] overflow-y-auto">
              {items.map((item) => {
                const selected = item.dhikrKey === active.dhikrKey;
                return (
                  <button
                    key={item.dhikrKey}
                    type="button"
                    onClick={() => setActiveKey(item.dhikrKey)}
                    className={`w-full p-3 rounded-xl border text-right transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      selected
                        ? "bg-[var(--yawmak-gold)]/15 border-[var(--yawmak-gold)]/50"
                        : "bg-white/[0.02] border-[var(--yawmak-border-subtle)] hover:bg-white/5"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-quran text-base truncate">{item.dhikrText}</p>
                      <p className="text-[11px] text-[var(--yawmak-text-muted)]">
                        الحالي: {item.count} / {item.target} • الإجمالي: {item.totalAllTime}
                      </p>
                    </div>
                    {item.count >= item.target && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </YawmakCard>
        </div>
      </div>

      {/* Community Dhikr Counters — personal + shared global totals */}
      <YawmakCard glow className="space-y-8">
        <DhikrCounters />
      </YawmakCard>

      {/* Reset Confirmation Dialog */}
      <YawmakDialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        title="تأكيد إعادة ضبط العداد"
        description={`سيتم تصفير العداد الحالي للذكر "${active.dhikrText}" مع الاحتفاظ بإجمالي التسبيحات السابقة.`}
        tone="warning"
        footer={
          <>
            <YawmakButton variant="ghost" size="sm" onClick={() => setResetDialogOpen(false)}>
              إلغاء
            </YawmakButton>
            <YawmakButton variant="danger" size="sm" onClick={confirmReset}>
              تصفير العداد
            </YawmakButton>
          </>
        }
      />

      {/* Custom Dhikr Dialog */}
      <YawmakDialog
        open={customDialogOpen}
        onClose={() => setCustomDialogOpen(false)}
        title="إضافة ذكر مخصص"
      >
        <form onSubmit={addCustomDhikr} className="space-y-4">
          <YawmakInput
            label="نص الذكر"
            required
            placeholder="مثال: رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
          />
          <YawmakInput
            label="الهدف"
            type="number"
            min={1}
            max={10000}
            value={customTarget}
            onChange={(e) => setCustomTarget(Number(e.target.value))}
          />
          <div className="flex justify-end gap-2">
            <YawmakButton type="button" variant="ghost" onClick={() => setCustomDialogOpen(false)}>
              إلغاء
            </YawmakButton>
            <YawmakButton type="submit" variant="primary">
              إضافة
            </YawmakButton>
          </div>
        </form>
      </YawmakDialog>
    </div>
  );
}
