import { NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns, campaignMembers, profiles } from "@/db/schema";
import { and, count, desc, eq, or, sql } from "drizzle-orm";
import { getCurrentUser, requireUser, getPlanLimits, AuthError, logAudit } from "@/lib/auth";
import { campaignCreateSchema } from "@/lib/validation";
import { generateSlug } from "@/lib/security";
import { ensureSeeded } from "@/db/seed";

export async function GET() {
  try {
    await ensureSeeded();
    const user = await getCurrentUser();

    const rows = await db
      .select({
        id: campaigns.id,
        slug: campaigns.slug,
        title: campaigns.title,
        description: campaigns.description,
        imageUrl: campaigns.imageUrl,
        category: campaigns.category,
        goalTarget: campaigns.goalTarget,
        currentProgress: campaigns.currentProgress,
        unitLabel: campaigns.unitLabel,
        visibility: campaigns.visibility,
        status: campaigns.status,
        isFeatured: campaigns.isFeatured,
        startsAt: campaigns.startsAt,
        endsAt: campaigns.endsAt,
        creatorId: campaigns.creatorId,
        creatorName: profiles.username,
        creatorBadge: profiles.verificationBadge,
      })
      .from(campaigns)
      .innerJoin(profiles, eq(campaigns.creatorId, profiles.id))
      .where(
        user
          ? or(eq(campaigns.visibility, "public"), eq(campaigns.creatorId, user.id))
          : eq(campaigns.visibility, "public")
      )
      .orderBy(desc(campaigns.isFeatured), desc(campaigns.createdAt))
      .limit(50);

    const memberCounts = await db
      .select({
        campaignId: campaignMembers.campaignId,
        total: count(),
      })
      .from(campaignMembers)
      .groupBy(campaignMembers.campaignId);

    const countMap = new Map(memberCounts.map((m) => [m.campaignId, Number(m.total)]));

    let joinedIds = new Set<string>();
    if (user) {
      const mine = await db
        .select({ campaignId: campaignMembers.campaignId })
        .from(campaignMembers)
        .where(eq(campaignMembers.userId, user.id));
      joinedIds = new Set(mine.map((m) => m.campaignId));
    }

    return NextResponse.json({
      campaigns: rows.map((c) => ({
        ...c,
        participantsCount: countMap.get(c.id) || 0,
        isJoined: joinedIds.has(c.id),
        isOwner: user?.id === c.creatorId,
      })),
    });
  } catch {
    return NextResponse.json({ error: "تعذر تحميل الحملات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);

    // Join or contribute action
    if (body?.action === "join" && typeof body?.campaignId === "string") {
      await db
        .insert(campaignMembers)
        .values({
          campaignId: body.campaignId,
          userId: user.id,
          role: "member",
          assignedTask: typeof body.assignedTask === "string" ? body.assignedTask.slice(0, 120) : null,
        })
        .onConflictDoNothing();
      return NextResponse.json({ ok: true });
    }

    if (body?.action === "contribute" && typeof body?.campaignId === "string") {
      const amount = Math.max(1, Math.min(100, Number(body.amount || 1)));
      await db
        .insert(campaignMembers)
        .values({ campaignId: body.campaignId, userId: user.id, role: "member", contribution: amount })
        .onConflictDoUpdate({
          target: [campaignMembers.campaignId, campaignMembers.userId],
          set: { contribution: sql`${campaignMembers.contribution} + ${amount}` },
        });
      await db
        .update(campaigns)
        .set({ currentProgress: sql`${campaigns.currentProgress} + ${amount}`, updatedAt: new Date() })
        .where(eq(campaigns.id, body.campaignId));
      return NextResponse.json({ ok: true });
    }

    const parsed = campaignCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    if (parsed.data.visibility === "private") {
      const plan = await getPlanLimits(user.membershipPlan);
      if (!plan.canCreatePrivateCampaign) {
        return NextResponse.json(
          { error: "الحملات الخاصة متاحة في باقتي PRO و VIP. يمكنك إنشاء حملة عامة الآن." },
          { status: 403 }
        );
      }
    }

    const [created] = await db
      .insert(campaigns)
      .values({
        creatorId: user.id,
        slug: generateSlug(parsed.data.title),
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        goalTarget: parsed.data.goalTarget,
        unitLabel: parsed.data.unitLabel,
        visibility: parsed.data.visibility,
        imageUrl: parsed.data.imageUrl || null,
        endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
      })
      .returning();

    await db.insert(campaignMembers).values({
      campaignId: created.id,
      userId: user.id,
      role: "owner",
    });

    await logAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "CAMPAIGN_CREATED",
      targetType: "campaign",
      targetId: created.id,
    });

    return NextResponse.json({ campaign: created }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر تنفيذ العملية" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "معرف الحملة مطلوب" }, { status: 400 });

    if (!["active", "paused", "archived", "completed"].includes(body?.status)) {
      return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
    }

    const [updated] = await db
      .update(campaigns)
      .set({ status: body.status, updatedAt: new Date() })
      .where(and(eq(campaigns.id, id), eq(campaigns.creatorId, user.id)))
      .returning();

    if (!updated) return NextResponse.json({ error: "غير مصرح أو غير موجود" }, { status: 404 });
    return NextResponse.json({ campaign: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر تحديث الحملة" }, { status: 500 });
  }
}
