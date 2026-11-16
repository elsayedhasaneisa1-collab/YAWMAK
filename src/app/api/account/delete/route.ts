import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  requireUser,
  AuthError,
  revokeAllUserSessions,
  clearSessionCookie,
  logAudit,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const password = typeof body?.password === "string" ? body.password : "";
    const confirmText = typeof body?.confirmText === "string" ? body.confirmText.trim() : "";

    if (user.role === "owner") {
      return NextResponse.json(
        { error: "لا يمكن حذف حساب المالك الأساسي مباشرة حفاظًا على استقرار المنصة" },
        { status: 403 }
      );
    }

    if (!password) {
      return NextResponse.json({ error: "يرجى إدخال كلمة المرور للتأكيد" }, { status: 400 });
    }

    if (confirmText !== "حذف حسابي" && confirmText !== "DELETE") {
      return NextResponse.json(
        { error: "يرجى كتابة عبارة التأكيد (حذف حسابي) لإتمام العملية" },
        { status: 400 }
      );
    }

    // Server strictly verifies authenticated user identity — never accepts userId from client!
    const rows = await db
      .select({ passwordHash: profiles.passwordHash })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (!rows.length || !verifyPassword(password, rows[0].passwordHash)) {
      return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
    }

    await revokeAllUserSessions(user.id);
    await db.delete(profiles).where(eq(profiles.id, user.id));
    await clearSessionCookie();

    await logAudit({
      actorId: null,
      actorRole: "user",
      action: "ACCOUNT_DELETED_SELF",
      targetType: "profile",
      targetId: user.id,
      metadata: { deletedAt: new Date().toISOString() },
    });

    return NextResponse.json({ ok: true, message: "تم حذف حسابك وجميع بياناتك الشخصية بنجاح" });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر حذف الحساب في الوقت الحالي" }, { status: 500 });
  }
}
