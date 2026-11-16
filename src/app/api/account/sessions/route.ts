import { NextResponse } from "next/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import {
  requireUser,
  AuthError,
  getUserActiveSessions,
  revokeAllUserSessions,
  clearSessionCookie,
  logAudit,
} from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();
    const list = await getUserActiveSessions(user.id);
    return NextResponse.json({ sessions: list });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر جلب الجلسات النشطة" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));

    if (body?.all === true) {
      await revokeAllUserSessions(user.id);
      await clearSessionCookie();
      await logAudit({
        actorId: user.id,
        actorRole: user.role,
        action: "LOGOUT_ALL_DEVICES",
        targetType: "session",
        targetId: user.id,
      });
      return NextResponse.json({ ok: true, loggedOutAll: true });
    }

    if (typeof body?.sessionId === "string") {
      await db
        .update(sessions)
        .set({ revokedAt: new Date() })
        .where(and(eq(sessions.id, body.sessionId), eq(sessions.userId, user.id)));

      await logAudit({
        actorId: user.id,
        actorRole: user.role,
        action: "SESSION_REVOKED",
        targetType: "session",
        targetId: body.sessionId,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "يرجى تحديد الجلسة المطلوب إنهاؤها" }, { status: 400 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر إنهاء الجلسة" }, { status: 500 });
  }
}
