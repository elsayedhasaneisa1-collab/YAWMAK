import { NextResponse } from "next/server";
import { getCurrentUser, revokeCurrentSession, logAudit } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getCurrentUser();
    await revokeCurrentSession();
    if (user) {
      await logAudit({
        actorId: user.id,
        actorRole: user.role,
        action: "USER_LOGOUT",
        targetType: "session",
        targetId: user.id,
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ أثناء تسجيل الخروج" }, { status: 500 });
  }
}
