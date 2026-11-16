"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, RotateCcw, Sparkles, Users } from "@/components/ui/icons";
import { YawmakCard, YawmakBadge, YawmakButton } from "@/components/ui/DesignSystem";
import { COMMUNITY_DHIKR_COUNTERS } from "@/lib/islamic-data";
import { usePrefersReducedMotion } from "@/components/three/Depth";

interface GlobalCounter {
  key: string;
  text: string;
  label: string;
  target: number;
  totalCount: number;
  participantsCount: number;
}

const PERSONAL_STORE = "yawmak_dhikr_personal_v2";
const FLUSH_INTERVAL_MS = 9000;
const POLL_INTERVAL_MS = 6500;

function loadPersonal(): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(PERSONAL_STORE);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export interface DhikrCountersProps {
  scopeKey?: string;
  heading?: string;
  subheading?: string;
  intro?: string;
  compact?: boolean;
}

export default function DhikrCounters({
  scopeKey = "global",
  heading = "عدادات الأذكار الجماعية",
  subheading = "شخصي لك وحدك + إجمالي مشترك لكل المشاركين",
  intro = "اضغط زر التسبيحة الكبيرة ليُسجل ذكرك في عدادك الشخصي وفي الإجمالي المشترك. الإجمالي يتحدث لحظيًا دون إعادة تحميل الصفحة.",
  compact = false,
}: DhikrCountersProps) {
  const reduced = usePrefersReducedMotion();
  const [personal, setPersonal] = useState<Record<string, number>>({});
  const [global, setGlobal] = useState<GlobalCounter[]>([]);
  const [activeKey, setActiveKey] = useState<string>(COMMUNITY_DHIKR_COUNTERS[0].key);
  const [bumpKey, setBumpKey] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const pending = useRef<Record<string, number>>({});

  useEffect(() => {
    const hydrate = window.setTimeout(() => setPersonal(loadPersonal()), 0);
    return () => window.clearTimeout(hydrate);
  }, []);

  const flush = useCallback(async () => {
    const entries = Object.entries(pending.current).filter(([, v]) => v > 0);
    if (!entries.length) return;
    pending.current = {};
    setSyncing(true);
    try {
      await Promise.all(
        entries.map(([key, amount]) =>
          fetch("/api/dhikr-counters", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dhikrKey: key, amount: Math.min(25, Math.max(1, amount)), scopeKey }),
          }).catch(() => undefined)
        )
      );
    } finally {
      setSyncing(false);
    }
  }, [scopeKey]);

  const fetchGlobal = useCallback(async () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    try {
      const res = await fetch(`/api/dhikr-counters?scopeKey=${encodeURIComponent(scopeKey)}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data?.counters)) setGlobal(data.counters);
    } catch {
      return;
    }
  }, [scopeKey]);

  useEffect(() => {
    const boot = window.setTimeout(fetchGlobal, 0);
    const poll = window.setInterval(fetchGlobal, POLL_INTERVAL_MS);
    const flusher = window.setInterval(() => {
      if (document.visibilityState === "visible") flush();
    }, FLUSH_INTERVAL_MS);
    const onHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      window.clearTimeout(boot);
      window.clearInterval(poll);
      window.clearInterval(flusher);
      document.removeEventListener("visibilitychange", onHidden);
      flush();
    };
  }, [fetchGlobal, flush]);

  const handleTap = (key: string) => {
    setPersonal((prev) => {
      const next = { ...prev, [key]: (prev[key] || 0) + 1 };
      try {
        window.localStorage.setItem(PERSONAL_STORE, JSON.stringify(next));
      } catch {
        return next;
      }
      return next;
    });
    pending.current[key] = (pending.current[key] || 0) + 1;
    setBumpKey(key);
    window.setTimeout(() => setBumpKey(null), 260);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
    if (Object.values(pending.current).reduce((a, b) => a + b, 0) >= 12) flush();
  };

  const resetPersonal = (key: string) => {
    setPersonal((prev) => {
      const next = { ...prev };
      delete next[key];
      try {
        window.localStorage.setItem(PERSONAL_STORE, JSON.stringify(next));
      } catch {
        return next;
      }
      return next;
    });
  };

  const globalMap = new Map(global.map((g) => [g.key, g]));
  const active = COMMUNITY_DHIKR_COUNTERS.find((c) => c.key === activeKey) || COMMUNITY_DHIKR_COUNTERS[0];
  const activeGlobal = globalMap.get(active.key);
  const activePersonal = personal[active.key] || 0;
  const activePct = Math.min(100, Math.round((activePersonal / active.target) * 100));

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <YawmakBadge tone="gold">
            <Sparkles className="w-3.5 h-3.5" /> {subheading}
          </YawmakBadge>
          <h2 className="font-display text-2xl sm:text-3xl font-bold yawmak-gold-text">{heading}</h2>
          <p className="text-xs sm:text-sm text-[var(--yawmak-text-muted)] max-w-2xl leading-relaxed">{intro}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--yawmak-text-muted)]">
          <Users className="w-4 h-4 text-[var(--yawmak-gold)]" />
          <span>
            المشاركون في هذا العداد:{" "}
            <strong className="text-[var(--yawmak-gold-soft)]">
              {activeGlobal?.participantsCount ?? 0}
            </strong>
          </span>
          {syncing && <span className="opacity-70">— جارٍ الحفظ…</span>}
        </div>
      </div>

      <div className={`grid grid-cols-1 ${compact ? "" : "lg:grid-cols-12"} gap-5 items-start`}>
        <div className={compact ? "" : "lg:col-span-5"}>
          <YawmakCard glow className="yawmak-glass space-y-5">
            <div className="text-center space-y-1">
              <p className="text-xs text-[var(--yawmak-text-muted)]">الذكر المختار</p>
              <p className="font-quran text-2xl sm:text-3xl text-[var(--yawmak-text)]">{active.text}</p>
            </div>

            <button
              type="button"
              onClick={() => handleTap(active.key)}
              aria-label={`إضافة تسبيحة من ${active.label}`}
              className={`relative w-full rounded-3xl border border-[var(--yawmak-border)] overflow-hidden select-none cursor-pointer transition-all active:scale-[0.97] ${
                reduced ? "" : "yawmak-fade-up"
              }`}
              style={{
                background:
                  "linear-gradient(155deg, rgba(212,175,55,0.18), rgba(16,185,129,0.1) 55%, rgba(6,12,10,0.45))",
                minHeight: compact ? 132 : 176,
                boxShadow: "0 26px 60px -30px rgba(212,175,55,0.7)",
              }}
            >
              <div className="relative py-8 px-4 space-y-2">
                <div
                  key={`${active.key}-${activePersonal}`}
                  className={`text-6xl sm:text-7xl font-extrabold yawmak-gold-text font-mono ${
                    bumpKey === active.key && !reduced ? "yawmak-counter-bump" : ""
                  }`}
                >
                  {activePersonal}
                </div>
                <p className="text-xs text-[var(--yawmak-text-muted)]">
                  عدادك الشخصي — الهدف {active.target} • الإجمالي المشترك{" "}
                  <strong className="text-[var(--yawmak-gold-soft)]">{activeGlobal?.totalCount ?? 0}</strong>
                </p>
                <div className="mx-auto h-1.5 w-40 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full yawmak-gold-gradient transition-all duration-300"
                    style={{ width: `${activePct}%` }}
                  />
                </div>
                <p className="text-[11px] text-[var(--yawmak-gold-soft)] font-bold tracking-wider">
                  اضغط للتسبيح
                </p>
              </div>
            </button>

            <div className="flex items-center justify-between gap-2">
              <YawmakButton variant="ghost" size="sm" onClick={() => resetPersonal(active.key)}>
                <RotateCcw className="w-3.5 h-3.5" /> إعادة تعيين عدادي الشخصي
              </YawmakButton>
              {activePersonal >= active.target && (
                <YawmakBadge tone="emerald">
                  <Check className="w-3.5 h-3.5" /> اكتمل الهدف
                </YawmakBadge>
              )}
            </div>
          </YawmakCard>
        </div>

        <div className={compact ? "" : "lg:col-span-7"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMMUNITY_DHIKR_COUNTERS.map((item) => {
              const g = globalMap.get(item.key);
              const mine = personal[item.key] || 0;
              const isActive = item.key === active.key;
              return (
                <div
                  key={item.key}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  onClick={() => setActiveKey(item.key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveKey(item.key);
                    }
                  }}
                  aria-label={`اختيار ${item.label}`}
                  className={`yawmak-card rounded-2xl p-4 text-right space-y-2.5 transition-all cursor-pointer ${
                    isActive ? "border-[var(--yawmak-gold)] ring-1 ring-[var(--yawmak-gold)]/35" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-quran text-lg text-[var(--yawmak-text)] truncate">{item.text}</p>
                      <p className="text-[11px] text-[var(--yawmak-text-muted)]">{item.label}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTap(item.key);
                      }}
                      aria-label={`إضافة تسبيحة إلى ${item.label}`}
                      className="shrink-0 w-12 h-12 rounded-2xl yawmak-gold-gradient text-[#FFFFFF] font-extrabold text-xl flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--yawmak-text-muted)]">
                      الخاص: <strong className="text-[var(--yawmak-text)]">{mine}</strong> / {item.target}
                    </span>
                    <span className="text-[var(--yawmak-gold-soft)]">
                      المشترك: <strong>{g?.totalCount ?? 0}</strong>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <div
                      className="h-full yawmak-gold-gradient transition-all duration-300"
                      style={{ width: `${Math.min(100, (mine / item.target) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[var(--yawmak-text-muted)]">
                    <Users className="w-3 h-3" />
                    {g?.participantsCount ?? 0} مشارك
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-[var(--yawmak-text-muted)] pt-3 leading-relaxed">
            
            
          </p>
        </div>
      </div>
    </section>
  );
}
