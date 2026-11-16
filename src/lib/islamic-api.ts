import { db } from "@/db";
import { apiHealthChecks } from "@/db/schema";
import { sql } from "drizzle-orm";
import { findGovernorate } from "./constants";
import { FALLBACK_SURAHS, getHijriDateFormatted, type SurahSummary } from "./islamic-data";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T, ttlMs: number) {
  if (memoryCache.size > 250) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }
  memoryCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

async function recordApiHealth(
  apiName: string,
  endpoint: string,
  ok: boolean,
  responseTimeMs: number,
  errorMsg?: string
) {
  try {
    await db
      .insert(apiHealthChecks)
      .values({
        apiName,
        endpoint,
        status: ok ? (responseTimeMs > 3000 ? "degraded" : "healthy") : "down",
        responseTimeMs,
        checksCount: 1,
        errorCount: ok ? 0 : 1,
        lastError: ok ? null : errorMsg || "Request failed",
        lastCheckedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: apiHealthChecks.apiName,
        set: {
          status: ok ? (responseTimeMs > 3000 ? "degraded" : "healthy") : "down",
          responseTimeMs,
          checksCount: sql`${apiHealthChecks.checksCount} + 1`,
          errorCount: ok ? apiHealthChecks.errorCount : sql`${apiHealthChecks.errorCount} + 1`,
          lastError: ok ? null : errorMsg || "Request failed",
          lastCheckedAt: new Date(),
        },
      });
  } catch {
    // Non-blocking health check update
  }
}

export interface PrayerTimesData {
  governorate: string;
  method: number;
  source: "aladhan" | "fallback";
  dateGregorian: string;
  dateHijri: string;
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  upcomingDays: Array<{
    date: string;
    hijri: string;
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  }>;
}

export async function fetchPrayerTimes(governorateName = "القاهرة", method = 5): Promise<PrayerTimesData> {
  const gov = findGovernorate(governorateName) || findGovernorate("القاهرة")!;
  const todayKey = new Date().toISOString().slice(0, 10);
  const cacheKey = `prayer:${gov.id}:${method}:${todayKey}`;

  const cached = getCached<PrayerTimesData>(cacheKey);
  if (cached) return cached;

  const url = `https://api.aladhan.com/v1/timings/${todayKey.split("-").reverse().join("-")}?latitude=${gov.lat}&longitude=${gov.lng}&method=${method}`;
  const started = Date.now();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 21600 } });
    clearTimeout(timer);
    const elapsed = Date.now() - started;

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const d = json?.data;
    if (!d?.timings) throw new Error("Invalid AlAdhan payload");

    await recordApiHealth("AlAdhan Prayer & Hijri", "https://api.aladhan.com/v1/timings", true, elapsed);

    const cleanTime = (t: string) => (t || "00:00").split(" ")[0];
    const hijri = d.date?.hijri;
    const hijriStr = hijri
      ? `${hijri.weekday?.ar || ""} ${hijri.day || ""} ${hijri.month?.ar || ""} ${hijri.year || ""} هـ`
      : getHijriDateFormatted().hijriFull;

    // Generate next 5 days estimate cleanly based on today without hammering external API
    const upcomingDays: PrayerTimesData["upcomingDays"] = [];
    for (let i = 1; i <= 5; i++) {
      const nextDate = new Date(Date.now() + i * 86400000);
      upcomingDays.push({
        date: nextDate.toLocaleDateString("ar-EG", { weekday: "short", day: "numeric", month: "short" }),
        hijri: getHijriDateFormatted(nextDate).hijriFull,
        Fajr: cleanTime(d.timings.Fajr),
        Dhuhr: cleanTime(d.timings.Dhuhr),
        Asr: cleanTime(d.timings.Asr),
        Maghrib: cleanTime(d.timings.Maghrib),
        Isha: cleanTime(d.timings.Isha),
      });
    }

    const result: PrayerTimesData = {
      governorate: gov.nameAr,
      method,
      source: "aladhan",
      dateGregorian: getHijriDateFormatted().gregorianFull,
      dateHijri: hijriStr,
      timings: {
        Fajr: cleanTime(d.timings.Fajr),
        Sunrise: cleanTime(d.timings.Sunrise),
        Dhuhr: cleanTime(d.timings.Dhuhr),
        Asr: cleanTime(d.timings.Asr),
        Maghrib: cleanTime(d.timings.Maghrib),
        Isha: cleanTime(d.timings.Isha),
      },
      upcomingDays,
    };

    setCached(cacheKey, result, 6 * 60 * 60 * 1000);
    return result;
  } catch (err) {
    await recordApiHealth(
      "AlAdhan Prayer & Hijri",
      "https://api.aladhan.com/v1/timings",
      false,
      Date.now() - started,
      err instanceof Error ? err.message : "Network error"
    );

    const h = getHijriDateFormatted();
    return {
      governorate: gov.nameAr,
      method,
      source: "fallback",
      dateGregorian: h.gregorianFull,
      dateHijri: h.hijriFull,
      timings: {
        Fajr: "04:32",
        Sunrise: "06:01",
        Dhuhr: "11:58",
        Asr: "15:28",
        Maghrib: "17:55",
        Isha: "19:16",
      },
      upcomingDays: Array.from({ length: 5 }, (_, idx) => {
        const nd = new Date(Date.now() + (idx + 1) * 86400000);
        return {
          date: nd.toLocaleDateString("ar-EG", { weekday: "short", day: "numeric", month: "short" }),
          hijri: getHijriDateFormatted(nd).hijriFull,
          Fajr: "04:32",
          Dhuhr: "11:58",
          Asr: "15:28",
          Maghrib: "17:55",
          Isha: "19:16",
        };
      }),
    };
  }
}

export async function fetchSurahList(): Promise<{ surahs: SurahSummary[]; source: "alquran_cloud" | "fallback" }> {
  const cacheKey = "quran:surahs:all";
  const cached = getCached<{ surahs: SurahSummary[]; source: "alquran_cloud" | "fallback" }>(cacheKey);
  if (cached) return cached;

  const started = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch("https://api.alquran.cloud/v1/surah", {
      signal: controller.signal,
      next: { revalidate: 86400 },
    });
    clearTimeout(timer);
    const elapsed = Date.now() - started;

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const list = json?.data;
    if (!Array.isArray(list) || list.length !== 114) throw new Error("Invalid surah list");

    await recordApiHealth("AlQuran Cloud", "https://api.alquran.cloud/v1/surah", true, elapsed);

    const surahs: SurahSummary[] = list.map((s: Record<string, unknown>) => ({
      number: Number(s.number),
      name: String(s.name),
      englishName: String(s.englishName),
      ayahCount: Number(s.numberOfAyahs),
      revelationType: s.revelationType === "Medinan" ? "مدنية" : "مكية",
    }));

    const payload = { surahs, source: "alquran_cloud" as const };
    setCached(cacheKey, payload, 24 * 60 * 60 * 1000);
    return payload;
  } catch (err) {
    await recordApiHealth(
      "AlQuran Cloud",
      "https://api.alquran.cloud/v1/surah",
      false,
      Date.now() - started,
      err instanceof Error ? err.message : "Network error"
    );
    return { surahs: [...FALLBACK_SURAHS], source: "fallback" };
  }
}

export interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  revelationType: "مكية" | "مدنية";
  ayahCount: number;
  source: "alquran_cloud" | "unavailable";
  ayahs: Array<{
    number: number;
    numberInSurah: number;
    text: string;
    juz: number;
    page: number;
    audioUrl: string;
  }>;
}

export async function fetchSurahDetail(surahNumber: number, reciterEdition = "ar.alafasy"): Promise<SurahDetail> {
  const safeNum = Math.min(114, Math.max(1, Math.floor(surahNumber)));
  const cacheKey = `quran:surah:${safeNum}:${reciterEdition}`;
  const cached = getCached<SurahDetail>(cacheKey);
  if (cached) return cached;

  const started = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(
      `https://api.alquran.cloud/v1/surah/${safeNum}/editions/quran-uthmani,${encodeURIComponent(reciterEdition)}`,
      { signal: controller.signal, next: { revalidate: 86400 } }
    );
    clearTimeout(timer);
    const elapsed = Date.now() - started;

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const editions = json?.data;
    if (!Array.isArray(editions) || editions.length < 1) throw new Error("Invalid surah payload");

    const textEdition = editions[0];
    const audioEdition = editions[1];
    const audioAyahs = Array.isArray(audioEdition?.ayahs) ? audioEdition.ayahs : [];

    await recordApiHealth("AlQuran Cloud", "https://api.alquran.cloud/v1/surah", true, elapsed);

    const detail: SurahDetail = {
      number: textEdition.number,
      name: textEdition.name,
      englishName: textEdition.englishName,
      revelationType: textEdition.revelationType === "Medinan" ? "مدنية" : "مكية",
      ayahCount: textEdition.numberOfAyahs,
      source: "alquran_cloud",
      ayahs: (textEdition.ayahs || []).map((a: Record<string, unknown>, index: number) => ({
        number: Number(a.number),
        numberInSurah: Number(a.numberInSurah),
        text: String(a.text),
        juz: Number(a.juz || 1),
        page: Number(a.page || 1),
        audioUrl:
          String(audioAyahs[index]?.audio || "") ||
          `https://cdn.islamic.network/quran/audio/128/${reciterEdition}/${a.number}.mp3`,
      })),
    };

    setCached(cacheKey, detail, 24 * 60 * 60 * 1000);
    return detail;
  } catch (err) {
    await recordApiHealth(
      "AlQuran Cloud",
      "https://api.alquran.cloud/v1/surah",
      false,
      Date.now() - started,
      err instanceof Error ? err.message : "Network error"
    );

    const summary = FALLBACK_SURAHS.find((s) => s.number === safeNum);
    return {
      number: safeNum,
      name: summary?.name || `سورة رقم ${safeNum}`,
      englishName: summary?.englishName || `Surah ${safeNum}`,
      revelationType: summary?.revelationType || "مكية",
      ayahCount: summary?.ayahCount || 0,
      source: "unavailable",
      ayahs: [],
    };
  }
}
