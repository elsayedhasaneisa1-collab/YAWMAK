"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Timer,
} from "@/components/ui/icons";
import {
  YawmakBadge,
  YawmakButton,
  YawmakCard,
  YawmakDialog,
  YawmakEmptyState,
  YawmakSkeleton,
} from "@/components/ui/DesignSystem";
import { FocusIllustration } from "@/components/svg/YawmakArt";
import { useFocusSessions, useTasks } from "@/lib/useYawmakData";
import {
  FOCUS_STATE_KEY,
  formatDuration,
  loadPrefs,
  savePrefs,
  todayKey,
  createId,
  type YawFocusSession,
} from "@/lib/localdb";

interface FocusState {
  mode: "focus" | "break";
  durationMs: number;
  endsAt: number;
  remainingMs: number;
  paused: boolean;
  taskId: string | null;
  taskTitle: string | null;
  sessionStart: number;
}

function readState(): FocusState | null {
  try {
    const raw = localStorage.getItem(FOCUS_STATE_KEY);
    return raw ? (JSON.parse(raw) as FocusState) : null;
  } catch {
    return null;
  }
}

function writeState(state: FocusState | null) {
  try {
    if (state) localStorage.setItem(FOCUS_STATE_KEY, JSON.stringify(state));
    else localStorage.removeItem(FOCUS_STATE_KEY);
  } catch {
    return;
  }
}

function computeRemaining(state: FocusState): number {
  if (state.paused) return Math.max(0, state.remainingMs);
  return Math.max(0, state.endsAt - Date.now());
}

const FOCUS_PRESETS = [15, 25, 45, 60];
const BREAK_PRESETS = [5, 10, 15];

export default function FocusView() {
  const { items: tasks } = useTasks();
  const { items: sessions, loading: sessionsLoading, persist: persistSession } = useFocusSessions();

  const [state, setState] = useState<FocusState | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [taskId, setTaskId] = useState<string>("");
  const [fullscreen, setFullscreen] = useState(false);
  const [endConfirmOpen, setEndConfirmOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const prefs = loadPrefs();
      setFocusMinutes(prefs.focusMinutes);
      setBreakMinutes(prefs.breakMinutes);
      const saved = readState();
      if (saved) {
        setState(saved);
        setRemaining(computeRemaining(saved));
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const completeSession = useCallback(
    async (finished: FocusState, aborted: boolean) => {
      const actualSeconds = Math.max(
        0,
        Math.round((finished.durationMs - computeRemaining(finished)) / 1000)
      );

      if (actualSeconds > 0) {
        const session: YawFocusSession = {
          id: createId(),
          taskId: finished.taskId,
          taskTitle: finished.taskTitle,
          mode: finished.mode,
          plannedMinutes: Math.round(finished.durationMs / 60000),
          actualSeconds,
          completed: !aborted,
          startedAt: new Date(finished.sessionStart).toISOString(),
          endedAt: new Date().toISOString(),
        };
        await persistSession(session);
      }

      if (finished.mode === "focus" && !aborted) {
        const next: FocusState = {
          mode: "break",
          durationMs: breakMinutes * 60000,
          endsAt: Date.now() + breakMinutes * 60000,
          remainingMs: breakMinutes * 60000,
          paused: false,
          taskId: finished.taskId,
          taskTitle: finished.taskTitle,
          sessionStart: Date.now(),
        };
        writeState(next);
        setState(next);
        setRemaining(computeRemaining(next));
      } else {
        writeState(null);
        setState(null);
        setRemaining(0);
      }
    },
    [breakMinutes, persistSession]
  );

  useEffect(() => {
    if (!state) return;

    const tick = () => {
      const left = computeRemaining(state);
      setRemaining(left);
      if (left <= 0) void completeSession(state, false);
    };

    const initial = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, 250);

    const onVisibility = () => tick();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [state, completeSession]);

  useEffect(() => {
    const onFsChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const start = (mode: "focus" | "break") => {
    const durationMs = (mode === "focus" ? focusMinutes : breakMinutes) * 60000;
    const task = tasks.find((t) => t.id === taskId) || null;
    const next: FocusState = {
      mode,
      durationMs,
      endsAt: Date.now() + durationMs,
      remainingMs: durationMs,
      paused: false,
      taskId: task?.id || null,
      taskTitle: task?.title || null,
      sessionStart: Date.now(),
    };
    writeState(next);
    setState(next);
    setRemaining(computeRemaining(next));

    const prefs = loadPrefs();
    savePrefs({ ...prefs, focusMinutes, breakMinutes });
  };

  const pause = () => {
    if (!state || state.paused) return;
    const next: FocusState = {
      ...state,
      paused: true,
      remainingMs: computeRemaining(state),
    };
    writeState(next);
    setState(next);
    setRemaining(next.remainingMs);
  };

  const resume = () => {
    if (!state || !state.paused) return;
    const next: FocusState = {
      ...state,
      paused: false,
      endsAt: Date.now() + state.remainingMs,
    };
    writeState(next);
    setState(next);
    setRemaining(next.remainingMs);
  };

  const endSession = async () => {
    if (!state) return;
    await completeSession(state, true);
    setEndConfirmOpen(false);
  };

  const reset = () => {
    writeState(null);
    setState(null);
    setRemaining(0);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await stageRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      setFullscreen(false);
    }
  };

  const todayStats = useMemo(() => {
    const today = todayKey();
    const todays = sessions.filter((s) => todayKey(new Date(s.startedAt)) === today);
    return {
      seconds: todays.reduce((acc, s) => acc + s.actualSeconds, 0),
      count: todays.length,
    };
  }, [sessions]);

  const [weekAgo, setWeekAgo] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setWeekAgo(Date.now() - 7 * 86400000), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const weekStats = useMemo(() => {
    const list = sessions.filter((s) => new Date(s.startedAt).getTime() >= weekAgo);
    return {
      seconds: list.reduce((acc, s) => acc + s.actualSeconds, 0),
      count: list.length,
    };
  }, [sessions, weekAgo]);

  const progress =
    state && state.durationMs > 0 ? ((state.durationMs - remaining) / state.durationMs) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--yawmak-text)]">التركيز</h1>
          <p className="text-sm text-[var(--yawmak-text-muted)] mt-1">
            {formatDuration(todayStats.seconds)} تركيز اليوم • {todayStats.count} جلسة
          </p>
        </div>
        <YawmakButton variant="outline" onClick={toggleFullscreen}>
          {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          {fullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}
        </YawmakButton>
      </div>

      <div ref={stageRef} className={fullscreen ? "bg-[var(--yawmak-bg)] min-h-screen p-6" : ""}>
        <YawmakCard glow className="space-y-7">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <YawmakBadge tone={state?.mode === "break" ? "emerald" : "gold"}>
              <Timer className="w-3.5 h-3.5" />
              {state ? (state.mode === "focus" ? "جلسة تركيز" : "استراحة") : "جاهز للبدء"}
            </YawmakBadge>
            {state?.taskTitle && <YawmakBadge tone="neutral">{state.taskTitle}</YawmakBadge>}
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative w-60 h-60 sm:w-72 sm:h-72">
              <svg viewBox="0 0 220 220" className="w-full h-full -rotate-90">
                <circle
                  cx="110"
                  cy="110"
                  r="96"
                  fill="none"
                  stroke="var(--yawmak-border)"
                  strokeWidth="10"
                />
                <circle
                  cx="110"
                  cy="110"
                  r="96"
                  fill="none"
                  stroke="var(--yawmak-primary)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 96}
                  strokeDashoffset={2 * Math.PI * 96 * (1 - progress / 100)}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-5xl sm:text-6xl font-bold text-[var(--yawmak-text)] font-mono tracking-tight">
                  {formatDuration(Math.round(remaining / 1000))}
                </p>
                <p className="text-xs text-[var(--yawmak-text-muted)] mt-2">
                  {state
                    ? state.paused
                      ? "متوقف مؤقتًا"
                      : "قيد التشغيل"
                    : `مدة الجلسة ${focusMinutes} دقيقة`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {!state && (
                <>
                  <YawmakButton size="lg" onClick={() => start("focus")}>
                    <Play className="w-4 h-4" /> بدء الجلسة
                  </YawmakButton>
                  <YawmakButton size="lg" variant="secondary" onClick={() => start("break")}>
                    بدء استراحة
                  </YawmakButton>
                </>
              )}

              {state && !state.paused && (
                <YawmakButton size="lg" variant="secondary" onClick={pause}>
                  <Pause className="w-4 h-4" /> إيقاف مؤقت
                </YawmakButton>
              )}

              {state && state.paused && (
                <YawmakButton size="lg" onClick={resume}>
                  <Play className="w-4 h-4" /> استكمال
                </YawmakButton>
              )}

              {state && (
                <>
                  <YawmakButton size="lg" variant="outline" onClick={() => setEndConfirmOpen(true)}>
                    إنهاء الجلسة
                  </YawmakButton>
                  <YawmakButton size="lg" variant="ghost" onClick={reset}>
                    <RotateCcw className="w-4 h-4" /> إعادة ضبط
                  </YawmakButton>
                </>
              )}
            </div>
          </div>

          {!state && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-[var(--yawmak-border)]">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[var(--yawmak-text-muted)]">مدة التركيز</p>
                <div className="flex flex-wrap gap-1.5">
                  {FOCUS_PRESETS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFocusMinutes(m)}
                      className={`h-9 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        focusMinutes === m
                          ? "bg-[var(--yawmak-primary)] text-white border-transparent"
                          : "border-[var(--yawmak-border)] text-[var(--yawmak-text-muted)] hover:border-[var(--yawmak-primary)]/50"
                      }`}
                    >
                      {m} د
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-[var(--yawmak-text-muted)]">مدة الاستراحة</p>
                <div className="flex flex-wrap gap-1.5">
                  {BREAK_PRESETS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setBreakMinutes(m)}
                      className={`h-9 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        breakMinutes === m
                          ? "bg-[var(--yawmak-primary)] text-white border-transparent"
                          : "border-[var(--yawmak-border)] text-[var(--yawmak-text-muted)] hover:border-[var(--yawmak-primary)]/50"
                      }`}
                    >
                      {m} د
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-[var(--yawmak-text-muted)]">المهمة المرتبطة</p>
                <select
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border)] text-xs text-[var(--yawmak-text)] outline-none cursor-pointer"
                >
                  <option value="">بدون مهمة</option>
                  {tasks
                    .filter((t) => !t.done)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}
        </YawmakCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <YawmakCard className="space-y-3">
          <h2 className="text-base font-bold text-[var(--yawmak-text)]">إحصائيات التركيز</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[var(--yawmak-text-muted)]">اليوم</p>
              <p className="text-2xl font-bold text-[var(--yawmak-primary)]">
                {formatDuration(todayStats.seconds)}
              </p>
              <p className="text-[11px] text-[var(--yawmak-text-muted)]">{todayStats.count} جلسة</p>
            </div>
            <div>
              <p className="text-xs text-[var(--yawmak-text-muted)]">آخر 7 أيام</p>
              <p className="text-2xl font-bold text-[var(--yawmak-text)]">
                {formatDuration(weekStats.seconds)}
              </p>
              <p className="text-[11px] text-[var(--yawmak-text-muted)]">{weekStats.count} جلسة</p>
            </div>
          </div>
        </YawmakCard>

        <YawmakCard className="space-y-3">
          <h2 className="text-base font-bold text-[var(--yawmak-text)]">سجل الجلسات</h2>
          {sessionsLoading ? (
            <YawmakSkeleton className="h-24" />
          ) : sessions.length === 0 ? (
            <YawmakEmptyState
              icon={<FocusIllustration className="w-52 h-36" />}
              title="لا توجد جلسات بعد"
              description=""
            />
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto yawmak-scroll-slim">
              {sessions.slice(0, 12).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border)] text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--yawmak-text)] truncate">
                      {s.taskTitle || (s.mode === "focus" ? "جلسة تركيز" : "استراحة")}
                    </p>
                    <p className="text-[var(--yawmak-text-muted)]">
                      {new Date(s.startedAt).toLocaleString("ar-EG", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[var(--yawmak-text)]">
                      {formatDuration(s.actualSeconds)}
                    </span>
                    {s.completed && <CheckCircle2 className="w-4 h-4 text-[#2FA36B]" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </YawmakCard>
      </div>

      <YawmakDialog
        open={endConfirmOpen}
        onClose={() => setEndConfirmOpen(false)}
        title="إنهاء الجلسة الحالية"
        description="سيتم حفظ الوقت المنجز حتى الآن في سجل جلساتك."
        tone="warning"
        footer={
          <>
            <YawmakButton variant="ghost" size="sm" onClick={() => setEndConfirmOpen(false)}>
              إلغاء
            </YawmakButton>
            <YawmakButton variant="danger" size="sm" onClick={endSession}>
              إنهاء وحفظ
            </YawmakButton>
          </>
        }
      />
    </div>
  );
}
