import { NextResponse } from "next/server";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { reportCreateSchema } from "@/lib/validation";
import { checkRateLimit, getClientFingerprint } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const fp = getClientFingerprint(req, user?.id || "anon");
    const rl = await checkRateLimit(`report:${fp}`, 8, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "تم تجاوز الحد المؤقت للبلاغات" }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const parsed = reportCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const [created] = await db
      .insert(reports)
      .values({
        reporterId: user?.id || null,
        targetType: parsed.data.targetType,
        targetId: parsed.data.targetId,
        reason: parsed.data.reason,
        details: parsed.data.details || null,
      })
      .returning();

    return NextResponse.json(
      { report: created, message: "شكرًا لمساهمتك في حماية مجتمع يومك. سيراجع المشرفون البلاغ." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "تعذر إرسال البلاغ" }, { status: 500 });
  }
}
