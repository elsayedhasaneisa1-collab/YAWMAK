export type TaskPriority = "low" | "medium" | "high";

export interface YawTask {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  dueAt: string | null;
  done: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface YawNote {
  id: string;
  title: string;
  body: string;
  category: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface YawFocusSession {
  id: string;
  taskId: string | null;
  taskTitle: string | null;
  mode: "focus" | "break";
  plannedMinutes: number;
  actualSeconds: number;
  completed: boolean;
  startedAt: string;
  endedAt: string;
}

export interface YawBackup {
  version: 1;
  exportedAt: string;
  tasks: YawTask[];
  notes: YawNote[];
  sessions: YawFocusSession[];
}

export type StorageMode = "indexeddb" | "memory";

const DB_NAME = "yawmak-local";
const DB_VERSION = 1;
const STORE_TASKS = "tasks";
const STORE_NOTES = "notes";
const STORE_SESSIONS = "focusSessions";

const memory: Record<string, Map<string, unknown>> = {
  [STORE_TASKS]: new Map(),
  [STORE_NOTES]: new Map(),
  [STORE_SESSIONS]: new Map(),
};

let mode: StorageMode = "indexeddb";
let dbPromise: Promise<IDBDatabase> | null = null;

export function getStorageMode(): StorageMode {
  return mode;
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      mode = "memory";
      reject(new Error("indexeddb-unavailable"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_TASKS)) db.createObjectStore(STORE_TASKS, { keyPath: "id" });
      if (!db.objectStoreNames.contains(STORE_NOTES)) db.createObjectStore(STORE_NOTES, { keyPath: "id" });
      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        db.createObjectStore(STORE_SESSIONS, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      mode = "memory";
      reject(request.error || new Error("indexeddb-error"));
    };
    request.onblocked = () => {
      mode = "memory";
      reject(new Error("indexeddb-blocked"));
    };
  });
  return dbPromise;
}

function memoryList<T>(store: string): T[] {
  return Array.from(memory[store].values()) as T[];
}

function memoryPut<T>(store: string, value: T & { id: string }): void {
  memory[store].set(value.id, value);
}

function memoryDelete(store: string, id: string): void {
  memory[store].delete(id);
}

async function withStore<T>(
  store: string,
  run: (objectStore: IDBObjectStore) => IDBRequest<T>
): Promise<T | null> {
  try {
    const db = await openDatabase();
    return await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      const request = run(tx.objectStore(store));
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error || new Error("store-error"));
    });
  } catch {
    mode = "memory";
    return null;
  }
}

export async function listStore<T>(store: string): Promise<T[]> {
  const result = await withStore<T[]>(store, (s) => s.getAll() as IDBRequest<T[]>);
  if (result) return result;
  return memoryList<T>(store);
}

export async function putRecord<T extends { id: string }>(store: string, value: T): Promise<void> {
  const result = await withStore(store, (s) => s.put(value) as IDBRequest<IDBValidKey>);
  if (result === null) memoryPut(store, value);
}

export async function deleteRecord(store: string, id: string): Promise<void> {
  const result = await withStore(store, (s) => s.delete(id) as IDBRequest<undefined>);
  if (result === null) memoryDelete(store, id);
}

export async function listTasks(): Promise<YawTask[]> {
  const tasks = await listStore<YawTask>(STORE_TASKS);
  return tasks.sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
}

export async function saveTask(task: YawTask): Promise<void> {
  await putRecord(STORE_TASKS, task);
}

export async function deleteTask(id: string): Promise<void> {
  await deleteRecord(STORE_TASKS, id);
}

export async function listNotes(): Promise<YawNote[]> {
  const notes = await listStore<YawNote>(STORE_NOTES);
  return notes.sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt)
  );
}

export async function saveNote(note: YawNote): Promise<void> {
  await putRecord(STORE_NOTES, note);
}

export async function deleteNote(id: string): Promise<void> {
  await deleteRecord(STORE_NOTES, id);
}

export async function listSessions(): Promise<YawFocusSession[]> {
  const sessions = await listStore<YawFocusSession>(STORE_SESSIONS);
  return sessions.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function saveSession(session: YawFocusSession): Promise<void> {
  await putRecord(STORE_SESSIONS, session);
}

export async function exportBackup(): Promise<YawBackup> {
  const [tasks, notes, sessions] = await Promise.all([
    listTasks(),
    listNotes(),
    listSessions(),
  ]);
  return { version: 1, exportedAt: new Date().toISOString(), tasks, notes, sessions };
}

function isTaskLike(value: unknown): value is YawTask {
  const v = value as YawTask;
  return Boolean(v && typeof v.id === "string" && typeof v.title === "string");
}

function isNoteLike(value: unknown): value is YawNote {
  const v = value as YawNote;
  return Boolean(v && typeof v.id === "string" && typeof v.title === "string" && typeof v.body === "string");
}

function isSessionLike(value: unknown): value is YawFocusSession {
  const v = value as YawFocusSession;
  return Boolean(v && typeof v.id === "string" && typeof v.startedAt === "string");
}

export async function importBackup(
  raw: string
): Promise<{ tasks: number; notes: number; sessions: number; error?: string }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { tasks: 0, notes: 0, sessions: 0, error: "ملف النسخة الاحتياطية غير صالح" };
  }

  const data = parsed as Partial<YawBackup>;
  if (!data || typeof data !== "object" || !Array.isArray(data.tasks)) {
    return { tasks: 0, notes: 0, sessions: 0, error: "بنية النسخة الاحتياطية غير مدعومة" };
  }

  const tasks = data.tasks.filter(isTaskLike).slice(0, 5000);
  const notes = (Array.isArray(data.notes) ? data.notes : []).filter(isNoteLike).slice(0, 5000);
  const sessions = (Array.isArray(data.sessions) ? data.sessions : [])
    .filter(isSessionLike)
    .slice(0, 5000);

  for (const task of tasks) await putRecord(STORE_TASKS, task);
  for (const note of notes) await putRecord(STORE_NOTES, note);
  for (const session of sessions) await putRecord(STORE_SESSIONS, session);

  return { tasks: tasks.length, notes: notes.length, sessions: sessions.length };
}

export async function clearAllData(): Promise<void> {
  for (const store of [STORE_TASKS, STORE_NOTES, STORE_SESSIONS]) {
    const result = await withStore(store, (s) => s.clear() as IDBRequest<undefined>);
    if (result === null) memory[store].clear();
    else memory[store].clear();
  }
}

export const PREFS_KEY = "yawmak_prefs_v1";
export const FOCUS_STATE_KEY = "yawmak_focus_state_v1";

export interface YawPrefs {
  mode: "light" | "dark" | "system";
  focusMinutes: number;
  breakMinutes: number;
  taskSort: "priority" | "due" | "created";
}

export const DEFAULT_PREFS: YawPrefs = {
  mode: "light",
  focusMinutes: 25,
  breakMinutes: 5,
  taskSort: "priority",
};

export function loadPrefs(): YawPrefs {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(PREFS_KEY) : null;
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw) as Partial<YawPrefs>;
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(prefs: YawPrefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    return;
  }
}

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatDateAr(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ar-EG", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
