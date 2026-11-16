import { NextResponse } from "next/server";
import { fetchSurahList, fetchSurahDetail } from "@/lib/islamic-api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const surahParam = searchParams.get("surah");
    const reciter = searchParams.get("reciter") || "ar.alafasy";

    if (surahParam) {
      const num = Number(surahParam);
      if (!Number.isFinite(num) || num < 1 || num > 114) {
        return NextResponse.json({ error: "رقم السورة غير صالح" }, { status: 400 });
      }
      const detail = await fetchSurahDetail(num, reciter);
      return NextResponse.json(detail, {
        headers: { "Cache-Control": "public, max-age=86400" },
      });
    }

    const list = await fetchSurahList();
    return NextResponse.json(list, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return NextResponse.json({ error: "تعذر تحميل بيانات القرآن الكريم" }, { status: 500 });
  }
}
