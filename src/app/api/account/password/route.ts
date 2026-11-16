import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser, AuthError, revokeAllUserSessions, createSessionForUser, logAudit } from "@/lib/auth";
import { verifyPassword, hashPassword } from "@/lib/security";
import { passwordSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
    const newHint = typeof body?.passwordHint === "string" ? body.passwordHint.trim() : "";

    if (!currentPassword) {
      return NextResponse.json({ error: "يرجى إدخال كلمة المرور الحالية" }, { status: 400 });
    }

    const parsedNew = passwordSchema.safeParse(newPassword);
    if (!parsedNew.success) {
      return NextResponse.json({ error: parsedNew.error.issues[0]?.message }, { status: 400 });
    }

    if (newHint && newHint.toLowerCase() === newPassword.toLowerCase()) {
      return NextResponse.json({ error: "لا يجوز أن يطابق التلميح كلمة المرور الجديدة" }, { status: 400 });
    }

    const rows = await db
      .select({ passwordHash: profiles.passwordHash, passwordHint: profiles.passwordHint })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (!rows.length || !verifyPassword(currentPassword, rows[0].passwordHash)) {
      return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 401 });
    }

    await db
      .update(profiles)
      .set({
        passwordHash: hashPassword(parsedNew.data),
        passwordHint: newHint || rows[0].passwordHint,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id));

    // Revoke all previous sessions and issue fresh session on current device
    await revokeAllUserSessions(user.id);
    await createSessionForUser(user.id, req);

    await logAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "PASSWORD_CHANGED",
      targetType: "profile",
      targetId: user.id,
    });

    return NextResponse.json({ ok: true, message: "تم تغيير كلمة المرور وتحديث الجلسة بنجاح" });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر تغيير كلمة المرور" }, { status: 500 });
  }
}
