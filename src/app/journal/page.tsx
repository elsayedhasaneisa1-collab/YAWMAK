"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookMarked,
  Plus,
  CheckCircle2,
  Trash2,
  Star,
  Archive,
  Target,
  Flame,
  Lock,
} from "@/components/ui/icons";
import {
  YawmakCard,
  YawmakBadge,
  YawmakButton,
  YawmakInput,
  YawmakTextarea,
  YawmakProgressBar,
} from "@/components/ui/DesignSystem";
import { useYawmak } from "@/components/providers/YawmakProvider";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
}

interface HabitItem {
  id: string;
  title: string;
  category: string;
  currentStreak: number;
  totalCompletions: number;
  lastCompletedDate: string | null;
}

interface GoalItem {
  id: string;
  title: string;
  description: string | null;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: string;
}

export default function JournalPage() {
  const { user, toast } = useYawmak();
  const [tab, setTab] = useState<"notes" | "habits" | "goals">("notes");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [habitLimit, setHabitLimit] = useState<number>(3);
  const [search, setSearch] = useState("");

  // Forms
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("reflection");
  const [habitTitle, setHabitTitle] = useState("");
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState(30);
  const [goalUnit, setGoalUnit] = useState("جزء");

  const load = () => {
    if (!user) return;
    fetch("/api/journal")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setEntries(d.entries || []);
        setHabits(d.habits || []);
        setGoals(d.goals || []);
        setHabitLimit(d.limits?.habitLimit ?? 3);
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    load();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <YawmakCard glow className="space-y-4 py-10">
          <Lock className="w-10 h-10 text-[var(--yawmak-gold)] mx-auto" />
          <h1 className="font-display text-2xl font-bold">مساحة التنظيم والدفتر الخاص</h1>
          <p className="text-sm text-[var(--yawmak-text-muted)]">
            جميع ملاحظاتك وعاداتك وأهدافك خاصة بك وحدك. سجّل الدخول للبدء.
          </p>
          <Link href="/login">
            <YawmakButton variant="primary">تسجيل الدخول</YawmakButton>
          </Link>
        </YawmakCard>
      </div>
    );
  }

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "entry", title: noteTitle, content: noteContent, category: noteCategory }),
    });
    if (res.ok) {
      setNoteTitle("");
      setNoteContent("");
      load();
      toast({ type: "success", title: "تم حفظ الملاحظة في دفترك الخاص" });
    }
  };

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "habit", title: habitTitle, category: "worship", targetCount: 1 }),
    });
    const d = await res.json();
    if (!res.ok) {
      toast({ type: "error", title: d.error || "تعذر إضافة العادة" });
    } else {
      setHabitTitle("");
      load();
      toast({ type: "success", title: "تمت إضافة العادة اليومية" });
    }
  };

  const completeHabitToday = async (id: string) => {
    const res = await fetch("/api/journal", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "habit", id, completeToday: true }),
    });
    const d = await res.json();
    if (res.ok) {
      toast({ type: "success", title: d.alreadyDone ? "تم إنجازها بالفعل اليوم" : "أحسنت! تم تسجيل إنجاز اليوم" });
      load();
    }
  };

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "goal", title: goalTitle, targetValue: goalTarget, unit: goalUnit }),
    });
    if (res.ok) {
      setGoalTitle("");
      load();
      toast({ type: "success", title: "تم إنشاء الهدف بنجاح" });
    }
  };

  const bumpGoal = async (g: GoalItem) => {
    await fetch("/api/journal", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "goal", id: g.id, currentValue: g.currentValue + 1 }),
    });
    load();
  };

  const deleteItem = async (kind: "entry" | "habit" | "goal", id: string) => {
    await fetch(`/api/journal?kind=${kind}&id=${encodeURIComponent(id)}`, { method: "DELETE" });
    load();
  };

  const todayIso = new Date().toISOString().slice(0, 10);
  const filteredEntries = entries.filter(
    (e) => !e.isArchived && (e.title.includes(search) || e.content.includes(search))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <YawmakBadge tone="gold">
            <BookMarked className="w-3.5 h-3.5" /> YAWMAK JOURNAL — خاص بك وحدك
          </YawmakBadge>
          <h1 className="font-display text-3xl font-bold yawmak-gold-text">الدفتر الشخصي والعادات والأهداف</h1>
        </div>

        <div className="flex gap-2">
          {(
            [
              { id: "notes", label: `الملاحظات (${entries.length})` },
              { id: "habits", label: `العادات (${habits.length}/${habitLimit === -1 ? "∞" : habitLimit})` },
              { id: "goals", label: `الأهداف (${goals.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                tab === t.id
                  ? "yawmak-gold-gradient text-[#FFFFFF] border-transparent"
                  : "bg-white/[0.03] border-[var(--yawmak-border-subtle)] text-[var(--yawmak-text-muted)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "notes" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <YawmakCard>
              <form onSubmit={addNote} className="space-y-3">
                <YawmakInput label="عنوان الملاحظة" required value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} />
                <div className="space-y-1">
                  <label className="block text-sm font-medium">التصنيف</label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border-subtle)] text-sm"
                  >
                    <option value="reflection">تأملات وخواطر</option>
                    <option value="plan">خطط وأفكار</option>
                    <option value="quran">تدبر قرآني</option>
                    <option value="gratitude">نعم وشكر</option>
                    <option value="reminder">تذكير</option>
                  </select>
                </div>
                <YawmakTextarea label="المحتوى" required value={noteContent} onChange={(e) => setNoteContent(e.target.value)} />
                <YawmakButton type="submit" variant="primary" className="w-full">
                  <Plus className="w-4 h-4" /> حفظ الملاحظة
                </YawmakButton>
              </form>
            </YawmakCard>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <YawmakInput placeholder="ابحث في ملاحظاتك..." value={search} onChange={(e) => setSearch(e.target.value)} />
            {filteredEntries.map((item) => (
              <YawmakCard key={item.id} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-base">{item.title}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch("/api/journal", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ kind: "entry", id: item.id, isFavorite: !item.isFavorite }),
                        });
                        load();
                      }}
                      className={`p-1.5 rounded-lg cursor-pointer ${item.isFavorite ? "text-[var(--yawmak-gold)]" : "text-[var(--yawmak-text-muted)]"}`}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch("/api/journal", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ kind: "entry", id: item.id, isArchived: true }),
                        });
                        load();
                      }}
                      className="p-1.5 rounded-lg text-[var(--yawmak-text-muted)] cursor-pointer"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteItem("entry", item.id)}
                      className="p-1.5 rounded-lg text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[var(--yawmak-text-muted)] whitespace-pre-line leading-relaxed">{item.content}</p>
              </YawmakCard>
            ))}
          </div>
        </div>
      )}

      {tab === "habits" && (
        <div className="space-y-4">
          <YawmakCard>
            <form onSubmit={addHabit} className="flex flex-col sm:flex-row gap-3">
              <YawmakInput
                placeholder="أضف عادة يومية جديدة (مثال: قراءة ورد القرآن بعد الفجر)"
                required
                value={habitTitle}
                onChange={(e) => setHabitTitle(e.target.value)}
              />
              <YawmakButton type="submit" variant="primary" className="shrink-0">
                <Plus className="w-4 h-4" /> إضافة عادة
              </YawmakButton>
            </form>
            <p className="text-[11px] text-[var(--yawmak-text-muted)] mt-2">
              الحد المسموح لباقة {user.membershipPlan}: {habitLimit === -1 ? "غير محدود" : `${habitLimit} عادات`} (المستخدم حاليًا: {habits.length}).
            </p>
          </YawmakCard>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map((h) => {
              const doneToday = h.lastCompletedDate === todayIso;
              return (
                <YawmakCard key={h.id} className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base">{h.title}</h3>
                    <button
                      type="button"
                      onClick={() => deleteItem("habit", h.id)}
                      className="text-red-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--yawmak-text-muted)]">
                    <span className="flex items-center gap-1 text-[var(--yawmak-gold-soft)]">
                      <Flame className="w-4 h-4" /> استمرارية: {h.currentStreak}
                    </span>
                    <span>الإجمالي: {h.totalCompletions}</span>
                  </div>
                  <YawmakButton
                    variant={doneToday ? "success" : "primary"}
                    size="sm"
                    className="w-full"
                    onClick={() => completeHabitToday(h.id)}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {doneToday ? "أُنجزت اليوم ✓" : "تأكيد إنجاز اليوم"}
                  </YawmakButton>
                </YawmakCard>
              );
            })}
          </div>
        </div>
      )}

      {tab === "goals" && (
        <div className="space-y-4">
          <YawmakCard>
            <form onSubmit={addGoal} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5">
                <YawmakInput label="الهدف" required value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder="مثال: حفظ جزء عم" />
              </div>
              <div className="sm:col-span-2">
                <YawmakInput label="العدد المستهدف" type="number" min={1} value={goalTarget} onChange={(e) => setGoalTarget(Number(e.target.value))} />
              </div>
              <div className="sm:col-span-3">
                <YawmakInput label="الوحدة" value={goalUnit} onChange={(e) => setGoalUnit(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <YawmakButton type="submit" variant="primary" className="w-full">إضافة</YawmakButton>
              </div>
            </form>
          </YawmakCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g) => (
              <YawmakCard key={g.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <Target className="w-4 h-4 text-[var(--yawmak-gold)]" /> {g.title}
                  </h3>
                  <button type="button" onClick={() => deleteItem("goal", g.id)} className="text-red-400 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <YawmakProgressBar value={g.currentValue} max={g.targetValue} />
                <div className="flex items-center justify-between text-xs">
                  <span>
                    {g.currentValue} / {g.targetValue} {g.unit}
                  </span>
                  <YawmakButton size="sm" variant="secondary" onClick={() => bumpGoal(g)}>
                    +1 تقدم
                  </YawmakButton>
                </div>
              </YawmakCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
