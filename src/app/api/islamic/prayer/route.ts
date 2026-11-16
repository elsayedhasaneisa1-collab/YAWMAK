import { NextResponse } from "next/server";
import { fetchPrayerTimes } from "@/lib/islamic-api";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await ensureSeeded();
    const { searchParams } = new URL(req.url);
    const governorate = searchParams.get("governorate") || "القاهرة";
    const method = Number(searchParams.get("method") || "5");
    const safeMethod = Number.isFinite(method) && method >= 1 && method <= 15 ? method : 5;

    const data = await fetchPrayerTimes(governorate, safeMethod);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600" },
    });
  } catch {
    return NextResponse.json({ error: "تعذر جلب مواقيت الصلاة" }, { status: 500 });
  }
}
