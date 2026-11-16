import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, userSettings, notifications, analyticsDaily } from "@/db/schema";
import { eq, or, sql } from "drizzle-orm";
import { registerSchema } from "@/lib/validation";
import { hashPassword, checkRateLimit, getClientFingerprint } from "@/lib/security";
import { createSessionForUser, resolveAvatarUrl, logAudit } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "بيانات الطلب غير صالحة" }, { status: 400 });
    }

    // Bot protection: honeypot & minimum submission time
    if (typeof body.websiteTrap === "string" && body.websiteTrap.length > 0) {
      return NextResponse.json({ error: "تم رفض الطلب لحماية المنصة" }, { status: 400 });
    }
    if (typeof body.formStartedAt === "number" && Date.now() - body.formStartedAt < 1000) {
      return NextResponse.json({ error: "يرجى التأكد من ملء النموذج بشكل طبيعي ثم المحاولة" }, { status: 429 });
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "يرجى مراجعة البيانات المدخلة", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Composite rate limiting (client fingerprint + phone bucket, not IP alone)
    const fp = getClientFingerprint(req, data.phone.slice(-4));
    const rl = await checkRateLimit(`register:${fp}`, 6, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `تم تجاوز الحد المسموح لمحاولات التسجيل. يرجى المحاولة بعد ${rl.retryAfterSeconds} ثانية.` },
        { status: 429 }
      );
    }

    // Check duplicates without exposing internal DB errors
    const existing = await db
      .select({ id: profiles.id, username: profiles.username, phone: profiles.phone })
      .from(profiles)
      .where(or(eq(profiles.phone, data.phone), eq(profiles.username, data.username)))
      .limit(1);

    if (existing.length > 0) {
      if (existing[0].username === data.username) {
        return NextResponse.json(
          { error: "اسم المستخدم مستخدم بالفعل. اختر اسم مستخدم مختلفًا." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "رقم الهاتف مسجل بالفعل. سجّل الدخول بهذا الرقم أو استخدم رقمًا آخر." , code: "PHONE_ALREADY_REGISTERED" },
        { status: 409 }
      );
    }

    // Create the profile and its dependent records atomically. A failed secondary
    // insert must not leave a half-created account that blocks the next attempt.
    const created = await db.transaction(async (tx) => {
      const [profile] = await tx
        .insert(profiles)
        .values({
          username: data.username,
          phone: data.phone,
          email: data.email || null,
          passwordHash: hashPassword(data.password),
          passwordHint: data.passwordHint,
          gender: data.gender,
          governorate: data.governorate,
          role: "user",
          accountStatus: "active",
          membershipPlan: "FREE",
          verificationStatus: "none",
          onboardingCompleted: false,
          termsAcceptedAt: new Date(),
        })
        .returning();

      await tx.insert(userSettings).values({
        userId: profile.id,
        prayerCity: data.governorate,
      });

      await tx.insert(notifications).values({
        userId: profile.id,
        category: "system",
        title: "مرحبًا بك في YAWMAK | يومك",
        body: "يسعدنا انضمامك إلى منظومة يومك الرقمية. ابدأ يومك بالقرآن والأذكار ويومك… ببساطة وترتيب.",
        actionUrl: "/quran",
      });

      const dateKey = new Date().toISOString().slice(0, 10);
      await tx
        .insert(analyticsDaily)
        .values({ dateKey, registrations: 1, totalVisits: 1, uniqueVisitors: 1, pageViews: 1 })
        .onConflictDoUpdate({
          target: analyticsDaily.dateKey,
          set: {
            registrations: sql`${analyticsDaily.registrations} + 1`,
            updatedAt: new Date(),
          },
        });

      return profile;
    });

    await createSessionForUser(created.id, req);

    await logAudit({
      actorId: created.id,
      actorRole: "user",
      action: "USER_REGISTERED",
      targetType: "profile",
      targetId: created.id,
      metadata: { governorate: created.governorate },
    });

    return NextResponse.json(
      {
        user: {
          id: created.id,
          username: created.username,
          governorate: created.governorate,
          role: created.role,
          membershipPlan: created.membershipPlan,
          onboardingCompleted: created.onboardingCompleted,
          avatarUrl: resolveAvatarUrl(created.gender, created.membershipPlan, null),
        },
        triggerOnboarding: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("YAWMAK registration failed:", error);
    return NextResponse.json(
      { error: "تعذر إنشاء الحساب الآن بسبب مشكلة في الخادم. لم يتم تأكيد التسجيل؛ حاول مرة أخرى لاحقًا." },
      { status: 500 }
    );
  }
}
