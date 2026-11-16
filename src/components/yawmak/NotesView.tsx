"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Pin, Plus, Search, Trash2 } from "@/components/ui/icons";
import {
  YawmakButton,
  YawmakCard,
  YawmakDialog,
  YawmakEmptyState,
  YawmakInput,
  YawmakSkeleton,
} from "@/components/ui/DesignSystem";
import { NotesIllustration } from "@/components/svg/YawmakArt";
import { useNotes } from "@/lib/useYawmakData";
import { createId, formatDateAr, type YawNote } from "@/lib/localdb";

const NOTE_CATEGORIES = ["عام", "أفكار", "عمل", "دراسة", "يوميات"];

export default function NotesView() {
  const { items: notes, loading, persist, remove } = useNotes();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<YawNote>>({ title: "", body: "", category: "عام" });
  const [savedLabel, setSavedLabel] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const baselineRef = useRef<string>("");
  const dirtyRef = useRef(false);
  const saveTimer = useRef<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
    );
  }, [notes, query]);

  const activeNote = notes.find((n) => n.id === activeId) || null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!activeId && notes.length > 0) {
        selectNote(notes[0]);
      }
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes.length]);

  function selectNote(note: YawNote) {
    setActiveId(note.id);
    const content = JSON.stringify({ title: note.title, body: note.body, category: note.category });
    baselineRef.current = content;
    dirtyRef.current = false;
    setDraft({ title: note.title, body: note.body, category: note.category, pinned: note.pinned });
    setSavedLabel("");
  }

  function updateDraft(patch: Partial<YawNote>) {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      const content = JSON.stringify({
        title: next.title,
        body: next.body,
        category: next.category,
      });
      if (content !== baselineRef.current) {
        dirtyRef.current = true;
        scheduleAutosave(next);
      }
      return next;
    });
  }

  function scheduleAutosave(next: Partial<YawNote>) {
    if (!activeId) return;
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void flushSave(next);
    }, 700);
  }

  async function flushSave(next: Partial<YawNote>) {
    if (!activeId) return;
    const note: YawNote = {
      id: activeId,
      title: (next.title ?? "").slice(0, 140),
      body: (next.body ?? "").slice(0, 20000),
      category: next.category ?? "عام",
      pinned: Boolean(next.pinned),
      createdAt: activeNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await persist(note);
    baselineRef.current = JSON.stringify({
      title: note.title,
      body: note.body,
      category: note.category,
    });
    dirtyRef.current = false;
    setSavedLabel("تم الحفظ");
  }

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current && activeId) {
        void flushSave(draft);
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, draft]);

  async function createNote() {
    const now = new Date().toISOString();
    const note: YawNote = {
      id: createId(),
      title: "ملاحظة جديدة",
      body: "",
      category: "عام",
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    await persist(note);
    selectNote(note);
    setActiveId(note.id);
  }

  async function togglePin() {
    if (!activeNote) return;
    await persist({ ...activeNote, pinned: !activeNote.pinned, updatedAt: new Date().toISOString() });
    setDraft((d) => ({ ...d, pinned: !activeNote.pinned }));
  }

  async function confirmDelete() {
    if (!activeId) return;
    await remove(activeId);
    setActiveId(null);
    setDeleteOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--yawmak-text)]">ملاحظاتي</h1>
          <p className="text-sm text-[var(--yawmak-text-muted)] mt-1">
            {notes.length} ملاحظة {savedLabel && `• ${savedLabel}`}
          </p>
        </div>
        <YawmakButton size="lg" onClick={createNote}>
          <Plus className="w-4 h-4" /> ملاحظة جديدة
        </YawmakButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-4 space-y-3">
          <YawmakCard className="!p-4 space-y-3">
            <YawmakInput
              placeholder="ابحث في ملاحظاتك..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="yawmak-scroll-slim max-h-[560px] overflow-y-auto space-y-2">
              {loading ? (
                <>
                  <YawmakSkeleton className="h-20" />
                  <YawmakSkeleton className="h-20" />
                </>
              ) : filtered.length === 0 ? (
                <p className="text-xs text-[var(--yawmak-text-muted)] text-center py-8">لا توجد نتائج</p>
              ) : (
                filtered.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => selectNote(note)}
                    className={`w-full text-right p-3.5 rounded-xl border transition-colors cursor-pointer ${
                      note.id === activeId
                        ? "bg-[var(--yawmak-primary-tint)] border-[var(--yawmak-primary)]/45"
                        : "bg-[var(--yawmak-card)] border-[var(--yawmak-border)] hover:border-[var(--yawmak-primary)]/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-[var(--yawmak-text)] truncate">
                        {note.title || "بدون عنوان"}
                      </p>
                      {note.pinned && <Pin className="w-3.5 h-3.5 text-[var(--yawmak-primary)] shrink-0" />}
                    </div>
                    <p className="text-[11px] text-[var(--yawmak-text-muted)] mt-1 truncate">
                      {note.body || "ملاحظة فارغة"}
                    </p>
                    <p className="text-[10px] text-[var(--yawmak-text-muted)] mt-1.5">
                      {formatDateAr(note.updatedAt)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </YawmakCard>
        </div>

        <div className="lg:col-span-8">
          {!activeNote ? (
            <YawmakEmptyState
              icon={<NotesIllustration className="w-52 h-36" />}
              title="اختر ملاحظة أو أنشئ واحدة جديدة"
              description=""
              action={
                <YawmakButton onClick={createNote}>
                  <Plus className="w-4 h-4" /> ملاحظة جديدة
                </YawmakButton>
              }
            />
          ) : (
            <YawmakCard className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[200px]">
                  <input
                    value={draft.title ?? ""}
                    onChange={(e) => updateDraft({ title: e.target.value })}
                    placeholder="عنوان الملاحظة"
                    className="w-full bg-transparent text-xl font-bold text-[var(--yawmak-text)] outline-none border-b border-transparent focus:border-[var(--yawmak-primary)] transition-colors pb-1"
                  />
                </div>

                <select
                  value={draft.category ?? "عام"}
                  onChange={(e) => updateDraft({ category: e.target.value })}
                  className="h-9 px-3 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border)] text-xs text-[var(--yawmak-text)] outline-none cursor-pointer"
                >
                  {NOTE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={togglePin}
                  aria-label="تثبيت الملاحظة"
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                    draft.pinned
                      ? "bg-[var(--yawmak-primary)] text-white border-transparent"
                      : "border-[var(--yawmak-border)] text-[var(--yawmak-text-muted)] hover:text-[var(--yawmak-primary)]"
                  }`}
                >
                  <Pin className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  aria-label="حذف الملاحظة"
                  className="w-9 h-9 rounded-xl border border-[var(--yawmak-border)] flex items-center justify-center text-[var(--yawmak-text-muted)] hover:text-[#C93F3F] hover:border-[#E05252]/50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <textarea
                value={draft.body ?? ""}
                onChange={(e) => updateDraft({ body: e.target.value })}
                placeholder="اكتب ملاحظتك هنا..."
                className="w-full min-h-[380px] p-4 rounded-2xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border)] focus:border-[var(--yawmak-primary)] text-[var(--yawmak-text)] leading-[2.1] text-[15px] outline-none transition-colors resize-y"
                spellCheck={false}
              />

              <div className="flex items-center justify-between text-[11px] text-[var(--yawmak-text-muted)]">
                <span>آخر تعديل: {formatDateAr(activeNote.updatedAt)}</span>
                <span>{dirtyRef.current ? "جارٍ الحفظ..." : savedLabel || "محفوظة"}</span>
              </div>
            </YawmakCard>
          )}
        </div>
      </div>

      <YawmakDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="حذف الملاحظة"
        description="سيتم حذف الملاحظة نهائيًا من جهازك."
        tone="danger"
        footer={
          <>
            <YawmakButton variant="ghost" size="sm" onClick={() => setDeleteOpen(false)}>
              إلغاء
            </YawmakButton>
            <YawmakButton variant="danger" size="sm" onClick={confirmDelete}>
              حذف
            </YawmakButton>
          </>
        }
      />
    </div>
  );
}
