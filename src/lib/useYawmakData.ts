"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  YawNote,
  YawTask,
  YawFocusSession,
  deleteNote,
  deleteTask,
  listNotes,
  listSessions,
  listTasks,
  saveNote,
  saveSession,
  saveTask,
  getStorageMode,
  type StorageMode,
} from "./localdb";

function useAsyncCollection<T>(
  loader: () => Promise<T[]>,
  deps: unknown[] = []
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const data = await loader();
      setItems(data);
      setError(null);
    } catch {
      setError("تعذر تحميل البيانات المحلية");
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    const timer = window.setTimeout(reload, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, ...deps]);

  return { items, setItems, loading, error, reload };
}

export function useTasks() {
  const collection = useAsyncCollection<YawTask>(listTasks);

  const persist = useCallback(
    async (task: YawTask) => {
      await saveTask(task);
      await collection.reload();
    },
    [collection]
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteTask(id);
      await collection.reload();
    },
    [collection]
  );

  return { ...collection, persist, remove };
}

export function useNotes() {
  const collection = useAsyncCollection<YawNote>(listNotes);

  const persist = useCallback(
    async (note: YawNote) => {
      await saveNote(note);
      await collection.reload();
    },
    [collection]
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteNote(id);
      await collection.reload();
    },
    [collection]
  );

  return { ...collection, persist, remove };
}

export function useFocusSessions() {
  const collection = useAsyncCollection<YawFocusSession>(listSessions);

  const persist = useCallback(
    async (session: YawFocusSession) => {
      await saveSession(session);
      await collection.reload();
    },
    [collection]
  );

  return { ...collection, persist };
}

export function useStorageMode(): StorageMode {
  const [mode, setMode] = useState<StorageMode>("indexeddb");
  useEffect(() => {
    const timer = window.setTimeout(() => setMode(getStorageMode()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  return mode;
}
