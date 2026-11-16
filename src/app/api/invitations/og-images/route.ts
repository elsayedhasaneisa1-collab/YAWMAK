import { NextResponse } from "next/server";
import { db } from "@/db";
import { invitationImages } from "@/db/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { requireUser, getPlanLimits, AuthError, logAudit } from "@/lib/auth";
import { validateExternalOgImageUrl } from "@/lib/security";

export async function GET() {
  try {
    const user = await requireUser();
    const [images, plan] = await Promise.all([
      db
        .select()
        .from(invitationImages)
        .where(eq(invitationImages.userId, user.id))
        .orderBy(desc(invitationImages.createdAt)),
      getPlanLimits(user.membershipPlan),
    ]);

    const verifiedEligible =
      (user.membershipPlan === "PRO" || user.membershipPlan === "VIP") &&
      user.verificationStatus === "approved";

    return NextResponse.json({
      images,
      limit: verifiedEligible ? plan.ogImageLimit : 0,
      eligible: verifiedEligible,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر جلب مكتبة صور Open Graph" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const plan = await getPlanLimits(user.membershipPlan);

    const eligible =
      (user.membershipPlan === "PRO" || user.membershipPlan === "VIP") &&
      user.verificationStatus === "approved" &&
      plan.ogImageLimit > 0;

    if (!eligible) {
      return NextResponse.json(
        {
          error:
            "إضافة روابط صور Open Graph المخصصة متاحة فقط لحسابات PRO VERIFIED (حتى 5 روابط) و VIP VERIFIED (حتى 50 رابطًا) بعد اعتماد التوثيق البشري.",
        },
        { status: 403 }
      );
    }

    const existingCount = await db
      .select({ total: count() })
      .from(invitationImages)
      .where(and(eq(invitationImages.userId, user.id), eq(invitationImages.isActive, true)));

    if (Number(existingCount[0]?.total || 0) >= plan.ogImageLimit) {
      return NextResponse.json(
        {
          error: `وصلت إلى الحد الأقصى لروابط صور Open Graph لحسابك (${plan.ogImageLimit} روابط). يمكنك إعادة استخدام الروابط الموجودة في عدة دعوات أو حذف رابط قديم.`,
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";
    const altText = typeof body?.altText === "string" ? body.altText.trim().slice(0, 120) : "YAWMAK Invitation";

    const validation = await validateExternalOgImageUrl(imageUrl);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const [created] = await db
      .insert(invitationImages)
      .values({
        userId: user.id,
        imageUrl,
        altText: altText || "YAWMAK",
        contentType: validation.contentType || "image/png",
        fileSizeBytes: validation.fileSizeBytes || 0,
      })
      .returning();

    await logAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "OG_IMAGE_ADDED",
      targetType: "invitation_image",
      targetId: created.id,
    });

    return NextResponse.json({ image: created }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر إضافة رابط الصورة" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

    await db
      .delete(invitationImages)
      .where(and(eq(invitationImages.id, id), eq(invitationImages.userId, user.id)));

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر حذف الرابط" }, { status: 500 });
  }
}
