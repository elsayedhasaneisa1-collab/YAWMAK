import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, userSettings } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { requireUser, AuthError, logAudit } from "@/lib/auth";
import { usernameSchema, governorateSchema } from "@/lib/validation";

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    const profileUpdates: Record<string, unknown> = { updatedAt: new Date() };

    if (typeof body.username === "string" && body.username.trim() !== user.username) {
      const parsed = usernameSchema.safeParse(body.username);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
      }
      const conflict = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(and(eq(profiles.username, parsed.data), ne(profiles.id, user.id)))
        .limit(1);
      if (conflict.length) {
        return NextResponse.json({ error: "اسم المستخدم مستخدم بالفعل" }, { status: 409 });
      }
      profileUpdates.username = parsed.data;
    }

    if (typeof body.governorate === "string") {
      const parsedGov = governorateSchema.safeParse(body.governorate);
      if (!parsedGov.success) {
        return NextResponse.json({ error: parsedGov.error.issues[0]?.message }, { status: 400 });
      }
      profileUpdates.governorate = parsedGov.data;
    }

    if (typeof body.email === "string") {
      const cleanEmail = body.email.trim();
      if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return NextResponse.json({ error: "صيغة البريد الإلكتروني غير صحيحة" }, { status: 400 });
      }
      profileUpdates.email = cleanEmail || null;
    }

    if (typeof body.bio === "string") {
      profileUpdates.bio = body.bio.trim().slice(0, 320);
    }

    if (typeof body.publicProfile === "boolean") {
      profileUpdates.publicProfile = body.publicProfile;
    }

    if (Array.isArray(body.publicLinks)) {
      const sanitized = body.publicLinks
        .slice(0, 6)
        .filter(
          (l: unknown): l is { label: string; url: string } =>
            typeof l === "object" &&
            l !== null &&
            typeof (l as { label?: unknown }).label === "string" &&
            typeof (l as { url?: unknown }).url === "string" &&
            /^https:\/\/.+/.test((l as { url: string }).url.trim())
        )
        .map((l: { label: string; url: string }) => ({ label: l.label.trim().slice(0, 40), url: l.url.trim().slice(0, 220) }));
      profileUpdates.publicLinks = sanitized;
    }

    if (typeof body.customAvatarUrl === "string") {
      if (user.membershipPlan === "FREE") {
        return NextResponse.json(
          { error: "الباقة المجانية تستخدم الصورة الافتراضية فقط. قم بالترقية إلى PLUS أو أعلى لتخصيص الصورة." },
          { status: 403 }
        );
      }
      const trimmed = body.customAvatarUrl.trim();
      if (trimmed && !/^https:\/\/.+/.test(trimmed)) {
        return NextResponse.json({ error: "رابط الصورة الشخصية يجب أن يبدأ بـ https://" }, { status: 400 });
      }
      profileUpdates.customAvatarUrl = trimmed || null;
    }

    if (Object.keys(profileUpdates).length > 1) {
      await db.update(profiles).set(profileUpdates).where(eq(profiles.id, user.id));
    }

    // Update user settings if provided
    if (body.settings && typeof body.settings === "object") {
      const s = body.settings;
      const settingsUpdate: Record<string, unknown> = { updatedAt: new Date() };
      if (typeof s.prayerCity === "string") {
        const g = governorateSchema.safeParse(s.prayerCity);
        if (g.success) settingsUpdate.prayerCity = g.data;
      }
      if (typeof s.prayerMethod === "number" && s.prayerMethod >= 1 && s.prayerMethod <= 15) {
        settingsUpdate.prayerMethod = Math.floor(s.prayerMethod);
      }
      if (typeof s.hijriAdjustment === "number" && s.hijriAdjustment >= -2 && s.hijriAdjustment <= 2) {
        settingsUpdate.hijriAdjustment = Math.floor(s.hijriAdjustment);
      }
      if (typeof s.quranFontSize === "number" && s.quranFontSize >= 18 && s.quranFontSize <= 48) {
        settingsUpdate.quranFontSize = Math.floor(s.quranFontSize);
      }
      if (typeof s.lastQuranSurah === "number" && s.lastQuranSurah >= 1 && s.lastQuranSurah <= 114) {
        settingsUpdate.lastQuranSurah = Math.floor(s.lastQuranSurah);
      }
      if (typeof s.lastQuranAyah === "number" && s.lastQuranAyah >= 1) {
        settingsUpdate.lastQuranAyah = Math.floor(s.lastQuranAyah);
      }
      if (typeof s.khatmaPlanDays === "number" && s.khatmaPlanDays >= 7 && s.khatmaPlanDays <= 365) {
        settingsUpdate.khatmaPlanDays = Math.floor(s.khatmaPlanDays);
      }
      if (typeof s.khatmaCurrentJuz === "number" && s.khatmaCurrentJuz >= 1 && s.khatmaCurrentJuz <= 30) {
        settingsUpdate.khatmaCurrentJuz = Math.floor(s.khatmaCurrentJuz);
      }
      if (typeof s.notificationsSystem === "boolean") {
        settingsUpdate.notificationsSystem = s.notificationsSystem;
      }
      if (typeof s.notificationsMembership === "boolean") {
        settingsUpdate.notificationsMembership = s.notificationsMembership;
      }
      if (typeof s.notificationsCampaigns === "boolean") {
        settingsUpdate.notificationsCampaigns = s.notificationsCampaigns;
      }

      await db
        .insert(userSettings)
        .values({ userId: user.id, ...settingsUpdate })
        .onConflictDoUpdate({
          target: userSettings.userId,
          set: settingsUpdate,
        });
    }

    await logAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "ACCOUNT_UPDATED",
      targetType: "profile",
      targetId: user.id,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر تحديث إعدادات الحساب" }, { status: 500 });
  }
}
