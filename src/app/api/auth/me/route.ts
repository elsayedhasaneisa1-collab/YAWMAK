import { NextResponse } from "next/server";
import { db } from "@/db";
import { notifications, userSettings } from "@/db/schema";
import { and, eq, count } from "drizzle-orm";
import { getCurrentUser, getPlanLimits } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSeeded();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null, plan: null, unreadNotifications: 0, settings: null });
    }

    const [plan, unreadRows, settingRows] = await Promise.all([
      getPlanLimits(user.membershipPlan),
      db
        .select({ total: count() })
        .from(notifications)
        .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false))),
      db.select().from(userSettings).where(eq(userSettings.userId, user.id)).limit(1),
    ]);

    return NextResponse.json({
      user,
      plan,
      unreadNotifications: Number(unreadRows[0]?.total || 0),
      settings: settingRows[0] || null,
    });
  } catch {
    return NextResponse.json({ user: null, plan: null, unreadNotifications: 0, settings: null });
  }
}
