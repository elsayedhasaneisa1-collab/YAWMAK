import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser, AuthError, logAudit } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const skipped = Boolean(body?.skipped);

    if (!user.onboardingCompleted) {
      await db
        .update(profiles)
        .set({ onboardingCompleted: true, updatedAt: new Date() })
        .where(eq(profiles.id, user.id));

      await logAudit({
        actorId: user.id,
        actorRole: user.role,
        action: skipped ? "ONBOARDING_SKIPPED" : "ONBOARDING_COMPLETED",
        targetType: "profile",
        targetId: user.id,
      });
    }

    return NextResponse.json({ ok: true, onboardingCompleted: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر حفظ حالة الرحلة" }, { status: 500 });
  }
}
