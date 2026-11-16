import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { loginSchema } from "@/lib/validation";
import { verifyPassword, checkRateLimit, getClientFingerprint, sha256Hex } from "@/lib/security";
import { createSessionForUser, resolveAvatarUrl, logAudit } from "@/lib/auth";

const GENERIC_AUTH_ERROR = "بيانات الدخول غير صحيحة، يرجى التحقق من رقم الهاتف وكلمة المرور";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "بيانات الطلب غير صالحة" }, { status: 400 });
    }

    if (typeof body.websiteTrap === "string" && body.websiteTrap.length > 0) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 400 });
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 400 });
    }

    const { phone, password } = parsed.data;
    const ipFingerprint = getClientFingerprint(req);
    const ipLimit = await checkRateLimit(`login:ip:${ipFingerprint}`, 30, 15 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: `تم تجاوز عدد محاولات الدخول من هذا الاتصال. حاول بعد ${ipLimit.retryAfterSeconds} ثانية.` },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds) } }
      );
    }

    // Account-level throttling remains effective even when the client changes devices or browsers.
    const accountKey = sha256Hex(phone);
    const accountLimit = await checkRateLimit(`login:account:${accountKey}`, 8, 15 * 60 * 1000);
    if (!accountLimit.allowed) {
      return NextResponse.json(
        { error: `تعذر تسجيل الدخول مؤقتًا. حاول بعد ${accountLimit.retryAfterSeconds} ثانية.` },
        { status: 429, headers: { "Retry-After": String(accountLimit.retryAfterSeconds) } }
      );
    }

    const found = await db
      .select()
      .from(profiles)
      .where(eq(profiles.phone, phone))
      .limit(1);

    if (found.length === 0) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    const user = found[0];
    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    if (user.accountStatus === "banned") {
      return NextResponse.json(
        {
          error: "تم حظر هذا الحساب لمخالفة سياسات المنصة. يمكنك تقديم اعتراض عبر مركز الدعم.",
          banned: true,
          reason: user.banReason || "مخالفة شروط الاستخدام",
        },
        { status: 403 }
      );
    }

    if (user.accountStatus === "deleted") {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    await createSessionForUser(user.id, req);

    await logAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "USER_LOGIN",
      targetType: "profile",
      targetId: user.id,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        membershipPlan: user.membershipPlan,
        verificationBadge: user.verificationBadge,
        onboardingCompleted: true, // Onboarding NEVER appears on login
        avatarUrl: resolveAvatarUrl(user.gender, user.membershipPlan, user.customAvatarUrl),
      },
      triggerOnboarding: false,
    });
  } catch (error) {
    console.error("YAWMAK login failed:", error);
    return NextResponse.json({ error: "تعذر تسجيل الدخول في الوقت الحالي. تحقق من إعداد قاعدة البيانات ثم حاول مجددًا." }, { status: 500 });
  }
}
