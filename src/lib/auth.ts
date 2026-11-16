import { cookies } from "next/headers";
import { db } from "@/db";
import {
  profiles,
  sessions,
  membershipPlans,
  auditLogs,
  invitationImages,
  notifications,
} from "@/db/schema";
import { eq, and, gt, isNull, desc } from "drizzle-orm";
import { generateOpaqueToken, sha256Hex, parseUserAgentMeta } from "./security";
import { hasRoleAccess, type AdminRole, type MembershipCode } from "./constants";

export const SESSION_COOKIE_NAME = "yawmak_session";
const SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export interface AuthUser {
  id: string;
  username: string;
  phone: string;
  email: string | null;
  governorate: string;
  role: AdminRole;
  accountStatus: string;
  banReason: string | null;
  membershipPlan: MembershipCode;
  membershipStartsAt: Date | null;
  membershipExpiresAt: Date | null;
  verificationStatus: string;
  verificationBadge: string | null;
  onboardingCompleted: boolean;
  bio: string | null;
  publicProfile: boolean;
  publicLinks: Array<{ label: string; url: string }>;
  avatarUrl: string;
  canUploadAvatar: boolean;
  createdAt: Date;
}

export function resolveAvatarUrl(
  gender: string,
  membershipPlan: string,
  customAvatarUrl: string | null
): string {
  if (membershipPlan !== "FREE" && customAvatarUrl && customAvatarUrl.startsWith("https://")) {
    return customAvatarUrl;
  }
  return gender === "female" ? "/avatars/default-female.svg" : "/avatars/default-male.svg";
}

export async function createSessionForUser(userId: string, req?: Request): Promise<string> {
  const rawToken = generateOpaqueToken();
  const tokenHash = sha256Hex(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const ua = req?.headers.get("user-agent") || null;
  const { os, browser } = parseUserAgentMeta(ua);
  const ip = req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  await db.insert(sessions).values({
    userId,
    tokenHash,
    userAgent: ua?.slice(0, 220) || null,
    deviceOs: os,
    browser,
    ipHash: sha256Hex(ip).slice(0, 24),
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return rawToken;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function revokeCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (rawToken) {
    const tokenHash = sha256Hex(rawToken);
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.tokenHash, tokenHash));
  }
  await clearSessionCookie();
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
}

async function applyMembershipExpirationIfNeeded(userRow: typeof profiles.$inferSelect) {
  if (
    userRow.membershipPlan !== "FREE" &&
    userRow.membershipExpiresAt &&
    userRow.membershipExpiresAt.getTime() < Date.now()
  ) {
    await db
      .update(profiles)
      .set({
        membershipPlan: "FREE",
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userRow.id));

    await db
      .update(invitationImages)
      .set({ isActive: false })
      .where(eq(invitationImages.userId, userRow.id));

    await db.insert(notifications).values({
      userId: userRow.id,
      category: "membership",
      title: "انتهاء صلاحية العضوية المدفوعة",
      body: "انتهت مدة اشتراكك وتمت إعادة حسابك إلى خطة FREE تلقائيًا دون حذف بياناتك. تم إخفاء صور Open Graph المخصصة مؤقتًا حتى التجديد.",
      actionUrl: "/settings/membership",
    });

    return "FREE" as MembershipCode;
  }
  return userRow.membershipPlan as MembershipCode;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!rawToken) return null;

    const tokenHash = sha256Hex(rawToken);
    const now = new Date();

    const rows = await db
      .select({
        session: sessions,
        profile: profiles,
      })
      .from(sessions)
      .innerJoin(profiles, eq(sessions.userId, profiles.id))
      .where(
        and(
          eq(sessions.tokenHash, tokenHash),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, now)
        )
      )
      .limit(1);

    if (!rows.length) return null;

    const { session, profile } = rows[0];

    if (profile.accountStatus === "banned" || profile.accountStatus === "deleted") {
      await db
        .update(sessions)
        .set({ revokedAt: now })
        .where(eq(sessions.id, session.id));
      return null;
    }

    const effectivePlan = await applyMembershipExpirationIfNeeded(profile);

    // Light throttled activity update (every 10 minutes max to save DB writes)
    if (now.getTime() - session.lastActiveAt.getTime() > 10 * 60 * 1000) {
      await db
        .update(sessions)
        .set({ lastActiveAt: now })
        .where(eq(sessions.id, session.id));
      await db
        .update(profiles)
        .set({ lastActiveAt: now })
        .where(eq(profiles.id, profile.id));
    }

    return {
      id: profile.id,
      username: profile.username,
      phone: profile.phone,
      email: profile.email,
      governorate: profile.governorate,
      role: profile.role as AdminRole,
      accountStatus: profile.accountStatus,
      banReason: profile.banReason,
      membershipPlan: effectivePlan,
      membershipStartsAt: profile.membershipStartsAt,
      membershipExpiresAt: profile.membershipExpiresAt,
      verificationStatus: profile.verificationStatus,
      verificationBadge: profile.verificationBadge,
      onboardingCompleted: profile.onboardingCompleted,
      bio: profile.bio,
      publicProfile: profile.publicProfile,
      publicLinks: (profile.publicLinks as Array<{ label: string; url: string }>) || [],
      avatarUrl: resolveAvatarUrl(profile.gender, effectivePlan, profile.customAvatarUrl),
      canUploadAvatar: effectivePlan !== "FREE",
      createdAt: profile.createdAt,
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError("يرجى تسجيل الدخول أولاً للوصول إلى هذه الميزة", 401);
  }
  if (user.accountStatus === "suspended") {
    throw new AuthError("حسابك موقوف مؤقتًا قيد المراجعة. يمكنك التواصل مع الدعم الفني.", 403);
  }
  return user;
}

export async function requireRole(minRole: AdminRole): Promise<AuthUser> {
  const user = await requireUser();
  if (!hasRoleAccess(user.role, minRole)) {
    throw new AuthError("ليست لديك الصلاحية الكافية لتنفيذ هذا الإجراء", 403);
  }
  return user;
}

export async function getPlanLimits(planCode: MembershipCode) {
  const rows = await db
    .select()
    .from(membershipPlans)
    .where(eq(membershipPlans.code, planCode))
    .limit(1);

  if (rows.length) return rows[0];

  return {
    code: "FREE",
    nameAr: "الباقة المجانية",
    nameEn: "FREE",
    priceEgp: 0,
    invitationLimit: 5,
    invitationLimitScope: "lifetime",
    habitLimit: 3,
    ogImageLimit: 0,
    canVerify: false,
    verificationPriority: 0,
    canUploadAvatar: false,
    canUseStudio: false,
    canCreatePrivateCampaign: false,
    canCreateCommunity: false,
    badgeLabel: null,
    features: [],
    isActive: true,
    updatedAt: new Date(),
  };
}

export async function logAudit(params: {
  actorId: string | null;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await db.insert(auditLogs).values({
      actorId: params.actorId,
      actorRole: params.actorRole,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId || null,
      metadata: params.metadata || {},
    });
  } catch {
    // Do not break user flow on audit insert failure
  }
}

export async function getUserActiveSessions(userId: string) {
  const cookieStore = await cookies();
  const currentHash = cookieStore.get(SESSION_COOKIE_NAME)?.value
    ? sha256Hex(cookieStore.get(SESSION_COOKIE_NAME)!.value)
    : null;

  const list = await db
    .select({
      id: sessions.id,
      tokenHash: sessions.tokenHash,
      deviceOs: sessions.deviceOs,
      browser: sessions.browser,
      lastActiveAt: sessions.lastActiveAt,
      createdAt: sessions.createdAt,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date())
      )
    )
    .orderBy(desc(sessions.lastActiveAt))
    .limit(20);

  return list.map((s) => ({
    id: s.id,
    deviceOs: s.deviceOs || "غير معروف",
    browser: s.browser || "غير معروف",
    lastActiveAt: s.lastActiveAt,
    createdAt: s.createdAt,
    expiresAt: s.expiresAt,
    isCurrent: currentHash === s.tokenHash,
  }));
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}
