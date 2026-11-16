import { NextResponse } from "next/server";
import { db } from "@/db";
import { invitations, invitationImages, profiles } from "@/db/schema";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { getCurrentUser, requireUser, getPlanLimits, AuthError, logAudit } from "@/lib/auth";
import {
  invitationCreateSchema,
  mourningMetadataSchema,
  weddingAttendanceSchema,
  weddingCongratsSchema,
  birthdaySchema,
  congratsSchema,
} from "@/lib/validation";
import { generateSlug, checkRateLimit } from "@/lib/security";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "public";

    if (scope === "mine") {
      if (!user) return NextResponse.json({ error: "يرجى تسجيل الدخول" }, { status: 401 });
      const [mine, plan, ogImages] = await Promise.all([
        db
          .select()
          .from(invitations)
          .where(eq(invitations.userId, user.id))
          .orderBy(desc(invitations.createdAt))
          .limit(60),
        getPlanLimits(user.membershipPlan),
        db
          .select()
          .from(invitationImages)
          .where(and(eq(invitationImages.userId, user.id), eq(invitationImages.isActive, true)))
          .orderBy(desc(invitationImages.createdAt)),
      ]);

      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const usedCount =
        plan.invitationLimitScope === "lifetime"
          ? mine.length
          : mine.filter((i) => new Date(i.createdAt) >= startOfMonth).length;

      return NextResponse.json({
        invitations: mine,
        ogImages,
        quota: {
          plan: user.membershipPlan,
          limit: plan.invitationLimit,
          scope: plan.invitationLimitScope,
          used: usedCount,
          ogImageLimit: plan.ogImageLimit,
          ogImageUsed: ogImages.length,
        },
      });
    }

    const publicList = await db
      .select({
        id: invitations.id,
        slug: invitations.slug,
        type: invitations.type,
        title: invitations.title,
        description: invitations.description,
        templateId: invitations.templateId,
        themeColor: invitations.themeColor,
        fontFamily: invitations.fontFamily,
        bgStyle: invitations.bgStyle,
        targetUrl: invitations.targetUrl,
        metadata: invitations.metadata,
        viewsCount: invitations.viewsCount,
        sharesCount: invitations.sharesCount,
        createdAt: invitations.createdAt,
        creatorName: profiles.username,
        creatorBadge: profiles.verificationBadge,
      })
      .from(invitations)
      .innerJoin(profiles, eq(invitations.userId, profiles.id))
      .where(eq(invitations.status, "published"))
      .orderBy(desc(invitations.createdAt))
      .limit(40);

    return NextResponse.json({ invitations: publicList });
  } catch {
    return NextResponse.json({ error: "تعذر جلب الدعوات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const rl = await checkRateLimit(`inv-create:${user.id}`, 15, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "تم تجاوز معدل إنشاء الدعوات المسموح مؤقتًا وفق سياسة الاستخدام العادل" },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = invitationCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    // Strict server-side plan limit verification
    const plan = await getPlanLimits(user.membershipPlan);
    if (plan.invitationLimit !== -1) {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const countRows =
        plan.invitationLimitScope === "lifetime"
          ? await db.select({ total: count() }).from(invitations).where(eq(invitations.userId, user.id))
          : await db
              .select({ total: count() })
              .from(invitations)
              .where(and(eq(invitations.userId, user.id), gte(invitations.createdAt, startOfMonth)));

      const used = Number(countRows[0]?.total || 0);
      if (used >= plan.invitationLimit) {
        const periodAr = plan.invitationLimitScope === "lifetime" ? "طوال عمر الحساب" : "لهذا الشهر";
        return NextResponse.json(
          {
            error: `وصلت إلى الحد الأقصى للدعوات في باقة ${user.membershipPlan} (${plan.invitationLimit} دعوة ${periodAr}).`,
            limitReached: true,
          },
          { status: 403 }
        );
      }
    }

    // Validate optional OG image ownership & eligibility (PRO VERIFIED or VIP VERIFIED only!)
    let validOgImageId: string | null = null;
    if (parsed.data.ogImageId) {
      const canUseCustomOg =
        (user.membershipPlan === "PRO" || user.membershipPlan === "VIP") &&
        user.verificationStatus === "approved";
      if (!canUseCustomOg) {
        return NextResponse.json(
          { error: "صور Open Graph المخصصة متاحة فقط لحسابات PRO VERIFIED و VIP VERIFIED الموثقة." },
          { status: 403 }
        );
      }
      const img = await db
        .select({ id: invitationImages.id })
        .from(invitationImages)
        .where(
          and(
            eq(invitationImages.id, parsed.data.ogImageId),
            eq(invitationImages.userId, user.id),
            eq(invitationImages.isActive, true)
          )
        )
        .limit(1);
      if (!img.length) {
        return NextResponse.json({ error: "صورة Open Graph المختارة غير صالحة" }, { status: 400 });
      }
      validOgImageId = img[0].id;
    }

    let metadata: Record<string, unknown> = {};
    if (parsed.data.type === "mourning") {
      const metaParsed = mourningMetadataSchema.safeParse(parsed.data.metadata || {});
      if (!metaParsed.success) {
        return NextResponse.json({ error: metaParsed.error.issues[0]?.message }, { status: 400 });
      }
      metadata = { ...metaParsed.data, kind: "mourning" };
    } else if (parsed.data.type === "wedding_attendance") {
      const meta = weddingAttendanceSchema.safeParse(parsed.data.metadata || {});
      if (!meta.success) {
        return NextResponse.json({ error: meta.error.issues[0]?.message }, { status: 400 });
      }
      metadata = { ...meta.data, kind: "wedding_attendance" };
    } else if (parsed.data.type === "wedding_congrats") {
      const meta = weddingCongratsSchema.safeParse(parsed.data.metadata || {});
      if (!meta.success) {
        return NextResponse.json({ error: meta.error.issues[0]?.message }, { status: 400 });
      }
      metadata = { ...meta.data, kind: "wedding_congrats" };
    } else if (parsed.data.type === "birthday") {
      const meta = birthdaySchema.safeParse(parsed.data.metadata || {});
      if (!meta.success) {
        return NextResponse.json({ error: meta.error.issues[0]?.message }, { status: 400 });
      }
      metadata = { ...meta.data, kind: "birthday" };
    } else if (parsed.data.type === "congrats") {
      const meta = congratsSchema.safeParse(parsed.data.metadata || {});
      if (!meta.success) {
        return NextResponse.json({ error: meta.error.issues[0]?.message }, { status: 400 });
      }
      metadata = { ...meta.data, kind: "congrats" };
    } else if (parsed.data.metadata && typeof parsed.data.metadata === "object") {
      const safe: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(parsed.data.metadata).slice(0, 12)) {
        if (typeof v === "string") safe[k] = v.trim().slice(0, 400);
        else if (typeof v === "number" || typeof v === "boolean") safe[k] = v;
      }
      metadata = safe;
    }

    const slug = generateSlug(parsed.data.title);
    const [created] = await db
      .insert(invitations)
      .values({
        userId: user.id,
        slug,
        type: parsed.data.type,
        title: parsed.data.title,
        description: parsed.data.description,
        templateId: parsed.data.templateId,
        themeColor: parsed.data.themeColor,
        fontFamily: parsed.data.fontFamily,
        bgStyle: parsed.data.bgStyle,
        targetUrl: parsed.data.targetUrl || null,
        ogImageId: validOgImageId,
        status: parsed.data.status,
        metadata,
      })
      .returning();

    if (!created) {
      throw new Error("Invitation insert returned no row");
    }

    // Audit logging must not turn a successfully-created invitation into a failed response.
    try {
      await logAudit({
        actorId: user.id,
        actorRole: user.role,
        action: "INVITATION_CREATED",
        targetType: "invitation",
        targetId: created.id,
      });
    } catch (auditError) {
      console.error("[invitations] audit log failed after creation", auditError);
    }

    return NextResponse.json({ invitation: created }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[invitations] create failed", err);
    return NextResponse.json(
      { error: "تعذر إنشاء الدعوة حاليًا. راجع البيانات وحاول مرة أخرى." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (body?.trackShare && typeof body?.slug === "string") {
      await db
        .update(invitations)
        .set({ sharesCount: sql`${invitations.sharesCount} + 1` })
        .where(eq(invitations.slug, body.slug));
      return NextResponse.json({ ok: true });
    }

    const user = await requireUser();
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "معرف الدعوة مطلوب" }, { status: 400 });

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (["draft", "published", "paused"].includes(body?.status)) updates.status = body.status;
    if (typeof body?.title === "string" && body.title.trim().length >= 3) {
      updates.title = body.title.trim().slice(0, 120);
    }
    if (typeof body?.description === "string" && body.description.trim().length >= 10) {
      updates.description = body.description.trim().slice(0, 1200);
    }

    const [updated] = await db
      .update(invitations)
      .set(updates)
      .where(and(eq(invitations.id, id), eq(invitations.userId, user.id)))
      .returning();

    if (!updated) return NextResponse.json({ error: "الدعوة غير موجودة" }, { status: 404 });
    return NextResponse.json({ invitation: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر تحديث الدعوة" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "معرف الدعوة مطلوب" }, { status: 400 });

    const result = await db
      .delete(invitations)
      .where(and(eq(invitations.id, id), eq(invitations.userId, user.id)))
      .returning({ id: invitations.id });

    if (!result.length) {
      return NextResponse.json({ error: "الدعوة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر حذف الدعوة" }, { status: 500 });
  }
}
