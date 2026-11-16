"use client";

import React, { useEffect, useState } from "react";
import { HeartHandshake, Search, Copy, Bookmark, Plus, Trash2, Lock } from "@/components/ui/icons";
import {
  YawmakCard,
  YawmakBadge,
  YawmakButton,
  YawmakInput,
  YawmakTextarea,
} from "@/components/ui/DesignSystem";
import { VERIFIED_DUAS } from "@/lib/islamic-data";
import { useYawmak } from "@/components/providers/YawmakProvider";

interface PersonalDua {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function DuaPage() {
  const { user, toast } = useYawmak();
  const [tab, setTab] = useState<"all" | "quran" | "sunnah" | "general" | "box">("all");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [personalDuas, setPersonalDuas] = useState<PersonalDua[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [saving, setSaving] = useState(false);

  const loadPersonalBox = () => {
    if (!user) return;
    fetch("/api/journal")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.entries) return;
        setPersonalDuas(d.entries.filter((e: { category: string }) => e.category === "dua"));
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    if (!user) return;
    fetch("/api/bookmarks?type=dua")
      .then((r) => (r.ok ? r.json() : { bookmarks: [] }))
      .then((d) => setFavorites(new Set((d.bookmarks || []).map((b: { itemKey: string }) => b.itemKey))))
      .catch(() => undefined);
    loadPersonalBox();
  }, [user]);

  const filtered = VERIFIED_DUAS.filter((d) => {
    if (tab !== "all" && tab !== "box" && d.category !== tab) return false;
    if (search.trim()) {
      const q = search.trim();
      return d.title.includes(q) || d.text.includes(q) || d.reference.includes(q);
    }
    return true;
  });

  const toggleFav = async (id: string, title: string, ref: string) => {
    if (!user) {
      toast({ type: "warning", title: "سجّل الدخول لحفظ الأدعية في المفضلة" });
      return;
    }
    if (favorites.has(id)) {
      await fetch(`/api/bookmarks?itemType=dua&itemKey=${encodeURIComponent(id)}`, { method: "DELETE" });
      setFavorites((p) => {
        const n = new Set(p);
        n.delete(id);
        return n;
      });
    } else {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType: "dua", itemKey: id, title, subtitle: ref }),
      });
      setFavorites((p) => new Set(p).add(id));
      toast({ type: "success", title: "تم حفظ الدعاء في المفضلة" });
    }
  };

  const addPersonalDua = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ type: "warning", title: "سجّل الدخول لاستخدام صندوق الدعاء الشخصي" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "entry", title: newTitle, content: newContent, category: "dua" }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewContent("");
        loadPersonalBox();
        toast({ type: "success", title: "تم حفظ دعائك الخاص بسرية تامة" });
      }
    } finally {
      setSaving(false);
    }
  };

  const removePersonalDua = async (id: string) => {
    await fetch(`/api/journal?id=${encodeURIComponent(id)}&kind=entry`, { method: "DELETE" });
    loadPersonalBox();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-2">
        <YawmakBadge tone="gold">
          <HeartHandshake className="w-3.5 h-3.5" /> YAWMAK DUA — أدعية موثقة وصندوق خاص
        </YawmakBadge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold yawmak-gold-text">مكتبة الأدعية</h1>
        <p className="text-xs sm:text-sm text-[var(--yawmak-text-muted)]">
          أدعية قرآنية ومأثورة وعامة.
        </p>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: "الكل" },
              { id: "quran", label: "أدعية القرآن" },
              { id: "sunnah", label: "أدعية مأثورة" },
              { id: "general", label: "أدعية عامة" },
              { id: "box", label: "صندوق الدعاء الشخصي" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                tab === t.id
                  ? "yawmak-gold-gradient text-[#FFFFFF] border-transparent"
                  : "bg-white/[0.03] border-[var(--yawmak-border-subtle)] text-[var(--yawmak-text-muted)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab !== "box" && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[var(--yawmak-text-muted)] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في الأدعية..."
              className="w-full h-10 pr-9 pl-3 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border-subtle)] text-xs outline-none focus:border-[var(--yawmak-gold)]"
            />
          </div>
        )}
      </div>

      {tab === "box" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <YawmakCard className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--yawmak-gold-soft)]">
                <Lock className="w-4 h-4" /> أضف دعاءً خاصًا بك
              </div>
              <p className="text-xs text-[var(--yawmak-text-muted)]">
                صندوق الدعاء الشخصي خاص بك وحدك ولا يطلع عليه أحد.
              </p>
              <form onSubmit={addPersonalDua} className="space-y-3">
                <YawmakInput
                  label="عنوان الدعاء"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: دعاء للوالدين أو لتيسير أمر"
                />
                <YawmakTextarea
                  label="نص الدعاء"
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="اكتب ما في قلبك..."
                />
                <YawmakButton type="submit" variant="primary" loading={saving} className="w-full">
                  <Plus className="w-4 h-4" /> حفظ في صندوقي
                </YawmakButton>
              </form>
            </YawmakCard>
          </div>
          <div className="lg:col-span-7 space-y-3">
            {!user ? (
              <YawmakCard>
                <p className="text-sm text-[var(--yawmak-text-muted)]">يرجى تسجيل الدخول للوصول إلى صندوق الدعاء الشخصي الخاص بك.</p>
              </YawmakCard>
            ) : personalDuas.length === 0 ? (
              <YawmakCard>
                <p className="text-sm text-[var(--yawmak-text-muted)]">صندوقك فارغ حاليًا. أضف أول دعاء شخصي لتعود إليه يوميًا.</p>
              </YawmakCard>
            ) : (
              personalDuas.map((d) => (
                <YawmakCard key={d.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-[var(--yawmak-gold-soft)]">{d.title}</h3>
                    <button
                      type="button"
                      onClick={() => removePersonalDua(d.id)}
                      className="text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-quran text-lg leading-loose">{d.content}</p>
                </YawmakCard>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((dua) => {
            const fav = favorites.has(dua.id);
            return (
              <YawmakCard key={dua.id} className="flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-[var(--yawmak-gold-soft)]">{dua.title}</h2>
                    <YawmakBadge tone={dua.category === "quran" ? "gold" : dua.category === "sunnah" ? "emerald" : "neutral"}>
                      {dua.category === "quran" ? "قرآني" : dua.category === "sunnah" ? "مأثور" : "عام"}
                    </YawmakBadge>
                  </div>
                  <p className="font-quran text-xl leading-[2.2]">{dua.text}</p>
                </div>

                <div className="pt-3 border-t border-[var(--yawmak-border-subtle)] flex items-center justify-between gap-2 text-xs text-[var(--yawmak-text-muted)]">
                  <span className="truncate">{dua.source} — {dua.reference}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${dua.text}\n— ${dua.reference}`).catch(() => undefined);
                        toast({ type: "success", title: "تم نسخ الدعاء" });
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFav(dua.id, dua.title, dua.reference)}
                      className={`p-2 rounded-lg cursor-pointer ${fav ? "bg-[var(--yawmak-gold)]/20 text-[var(--yawmak-gold-soft)]" : "bg-white/5 hover:bg-white/10"}`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </YawmakCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
