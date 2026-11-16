"use client";

import React, { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  ListChecks,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "@/components/ui/icons";
import {
  YawmakBadge,
  YawmakButton,
  YawmakCard,
  YawmakDialog,
  YawmakEmptyState,
  YawmakInput,
  YawmakProgressBar,
  YawmakSkeleton,
  YawmakTextarea,
} from "@/components/ui/DesignSystem";
import { TasksIllustration } from "@/components/svg/YawmakArt";
import { useTasks } from "@/lib/useYawmakData";
import {
  createId,
  formatDateAr,
  todayKey,
  type TaskPriority,
  type YawTask,
} from "@/lib/localdb";

const PRIORITY_META: Record<TaskPriority, { label: string; className: string }> = {
  high: { label: "عالية", className: "bg-[#E05252]/12 text-[#C93F3F] border-[#E05252]/25" },
  medium: { label: "متوسطة", className: "bg-[#C79A45]/12 text-[#9C7219] border-[#C79A45]/25" },
  low: { label: "منخفضة", className: "bg-[#2FA36B]/12 text-[#218154] border-[#2FA36B]/25" },
};

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

const CATEGORIES = ["عام", "عمل", "دراسة", "صحة", "عبادة", "منزل"];

type FilterKey = "today" | "week" | "all" | "done";

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "عام",
  priority: "medium" as TaskPriority,
  dueAt: "",
};

export default function TasksView() {
  const { items: tasks, loading, persist, remove, reload } = useTasks();
  const [filter, setFilter] = useState<FilterKey>("today");
  const [sort, setSort] = useState<"priority" | "due">("priority");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (task: YawTask) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      dueAt: task.dueAt ? task.dueAt.slice(0, 16) : "",
    });
    setDialogOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) return;

    const now = new Date().toISOString();
    const existing = editingId ? tasks.find((t) => t.id === editingId) : null;

    const task: YawTask = {
      id: existing?.id || createId(),
      title: title.slice(0, 120),
      description: form.description.trim().slice(0, 400),
      category: form.category,
      priority: form.priority,
      dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
      done: existing?.done || false,
      completedAt: existing?.completedAt || null,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      order: existing?.order ?? tasks.length,
    };

    await persist(task);
    setDialogOpen(false);
  };

  const toggleDone = async (task: YawTask) => {
    const now = new Date().toISOString();
    await persist({
      ...task,
      done: !task.done,
      completedAt: !task.done ? now : null,
      updatedAt: now,
    });
    await reload();
  };

  const today = todayKey();

  const stats = useMemo(() => {
    const todays = tasks.filter((t) => (t.dueAt ? todayKey(new Date(t.dueAt)) === today : false));
    const doneToday = tasks.filter((t) => t.completedAt && todayKey(new Date(t.completedAt)) === today);
    const active = tasks.filter((t) => !t.done);
    const percent = tasks.length > 0 ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100) : 0;
    return {
      total: tasks.length,
      active: active.length,
      done: tasks.length - active.length,
      dueToday: todays.length,
      doneToday: doneToday.length,
      percent,
    };
  }, [tasks, today]);

  const visible = useMemo(() => {
    const now = new Date();
    const endOfWeek = new Date(now.getTime() + 7 * 86400000);

    let list = tasks;
    if (filter === "today") {
      list = tasks.filter((t) => (t.dueAt ? todayKey(new Date(t.dueAt)) === today : !t.done));
    } else if (filter === "week") {
      list = tasks.filter((t) => {
        if (!t.dueAt) return !t.done;
        const due = new Date(t.dueAt);
        return due >= now && due <= endOfWeek;
      });
    } else if (filter === "done") {
      list = tasks.filter((t) => t.done);
    }

    return [...list].sort((a, b) => {
      if (a.done !== b.done) return Number(a.done) - Number(b.done);
      if (sort === "priority" && PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority]) {
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      }
      const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      return aDue - bDue;
    });
  }, [tasks, filter, sort, today]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--yawmak-text)]">مهامي</h1>
          <p className="text-sm text-[var(--yawmak-text-muted)] mt-1">
            {stats.active} مهمة متبقية • {stats.doneToday} أُنجزت اليوم
          </p>
        </div>
        <YawmakButton size="lg" onClick={openCreate}>
          <Plus className="w-4 h-4" /> مهمة جديدة
        </YawmakButton>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <YawmakCard className="space-y-1.5">
          <p className="text-xs text-[var(--yawmak-text-muted)]">إنجاز اليوم</p>
          <p className="text-2xl font-bold text-[var(--yawmak-primary)]">{stats.percent}%</p>
          <YawmakProgressBar value={stats.percent} />
        </YawmakCard>
        <YawmakCard className="space-y-1">
          <p className="text-xs text-[var(--yawmak-text-muted)]">مهام اليوم</p>
          <p className="text-2xl font-bold">{stats.dueToday}</p>
        </YawmakCard>
        <YawmakCard className="space-y-1">
          <p className="text-xs text-[var(--yawmak-text-muted)]">قيد التنفيذ</p>
          <p className="text-2xl font-bold">{stats.active}</p>
        </YawmakCard>
        <YawmakCard className="space-y-1">
          <p className="text-xs text-[var(--yawmak-text-muted)]">مكتملة</p>
          <p className="text-2xl font-bold">{stats.done}</p>
        </YawmakCard>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: "today", label: "اليوم" },
            { id: "week", label: "الأسبوع" },
            { id: "all", label: "الكل" },
            { id: "done", label: "المكتملة" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`h-9 px-4 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
              filter === item.id
                ? "bg-[var(--yawmak-primary)] text-white border-transparent"
                : "bg-[var(--yawmak-card)] text-[var(--yawmak-text-muted)] border-[var(--yawmak-border)] hover:border-[var(--yawmak-primary)]/50 hover:text-[var(--yawmak-primary)]"
            }`}
          >
            {item.label}
          </button>
        ))}

        <div className="mr-auto flex items-center gap-1.5">
          <span className="text-xs text-[var(--yawmak-text-muted)]">الترتيب</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "priority" | "due")}
            className="h-9 px-3 rounded-xl bg-[var(--yawmak-card)] border border-[var(--yawmak-border)] text-xs text-[var(--yawmak-text)] outline-none cursor-pointer"
          >
            <option value="priority">حسب الأولوية</option>
            <option value="due">حسب الموعد</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <YawmakSkeleton className="h-24" />
          <YawmakSkeleton className="h-24" />
          <YawmakSkeleton className="h-24" />
        </div>
      ) : visible.length === 0 ? (
        <YawmakEmptyState
          icon={<TasksIllustration className="w-52 h-36" />}
          title="لا توجد مهام في هذا العرض"
          description=""
          action={
            <YawmakButton onClick={openCreate}>
              <Plus className="w-4 h-4" /> إضافة مهمة
            </YawmakButton>
          }
        />
      ) : (
        <div className="space-y-3">
          {visible.map((task) => {
            const meta = PRIORITY_META[task.priority];
            return (
              <YawmakCard
                key={task.id}
                className={`yawmak-card-3d flex items-start gap-4 !p-4 ${task.done ? "opacity-70" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => toggleDone(task)}
                  aria-label={task.done ? "إلغاء الإكمال" : "تحديد كمكتملة"}
                  className={`w-6 h-6 mt-0.5 rounded-lg border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    task.done
                      ? "bg-[var(--yawmak-primary)] border-transparent text-white"
                      : "border-[var(--yawmak-border)] hover:border-[var(--yawmak-primary)] text-transparent"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`font-semibold text-[var(--yawmak-text)] ${
                        task.done ? "line-through text-[var(--yawmak-text-muted)]" : ""
                      }`}
                    >
                      {task.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.className}`}>
                      {meta.label}
                    </span>
                    <YawmakBadge tone="neutral">{task.category}</YawmakBadge>
                  </div>

                  {task.description && (
                    <p className="text-xs text-[var(--yawmak-text-muted)] mt-1.5 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[var(--yawmak-text-muted)]">
                    {task.dueAt && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDateAr(task.dueAt)}
                      </span>
                    )}
                    {task.completedAt && (
                      <span className="inline-flex items-center gap-1 text-[#218154]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        أُنجزت {formatDateAr(task.completedAt)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(task)}
                    aria-label="تعديل المهمة"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--yawmak-text-muted)] hover:text-[var(--yawmak-primary)] hover:bg-[var(--yawmak-primary-tint)] transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(task.id)}
                    aria-label="حذف المهمة"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--yawmak-text-muted)] hover:text-[#C93F3F] hover:bg-[#E05252]/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </YawmakCard>
            );
          })}
        </div>
      )}

      <YawmakDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? "تعديل المهمة" : "مهمة جديدة"}
      >
        <form onSubmit={submit} className="space-y-4">
          <YawmakInput
            label="عنوان المهمة"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="مثال: مراجعة تقرير المشروع"
          />
          <YawmakTextarea
            label="وصف مختصر"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="تفاصيل قصيرة تساعدك على البدء"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--yawmak-text)]">الأولوية</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(PRIORITY_META) as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, priority: p }))}
                    className={`h-11 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      form.priority === p
                        ? "bg-[var(--yawmak-primary)] text-white border-transparent"
                        : "bg-[var(--yawmak-bg-elevated)] text-[var(--yawmak-text-muted)] border-[var(--yawmak-border)]"
                    }`}
                  >
                    {PRIORITY_META[p].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--yawmak-text)]">التصنيف</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full h-11 px-3 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border)] text-sm text-[var(--yawmak-text)] outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <YawmakInput
            label="التاريخ والوقت"
            type="datetime-local"
            value={form.dueAt}
            onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <YawmakButton type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
              إلغاء
            </YawmakButton>
            <YawmakButton type="submit">
              <Star className="w-4 h-4" />
              {editingId ? "حفظ التعديلات" : "إضافة المهمة"}
            </YawmakButton>
          </div>
        </form>
      </YawmakDialog>
    </div>
  );
}
