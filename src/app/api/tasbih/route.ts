import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasbihProgress } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { requireUser, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();
    const list = await db
      .select()
      .from(tasbihProgress)
      .where(eq(tasbihProgress.userId, user.id))
      .orderBy(desc(tasbihProgress.updatedAt))
      .limit(40);
    return NextResponse.json({ items: list });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر تحميل سجل المسبحة" }, { status: 500 });
  }
}

// Batch-save endpoint: saves local state only when user chooses or switches dhikr (never per-tap!)
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const items = Array.isArray(body?.items) ? body.items : body ? [body] : [];

    for (const raw of items.slice(0, 20)) {
      const dhikrKey = typeof raw?.dhikrKey === "string" ? raw.dhikrKey.trim().slice(0, 60) : "";
      const dhikrText = typeof raw?.dhikrText === "string" ? raw.dhikrText.trim().slice(0, 180) : "";
      const count = Math.max(0, Math.min(1000000, Number(raw?.count || 0)));
      const target = Math.max(1, Math.min(10000, Number(raw?.target || 33)));
      const totalAllTime = Math.max(count, Math.min(10000000, Number(raw?.totalAllTime || count)));

      if (!dhikrKey || !dhikrText) continue;

      await db
        .insert(tasbihProgress)
        .values({
          userId: user.id,
          dhikrKey,
          dhikrText,
          count,
          target,
          totalAllTime,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [tasbihProgress.userId, tasbihProgress.dhikrKey],
          set: { dhikrText, count, target, totalAllTime, updatedAt: new Date() },
        });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر حفظ تقدم المسبحة" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const dhikrKey = searchParams.get("dhikrKey");
    if (!dhikrKey) {
      return NextResponse.json({ error: "معرف الذكر مطلوب" }, { status: 400 });
    }
    await db
      .delete(tasbihProgress)
      .where(and(eq(tasbihProgress.userId, user.id), eq(tasbihProgress.dhikrKey, dhikrKey)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر حذف الذكر" }, { status: 500 });
  }
}
