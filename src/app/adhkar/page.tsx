"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Copy, Share2, Bookmark, RotateCcw, CheckCircle2 } from "@/components/ui/icons";
import { YawmakCard, YawmakBadge, YawmakProgressBar } from "@/components/ui/DesignSystem";
import { ADHKAR_CATEGORIES, VERIFIED_ADHKAR } from "@/lib/islamic-data";
import { useYawmak } from "@/components/providers/YawmakProvider";

export default function AdhkarPage() {
  const { user, toast } = useYawmak();
  const [category, setCategory] = useState<string>("morning");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    fetch("/api/bookmarks?type=adhkar")
      .then((r) => (r.ok ? r.json() : { bookmarks: [] }))
      .then((d) => setFavorites(new Set((d.bookmarks || []).map((b: { itemKey: string }) => b.itemKey))))
      .catch(() => undefined);
  }, [user]);

  const list = VERIFIED_ADHKAR.filter((item) => item.category === category);
  const completedCount = list.filter((i) => (counts[i.id] || 0) >= i.repeat).length;

  const increment = (id: string, max: number) => {
    setCounts((prev) => ({
      ...prev,
      [id]: Math.min(max, (prev[id] || 0) + 1),
    }));
  };

  const toggleFavorite = async (id: string, text: string, reference: string) => {
    if (!user) {
      toast({ type: "warning", title: "يرجى تسجيل الدخول لحفظ الأذكار في المفضلة" });
      return;
    }
    if (favorites.has(id)) {
      await fetch(`/api/bookmarks?itemType=adhkar&itemKey=${encodeURIComponent(id)}`, { method: "DELETE" });
      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType: "adhkar", itemKey: id, title: text.slice(0, 120), subtitle: reference }),
      });
      setFavorites((prev) => new Set(prev).add(id));
      toast({ type: "success", title: "تمت الإضافة إلى المفضلة" });
    }
  };

  const copyText = async (text: string, ref: string) => {
    await navigator.clipboard.writeText(`${text}\n— ${ref}`).catch(() => undefined);
    toast({ type: "success", title: "تم نسخ الذكر مع المرجع" });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-2">
        <YawmakBadge tone="emerald">
          <Sparkles className="w-3.5 h-3.5" /> YAWMAK ADHKAR — حصن المسلم الموثق
        </YawmakBadge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold yawmak-gold-text">مكتبة الأذكار</h1>
        <p className="text-xs sm:text-sm text-[var(--yawmak-text-muted)]">
          أذكار موثقة بمصادرها.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {ADHKAR_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              category === c.id
                ? "yawmak-gold-gradient text-[#FFFFFF] border-transparent"
                : "bg-white/[0.03] border-[var(--yawmak-border-subtle)] text-[var(--yawmak-text-muted)] hover:text-[var(--yawmak-text)]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Progress Banner */}
      <YawmakCard className="!p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span>
            التقدم في القسم الحالي: <strong>{completedCount}</strong> من {list.length}
          </span>
          <button
            type="button"
            onClick={() => setCounts({})}
            className="text-[var(--yawmak-text-muted)] hover:text-[var(--yawmak-gold-soft)] flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> تصفير
          </button>
        </div>
        <YawmakProgressBar value={completedCount} max={Math.max(1, list.length)} />
      </YawmakCard>

      {/* Adhkar Cards */}
      <div className="space-y-4">
        {list.map((item) => {
          const current = counts[item.id] || 0;
          const done = current >= item.repeat;
          const isFav = favorites.has(item.id);
          return (
            <YawmakCard
              key={item.id}
              className={`space-y-4 transition-all ${done ? "border-emerald-500/45 bg-emerald-950/20" : ""}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <YawmakBadge tone={done ? "emerald" : "gold"}>
                  {done ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> مكتمل ({item.repeat}/{item.repeat})
                    </>
                  ) : (
                    `التكرار: ${current} / ${item.repeat}`
                  )}
                </YawmakBadge>
                <span className="text-[11px] text-[var(--yawmak-text-muted)]">
                  {item.source} — {item.reference}
                </span>
              </div>

              <p className="font-quran text-xl sm:text-2xl leading-[2.2] text-[var(--yawmak-text)]">
                {item.text}
              </p>

              {item.note && (
                <p className="text-xs text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                  {item.note}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--yawmak-border-subtle)]">
                <button
                  type="button"
                  onClick={() => increment(item.id, item.repeat)}
                  className={`px-5 h-10 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-95 ${
                    done
                      ? "bg-emerald-600/30 text-emerald-200 border border-emerald-400/40"
                      : "yawmak-gold-gradient text-[#FFFFFF]"
                  }`}
                >
                  {done ? "تم الإتمام ✓" : `اضغط للعد (${item.repeat - current} متبقٍ)`}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => copyText(item.text, item.reference)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> نسخ
                  </button>
                  <button
                    type="button"
                    onClick={() => copyText(item.text, item.reference)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" /> مشاركة
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(item.id, item.text, item.reference)}
                    className={`p-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer ${
                      isFav ? "bg-[var(--yawmak-gold)]/20 text-[var(--yawmak-gold-soft)]" : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" /> {isFav ? "مفضل" : "حفظ"}
                  </button>
                </div>
              </div>
            </YawmakCard>
          );
        })}
      </div>
    </div>
  );
}
