"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  YmCalendar,
  YmCards,
  YmChart,
  YmCheck,
  YmFocus,
  YmNotes,
  YmPlay,
  YmPlus,
  YmSparkle,
  YmTasks,
} from "@/components/svg/YawmakGlyphs";
import {
  EmptyStateArt,
  NotesIllustration,
  TasksIllustration,
} from "@/components/svg/YawmakArt";
import {
  YawmakButton,
  YawmakCard,
  YawmakEmptyState,
  YawmakProgressBar,
  YawmakSkeleton,
} from "@/components/ui/DesignSystem";
import { useFocusSessions, useNotes, useTasks } from "@/lib/useYawmakData";
import { formatDuration, todayKey } from "@/lib/localdb";
import LocalDataPanel from "./LocalDataPanel";

const YawmakOrb = dynamic(() => import("@/components/three/YawmakOrb"), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[240px] rounded-3xl bg-white/50" />,
});

const SHORTCUTS = [
  { href: "/tasks", label: "مهامي", icon: YmTasks, hint: "المهام والمواعيد" },
  { href: "/focus", label: "التركيز", icon: YmFocus, hint: "المؤقت والجلسات" },
  { href: "/notes", label: "ملاحظاتي", icon: YmNotes, hint: "المحرر والحفظ" },
  { href: "/invitations", label: "بطاقاتي", icon: YmCards, hint: "البطاقات والمشاركة" },
];

export default function DashboardView() {
  const router = useRouter();
  const { items: tasks, loading: tasksLoading } = useTasks();
  const { items: notes, loading: notesLoading } = useNotes();
  const { items: sessions } = useFocusSessions();

  const [clock, setClock] = useState({ dateLabel: "", greeting: "" });
  const heroRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const now = new Date();
      let gregorian = now.toLocaleDateString("ar-EG", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      try {
        const hijri = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(now);
        gregorian = `${gregorian} — ${hijri}`;
      } catch {
        gregorian = gregorian;
      }
      const hour = now.getHours();
      const greeting = hour < 12 ? "صباح الخير" : hour < 18 ? "طاب يومك" : "مساء الخير";
      setClock({ dateLabel: gregorian, greeting });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const today = todayKey();

  const summary = useMemo(() => {
    const dueToday = tasks.filter((t) => t.dueAt && todayKey(new Date(t.dueAt)) === today);
    const pending = tasks.filter((t) => !t.done);
    const scope = dueToday.length > 0 ? dueToday : tasks;
    const doneInScope = scope.filter((t) => t.done).length;
    const percent = scope.length > 0 ? Math.round((doneInScope / scope.length) * 100) : 0;
    const focusSeconds = sessions
      .filter((s) => todayKey(new Date(s.startedAt)) === today)
      .reduce((acc, s) => acc + s.actualSeconds, 0);

    return { dueToday, pending, percent, focusSeconds };
  }, [tasks, sessions, today]);

  const handleHeroMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -py * 5, y: px * 5 });
  };

  return (
    <div className="space-y-8">
      <section
        ref={heroRef}
        onPointerMove={handleHeroMove}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        className="ym-panel yawmak-enterprise-surface yawmak-3d-stage yawmak-3d-panel rounded-[28px] overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 sm:p-9">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--yawmak-primary)]/10 text-[var(--yawmak-primary)] text-[11px] font-bold">
                <YmCalendar size={14} />
                {clock.dateLabel || "…"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 text-[var(--yawmak-text-muted)] text-[11px] font-semibold border border-[var(--yawmak-border)]">
                <YmSparkle size={14} />
                {summary.dueToday.length} مهمة اليوم
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-bold text-[var(--yawmak-text)] leading-[1.35]">
                {clock.greeting || "مرحبًا"}
              </h1>
              <p className="text-base sm:text-lg text-[var(--yawmak-text-muted)]">
                ما الذي تريد إنجازه اليوم؟
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link href="/focus">
                <YawmakButton size="lg">
                  <YmPlay size={18} /> بدء التركيز
                </YawmakButton>
              </Link>
              <Link href="/tasks">
                <YawmakButton size="lg" variant="secondary">
                  <YmPlus size={18} /> مهمة جديدة
                </YawmakButton>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="yawmak-card-3d rounded-2xl bg-[var(--yawmak-card)] border border-[var(--yawmak-border)] p-3.5">
                <p className="text-[11px] text-[var(--yawmak-text-muted)]">الإنجاز</p>
                <p className="text-2xl font-bold text-[var(--yawmak-primary)]">{summary.percent}%</p>
                <YawmakProgressBar value={summary.percent} className="mt-1.5" />
              </div>
              <div className="yawmak-card-3d rounded-2xl bg-[var(--yawmak-card)] border border-[var(--yawmak-border)] p-3.5">
                <p className="text-[11px] text-[var(--yawmak-text-muted)]">متبقية</p>
                <p className="text-2xl font-bold text-[var(--yawmak-text)]">{summary.pending.length}</p>
              </div>
              <div className="yawmak-card-3d rounded-2xl bg-[var(--yawmak-card)] border border-[var(--yawmak-border)] p-3.5">
                <p className="text-[11px] text-[var(--yawmak-text-muted)]">تركيز اليوم</p>
                <p className="text-2xl font-bold text-[var(--yawmak-text)]">
                  {formatDuration(summary.focusSeconds)}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div
              className="ym-tilt-soft rounded-[24px] bg-white/70 border border-[var(--yawmak-border)] p-2"
              style={
                {
                  "--tilt-x": `${tilt.x}deg`,
                  "--tilt-y": `${tilt.y}deg`,
                } as React.CSSProperties
              }
            >
              <YawmakOrb className="w-full h-[280px] sm:h-[320px]" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <YawmakCard className="space-y-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--yawmak-text)] flex items-center gap-2">
              <YmTasks size={20} className="text-[var(--yawmak-primary)]" /> مهام اليوم
            </h2>
            <Link
              href="/tasks"
              className="text-xs font-semibold text-[var(--yawmak-primary)] hover:underline"
            >
              كل المهام
            </Link>
          </div>

          {tasksLoading ? (
            <YawmakSkeleton className="h-36" />
          ) : summary.dueToday.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-2 py-4">
              <TasksIllustration className="w-48 h-32" />
              <p className="text-sm font-semibold text-[var(--yawmak-text)]">لا توجد مهام لليوم</p>
              <YawmakButton size="sm" variant="secondary" onClick={() => router.push("/tasks")}>
                <YmPlus size={16} /> إضافة مهمة
              </YawmakButton>
            </div>
          ) : (
            <div className="space-y-2.5">
              {summary.dueToday.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--yawmak-bg)] border border-[var(--yawmak-border)]"
                >
                  <span
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${
                      task.done
                        ? "bg-[var(--yawmak-primary)] border-transparent text-white"
                        : "border-[var(--yawmak-border)] text-transparent"
                    }`}
                  >
                    <YmCheck size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium truncate ${
                        task.done
                          ? "line-through text-[var(--yawmak-text-muted)]"
                          : "text-[var(--yawmak-text)]"
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.dueAt && (
                      <p className="text-[11px] text-[var(--yawmak-text-muted)]">
                        {new Date(task.dueAt).toLocaleTimeString("ar-EG", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </YawmakCard>

        <YawmakCard className="space-y-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--yawmak-text)] flex items-center gap-2">
              <YmNotes size={20} className="text-[var(--yawmak-primary)]" /> أحدث الملاحظات
            </h2>
            <Link
              href="/notes"
              className="text-xs font-semibold text-[var(--yawmak-primary)] hover:underline"
            >
              كل الملاحظات
            </Link>
          </div>

          {notesLoading ? (
            <YawmakSkeleton className="h-36" />
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-2 py-4">
              <NotesIllustration className="w-48 h-32" />
              <p className="text-sm font-semibold text-[var(--yawmak-text)]">لا توجد ملاحظات بعد</p>
              <YawmakButton size="sm" variant="secondary" onClick={() => router.push("/notes")}>
                <YmPlus size={16} /> ملاحظة جديدة
              </YawmakButton>
            </div>
          ) : (
            <div className="space-y-2.5">
              {notes.slice(0, 4).map((note) => (
                <Link key={note.id} href="/notes" className="block">
                  <div className="p-3.5 rounded-2xl bg-[var(--yawmak-bg)] border border-[var(--yawmak-border)] hover:border-[var(--yawmak-primary)]/45 transition-colors">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[var(--yawmak-text)] truncate flex-1">
                        {note.title || "بدون عنوان"}
                      </p>
                      {note.pinned && (
                        <span className="text-[10px] font-bold text-[var(--yawmak-primary)] bg-[var(--yawmak-primary)]/10 px-2 py-0.5 rounded-full">
                          مثبّتة
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--yawmak-text-muted)] truncate mt-1">
                      {note.body || "ملاحظة فارغة"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </YawmakCard>
      </section>

      <section>
        <h2 className="text-lg font-bold text-[var(--yawmak-text)] mb-3 flex items-center gap-2">
          <YmChart size={20} className="text-[var(--yawmak-primary)]" /> الأقسام
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SHORTCUTS.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="group">
                <div className="yawmak-card-3d yawmak-card rounded-2xl p-5 h-full">
                  <div className="w-11 h-11 rounded-2xl bg-[var(--yawmak-primary-tint)] flex items-center justify-center text-[var(--yawmak-primary)] mb-3">
                    <Icon size={22} />
                  </div>
                  <p className="font-bold text-[var(--yawmak-text)]">{item.label}</p>
                  <p className="text-[11px] text-[var(--yawmak-text-muted)] mt-0.5">{item.hint}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <LocalDataPanel />
    </div>
  );
}

export function DashboardEmptyArt() {
  return <EmptyStateArt className="w-40 h-28" />;
}
