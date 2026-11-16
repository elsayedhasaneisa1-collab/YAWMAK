import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  invitations,
  campaigns,
  campaignMembers,
  habits,
  goals,
  journalEntries,
  analyticsDaily,
  analyticsPages,
  tasbihProgress,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireUser, AuthError } from "@/lib/auth";
import { parseUserAgentMeta } from "@/lib/security";

export async function GET() {
  try {
    const user = await requireUser();

    const [userInvitations, userCampaigns, memberCampaigns, userHabits, userGoals, entries, tasbih] =
      await Promise.all([
        db.select().from(invitations).where(eq(invitations.userId, user.id)),
        db.select().from(campaigns).where(eq(campaigns.creatorId, user.id)),
        db.select().from(campaignMembers).where(eq(campaignMembers.userId, user.id)),
        db.select().from(habits).where(eq(habits.userId, user.id)),
        db.select().from(goals).where(eq(goals.userId, user.id)),
        db.select().from(journalEntries).where(eq(journalEntries.userId, user.id)),
        db.select().from(tasbihProgress).where(eq(tasbihProgress.userId, user.id)),
      ]);

    const totalInvitationViews = userInvitations.reduce((acc, i) => acc + i.viewsCount, 0);
    const totalInvitationShares = userInvitations.reduce((acc, i) => acc + i.sharesCount, 0);
    const totalHabitCompletions = userHabits.reduce((acc, h) => acc + h.totalCompletions, 0);
    const completedGoals = userGoals.filter((g) => g.status === "completed").length;
    const totalTasbihSaved = tasbih.reduce((acc, t) => acc + t.totalAllTime, 0);

    // Real 7-day distribution from actual created timestamps
    const last7Days: Array<{ day: string; invitations: number; journal: number; habits: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("ar-EG", { weekday: "short" });
      last7Days.push({
        day: label,
        invitations: userInvitations.filter((x) => x.createdAt.toISOString().slice(0, 10) === iso).length,
        journal: entries.filter((x) => x.createdAt.toISOString().slice(0, 10) === iso).length,
        habits: userHabits.filter((x) => x.lastCompletedDate === iso).length,
      });
    }

    return NextResponse.json({
      summary: {
        invitationsCount: userInvitations.length,
        totalInvitationViews,
        totalInvitationShares,
        campaignsCreated: userCampaigns.length,
        campaignsJoined: memberCampaigns.length,
        habitsCount: userHabits.length,
        totalHabitCompletions,
        goalsTotal: userGoals.length,
        goalsCompleted: completedGoals,
        journalCount: entries.length,
        totalTasbihSaved,
      },
      weeklyActivity: last7Days,
      topInvitations: userInvitations
        .sort((a, b) => b.viewsCount + b.sharesCount - (a.viewsCount + a.sharesCount))
        .slice(0, 5)
        .map((i) => ({
          id: i.id,
          title: i.title,
          slug: i.slug,
          views: i.viewsCount,
          shares: i.sharesCount,
          status: i.status,
        })),
      habitsBreakdown: userHabits.map((h) => ({
        title: h.title,
        streak: h.currentStreak,
        completions: h.totalCompletions,
      })),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر جلب التحليلات" }, { status: 500 });
  }
}

// Privacy-friendly aggregated pageview counter (no fingerprinting, no PII)
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const rawPath = typeof body?.path === "string" ? body.path.trim() : "/";
    const path = rawPath.startsWith("/") ? rawPath.split("?")[0].slice(0, 80) : "/";
    const isReturning = Boolean(body?.returning);
    const source = typeof body?.source === "string" ? body.source.slice(0, 30) : "direct";

    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }

    const now = new Date();
    const dateKey = now.toISOString().slice(0, 10);
    const hourKey = String(now.getHours()).padStart(2, "0");
    const { os, browser } = parseUserAgentMeta(req.headers.get("user-agent"));

    await db
      .insert(analyticsDaily)
      .values({
        dateKey,
        totalVisits: 1,
        uniqueVisitors: isReturning ? 0 : 1,
        returningVisitors: isReturning ? 1 : 0,
        pageViews: 1,
        androidCount: os === "Android" ? 1 : 0,
        iosCount: os === "iOS" ? 1 : 0,
        windowsCount: os === "Windows" ? 1 : 0,
        macosCount: os === "macOS" ? 1 : 0,
        chromeCount: browser === "Chrome" ? 1 : 0,
        safariCount: browser === "Safari" ? 1 : 0,
        firefoxCount: browser === "Firefox" ? 1 : 0,
        edgeCount: browser === "Edge" ? 1 : 0,
        peakHours: { [hourKey]: 1 },
        trafficSources: { [source]: 1 },
      })
      .onConflictDoUpdate({
        target: analyticsDaily.dateKey,
        set: {
          totalVisits: sql`${analyticsDaily.totalVisits} + 1`,
          uniqueVisitors: sql`${analyticsDaily.uniqueVisitors} + ${isReturning ? 0 : 1}`,
          returningVisitors: sql`${analyticsDaily.returningVisitors} + ${isReturning ? 1 : 0}`,
          pageViews: sql`${analyticsDaily.pageViews} + 1`,
          androidCount: sql`${analyticsDaily.androidCount} + ${os === "Android" ? 1 : 0}`,
          iosCount: sql`${analyticsDaily.iosCount} + ${os === "iOS" ? 1 : 0}`,
          windowsCount: sql`${analyticsDaily.windowsCount} + ${os === "Windows" ? 1 : 0}`,
          macosCount: sql`${analyticsDaily.macosCount} + ${os === "macOS" ? 1 : 0}`,
          chromeCount: sql`${analyticsDaily.chromeCount} + ${browser === "Chrome" ? 1 : 0}`,
          safariCount: sql`${analyticsDaily.safariCount} + ${browser === "Safari" ? 1 : 0}`,
          firefoxCount: sql`${analyticsDaily.firefoxCount} + ${browser === "Firefox" ? 1 : 0}`,
          edgeCount: sql`${analyticsDaily.edgeCount} + ${browser === "Edge" ? 1 : 0}`,
          updatedAt: now,
        },
      });

    await db
      .insert(analyticsPages)
      .values({ dateKey, path, viewsCount: 1 })
      .onConflictDoUpdate({
        target: [analyticsPages.dateKey, analyticsPages.path],
        set: { viewsCount: sql`${analyticsPages.viewsCount} + 1`, updatedAt: now },
      });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
