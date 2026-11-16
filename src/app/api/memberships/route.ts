import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  membershipPlans,
  subscriptions,
  payments,
  verificationRequests,
  systemSettings,
  profiles,
  notifications,
} from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getCurrentUser, requireUser, AuthError, logAudit } from "@/lib/auth";
import { subscriptionRequestSchema, verificationRequestSchema } from "@/lib/validation";
import { ensureSeeded } from "@/db/seed";
import { checkRateLimit } from "@/lib/security";

export async function GET() {
  try {
    await ensureSeeded();
    const user = await getCurrentUser();

    const [plans, paymentMethodRows] = await Promise.all([
      db.select().from(membershipPlans),
      db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, "payment_methods"))
        .limit(1),
    ]);

    const order = ["FREE", "PLUS", "PRO", "VIP"];
    const sortedPlans = plans.sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code));

    if (!user) {
      return NextResponse.json({
        plans: sortedPlans,
        paymentMethods: paymentMethodRows[0]?.value || [],
        mySubscriptions: [],
        myPayments: [],
        myVerifications: [],
      });
    }

    const [mySubscriptions, myPayments, myVerifications] = await Promise.all([
      db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, user.id))
        .orderBy(desc(subscriptions.createdAt))
        .limit(20),
      db
        .select()
        .from(payments)
        .where(eq(payments.userId, user.id))
        .orderBy(desc(payments.createdAt))
        .limit(20),
      db
        .select()
        .from(verificationRequests)
        .where(eq(verificationRequests.userId, user.id))
        .orderBy(desc(verificationRequests.createdAt))
        .limit(10),
    ]);

    return NextResponse.json({
      plans: sortedPlans,
      paymentMethods: paymentMethodRows[0]?.value || [],
      mySubscriptions,
      myPayments,
      myVerifications,
    });
  } catch {
    return NextResponse.json({ error: "تعذر تحميل بيانات العضويات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureSeeded();
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    const action = body?.action || "subscribe";

    if (action === "request_verification") {
      const rl = await checkRateLimit(`verify:${user.id}`, 3, 24 * 60 * 60 * 1000);
      if (!rl.allowed) {
        return NextResponse.json({ error: "يمكن إرسال طلب توثيق واحد فقط خلال هذه الفترة" }, { status: 429 });
      }

      if (user.membershipPlan === "FREE") {
        return NextResponse.json(
          { error: "طلب التوثيق متاح لأعضاء باقات PLUS و PRO و VIP فقط." },
          { status: 403 }
        );
      }

      const parsed = verificationRequestSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
      }

      const priority = user.membershipPlan === "VIP" ? 3 : user.membershipPlan === "PRO" ? 2 : 1;

      const [created] = await db
        .insert(verificationRequests)
        .values({
          userId: user.id,
          planCode: user.membershipPlan,
          priority,
          fullName: parsed.data.fullName,
          reason: parsed.data.reason,
          referenceUrl: parsed.data.referenceUrl || null,
          status: "pending",
        })
        .returning();

      await db
        .update(profiles)
        .set({ verificationStatus: "pending", updatedAt: new Date() })
        .where(eq(profiles.id, user.id));

      await logAudit({
        actorId: user.id,
        actorRole: user.role,
        action: "VERIFICATION_REQUESTED",
        targetType: "verification_request",
        targetId: created.id,
        metadata: { plan: user.membershipPlan, priority },
      });

      return NextResponse.json(
        {
          request: created,
          message: "تم استلام طلب التوثيق بنجاح وسيخضع لمراجعة بشرية من فريق إدارة يومك.",
        },
        { status: 201 }
      );
    }

    if (action === "cancel_subscription") {
      const now = new Date();
      await db.transaction(async (tx) => {
        await tx.update(subscriptions)
          .set({ status: "cancelled", reviewedAt: now })
          .where(and(eq(subscriptions.userId, user.id), inArray(subscriptions.status, ["pending", "active"])));
        await tx.update(profiles)
          .set({ membershipPlan: "FREE", membershipStartsAt: null, membershipExpiresAt: null, updatedAt: now })
          .where(eq(profiles.id, user.id));
      });

      await db.insert(notifications).values({
        userId: user.id,
        category: "membership",
        title: "تم إلغاء الاشتراك",
        body: "تمت إعادة حسابك إلى خطة FREE دون حذف بياناتك.",
        actionUrl: "/settings/membership",
      });

      await logAudit({
        actorId: user.id,
        actorRole: user.role,
        action: "SUBSCRIPTION_CANCELLED_SELF",
        targetType: "profile",
        targetId: user.id,
      });

      return NextResponse.json({ ok: true, message: "تم إلغاء الاشتراك والعودة إلى الباقة المجانية" });
    }

    // Create pending subscription + payment record (NEVER auto-paid or auto-granted from browser!)
    const parsed = subscriptionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const planRows = await db
      .select()
      .from(membershipPlans)
      .where(eq(membershipPlans.code, parsed.data.planCode))
      .limit(1);

    if (!planRows.length) {
      return NextResponse.json({ error: "الباقة غير موجودة" }, { status: 404 });
    }

    const plan = planRows[0];
    if (!plan.isActive || plan.code === "FREE" || plan.priceEgp <= 0) {
      return NextResponse.json({ error: "هذه الباقة غير متاحة للاشتراك المدفوع حاليًا" }, { status: 400 });
    }

    const created = await db.transaction(async (tx) => {
      const [pending] = await tx.select({ id: subscriptions.id })
        .from(subscriptions)
        .where(and(eq(subscriptions.userId, user.id), eq(subscriptions.status, "pending")))
        .limit(1);
      if (pending) return { conflict: true as const };

      const [sub] = await tx.insert(subscriptions).values({
        userId: user.id,
        planCode: plan.code,
        status: "pending",
        amountEgp: plan.priceEgp,
        paymentMethod: parsed.data.paymentMethod,
        paymentReference: parsed.data.paymentReference,
      }).returning();
      const [payment] = await tx.insert(payments).values({
        subscriptionId: sub.id,
        userId: user.id,
        planCode: plan.code,
        amountEgp: plan.priceEgp,
        currency: "EGP",
        paymentMethod: parsed.data.paymentMethod,
        referenceCode: parsed.data.paymentReference,
        status: "pending_review",
      }).returning();
      return { subscription: sub, payment };
    });

    if ("conflict" in created) {
      return NextResponse.json({ error: "لديك طلب اشتراك قيد المراجعة بالفعل" }, { status: 409 });
    }
    const { subscription: sub, payment } = created;

    await logAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "SUBSCRIPTION_REQUESTED",
      targetType: "subscription",
      targetId: sub.id,
      metadata: { planCode: plan.code, amountEgp: plan.priceEgp },
    });

    return NextResponse.json(
      {
        subscription: sub,
        payment,
        message:
          "تم تسجيل طلب الاشتراك بنجاح وهو الآن قيد المراجعة اليدوية من الإدارة. لا يتم تفعيل المزايا المدفوعة إلا بعد التحقق الفعلي من عملية الدفع.",
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر إرسال الطلب" }, { status: 500 });
  }
}
