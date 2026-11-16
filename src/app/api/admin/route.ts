import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  profiles,
  membershipPlans,
  subscriptions,
  payments,
  verificationRequests,
  invitations,
  campaigns,
  communities,
  communityPosts,
  reports,
  supportTickets,
  auditLogs,
  analyticsDaily,
  analyticsPages,
  apiHealthChecks,
  systemSettings,
  notifications,
} from "@/db/schema";
import { count, desc, eq, gte, sql } from "drizzle-orm";
import { requireRole, revokeAllUserSessions, AuthError, logAudit } from "@/lib/auth";
import { hasRoleAccess, EGYPT_GOVERNORATES } from "@/lib/constants";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await ensureSeeded();
    const admin = await requireRole("support");
    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section") || "overview";

    if (section === "users") {
      const rows = await db
        .select({
          id: profiles.id,
          username: profiles.username,
          phone: profiles.phone,
          email: profiles.email,
          governorate: profiles.governorate,
          role: profiles.role,
          accountStatus: profiles.accountStatus,
          banReason: profiles.banReason,
          membershipPlan: profiles.membershipPlan,
          membershipExpiresAt: profiles.membershipExpiresAt,
          verificationStatus: profiles.verificationStatus,
          verificationBadge: profiles.verificationBadge,
          createdAt: profiles.createdAt,
          lastActiveAt: profiles.lastActiveAt,
        })
        .from(profiles)
        .orderBy(desc(profiles.createdAt))
        .limit(100);
      // Security rule: NEVER return passwordHash or passwordHint!
      return NextResponse.json({ users: rows, adminRole: admin.role });
    }

    if (section === "memberships") {
      const [plans, subs, pays] = await Promise.all([
        db.select().from(membershipPlans),
        db
          .select({
            id: subscriptions.id,
            userId: subscriptions.userId,
            username: profiles.username,
            planCode: subscriptions.planCode,
            status: subscriptions.status,
            amountEgp: subscriptions.amountEgp,
            paymentMethod: subscriptions.paymentMethod,
            paymentReference: subscriptions.paymentReference,
            startsAt: subscriptions.startsAt,
            endsAt: subscriptions.endsAt,
            createdAt: subscriptions.createdAt,
          })
          .from(subscriptions)
          .innerJoin(profiles, eq(subscriptions.userId, profiles.id))
          .orderBy(desc(subscriptions.createdAt))
          .limit(80),
        db
          .select({
            id: payments.id,
            subscriptionId: payments.subscriptionId,
            userId: payments.userId,
            username: profiles.username,
            planCode: payments.planCode,
            amountEgp: payments.amountEgp,
            paymentMethod: payments.paymentMethod,
            referenceCode: payments.referenceCode,
            status: payments.status,
            createdAt: payments.createdAt,
          })
          .from(payments)
          .innerJoin(profiles, eq(payments.userId, profiles.id))
          .orderBy(desc(payments.createdAt))
          .limit(80),
      ]);
      return NextResponse.json({ plans, subscriptions: subs, payments: pays });
    }

    if (section === "verifications") {
      const list = await db
        .select({
          id: verificationRequests.id,
          userId: verificationRequests.userId,
          username: profiles.username,
          planCode: verificationRequests.planCode,
          priority: verificationRequests.priority,
          fullName: verificationRequests.fullName,
          reason: verificationRequests.reason,
          referenceUrl: verificationRequests.referenceUrl,
          status: verificationRequests.status,
          badgeGranted: verificationRequests.badgeGranted,
          decisionReason: verificationRequests.decisionReason,
          createdAt: verificationRequests.createdAt,
        })
        .from(verificationRequests)
        .innerJoin(profiles, eq(verificationRequests.userId, profiles.id))
        .orderBy(desc(verificationRequests.priority), desc(verificationRequests.createdAt))
        .limit(80);
      return NextResponse.json({ requests: list });
    }

    if (section === "invitations") {
      const list = await db
        .select({
          id: invitations.id,
          slug: invitations.slug,
          type: invitations.type,
          title: invitations.title,
          status: invitations.status,
          viewsCount: invitations.viewsCount,
          sharesCount: invitations.sharesCount,
          createdAt: invitations.createdAt,
          creatorName: profiles.username,
        })
        .from(invitations)
        .innerJoin(profiles, eq(invitations.userId, profiles.id))
        .orderBy(desc(invitations.createdAt))
        .limit(80);
      return NextResponse.json({ invitations: list });
    }

    if (section === "campaigns") {
      const list = await db
        .select({
          id: campaigns.id,
          slug: campaigns.slug,
          title: campaigns.title,
          category: campaigns.category,
          visibility: campaigns.visibility,
          status: campaigns.status,
          isFeatured: campaigns.isFeatured,
          goalTarget: campaigns.goalTarget,
          currentProgress: campaigns.currentProgress,
          createdAt: campaigns.createdAt,
          creatorName: profiles.username,
        })
        .from(campaigns)
        .innerJoin(profiles, eq(campaigns.creatorId, profiles.id))
        .orderBy(desc(campaigns.createdAt))
        .limit(80);
      return NextResponse.json({ campaigns: list });
    }

    if (section === "communities") {
      const [comms, recentPosts] = await Promise.all([
        db
          .select({
            id: communities.id,
            name: communities.name,
            category: communities.category,
            privacy: communities.privacy,
            status: communities.status,
            createdAt: communities.createdAt,
            creatorName: profiles.username,
          })
          .from(communities)
          .innerJoin(profiles, eq(communities.creatorId, profiles.id))
          .orderBy(desc(communities.createdAt))
          .limit(60),
        db
          .select({
            id: communityPosts.id,
            content: communityPosts.content,
            status: communityPosts.status,
            createdAt: communityPosts.createdAt,
            authorName: profiles.username,
          })
          .from(communityPosts)
          .innerJoin(profiles, eq(communityPosts.authorId, profiles.id))
          .orderBy(desc(communityPosts.createdAt))
          .limit(40),
      ]);
      return NextResponse.json({ communities: comms, posts: recentPosts });
    }

    if (section === "reports" || section === "moderation") {
      const list = await db.select().from(reports).orderBy(desc(reports.createdAt)).limit(80);
      return NextResponse.json({ reports: list });
    }

    if (section === "support") {
      const list = await db
        .select()
        .from(supportTickets)
        .orderBy(desc(supportTickets.createdAt))
        .limit(80);
      return NextResponse.json({ tickets: list });
    }

    if (section === "visitors") {
      const [daily, pages] = await Promise.all([
        db.select().from(analyticsDaily).orderBy(desc(analyticsDaily.dateKey)).limit(30),
        db
          .select({
            path: analyticsPages.path,
            views: sql<number>`sum(${analyticsPages.viewsCount})::int`,
          })
          .from(analyticsPages)
          .groupBy(analyticsPages.path)
          .orderBy(desc(sql`sum(${analyticsPages.viewsCount})`))
          .limit(15),
      ]);
      return NextResponse.json({ daily: daily.reverse(), topPages: pages });
    }

    if (section === "geography") {
      // Strictly aggregated governorate counts from registration data — NO GPS, NO IP lookup, NO PII!
      const grouped = await db
        .select({
          governorate: profiles.governorate,
          total: count(),
        })
        .from(profiles)
        .groupBy(profiles.governorate);

      const totalAccounts = grouped.reduce((acc, g) => acc + Number(g.total), 0);
      const countMap = new Map(grouped.map((g) => [g.governorate, Number(g.total)]));
      const officialSet = new Set<string>(EGYPT_GOVERNORATES.map((g) => g.nameAr));

      const unknownCount = grouped
        .filter((g) => !officialSet.has(g.governorate))
        .reduce((acc, g) => acc + Number(g.total), 0);

      const stats = EGYPT_GOVERNORATES.map((g) => {
        const cnt = countMap.get(g.nameAr) || 0;
        return {
          ...g,
          count: cnt,
          percentage: totalAccounts > 0 ? Math.round((cnt / totalAccounts) * 1000) / 10 : 0,
        };
      }).sort((a, b) => b.count - a.count);

      return NextResponse.json({ totalAccounts, unknownCount, governorates: stats });
    }

    if (section === "database") {
      const [sizeRes, connRes, tableStatsRes] = await Promise.all([
        db.execute(sql`SELECT pg_database_size(current_database())::bigint AS bytes`),
        db.execute(
          sql`SELECT count(*)::int AS active_connections FROM pg_stat_activity WHERE datname = current_database()`
        ),
        db.execute(
          sql`SELECT relname AS table_name, n_live_tup::int AS row_count FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 20`
        ),
      ]);

      return NextResponse.json({
        databaseSizeBytes: Number((sizeRes.rows[0] as { bytes?: string })?.bytes || 0),
        activeConnections: Number(
          (connRes.rows[0] as { active_connections?: number })?.active_connections || 1
        ),
        tables: tableStatsRes.rows,
        measuredAt: new Date().toISOString(),
      });
    }

    if (section === "api-health") {
      const checks = await db.select().from(apiHealthChecks);
      return NextResponse.json({ apis: checks });
    }

    if (section === "content" || section === "settings" || section === "announcements") {
      const settings = await db.select().from(systemSettings);
      return NextResponse.json({ settings });
    }

    if (section === "audit-logs") {
      const logs = await db
        .select()
        .from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(120);
      return NextResponse.json({ logs });
    }

    // Default: Overview
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const dayAgo = new Date(Date.now() - 86400000);

    const [
      totalUsers,
      newUsers,
      activeUsers,
      paidUsers,
      pendingVerifications,
      totalInvitations,
      totalCampaigns,
      pendingReports,
      openTickets,
      apis,
      sizeRes,
    ] = await Promise.all([
      db.select({ total: count() }).from(profiles),
      db.select({ total: count() }).from(profiles).where(gte(profiles.createdAt, weekAgo)),
      db.select({ total: count() }).from(profiles).where(gte(profiles.lastActiveAt, dayAgo)),
      db.select({ total: count() }).from(profiles).where(sql`${profiles.membershipPlan} != 'FREE'`),
      db
        .select({ total: count() })
        .from(verificationRequests)
        .where(eq(verificationRequests.status, "pending")),
      db.select({ total: count() }).from(invitations),
      db.select({ total: count() }).from(campaigns),
      db.select({ total: count() }).from(reports).where(eq(reports.status, "pending")),
      db.select({ total: count() }).from(supportTickets).where(eq(supportTickets.status, "open")),
      db.select().from(apiHealthChecks),
      db.execute(sql`SELECT pg_database_size(current_database())::bigint AS bytes`),
    ]);

    return NextResponse.json({
      adminRole: admin.role,
      overview: {
        totalUsers: Number(totalUsers[0]?.total || 0),
        newUsers7d: Number(newUsers[0]?.total || 0),
        activeUsers24h: Number(activeUsers[0]?.total || 0),
        paidMemberships: Number(paidUsers[0]?.total || 0),
        pendingVerifications: Number(pendingVerifications[0]?.total || 0),
        totalInvitations: Number(totalInvitations[0]?.total || 0),
        totalCampaigns: Number(totalCampaigns[0]?.total || 0),
        pendingReports: Number(pendingReports[0]?.total || 0),
        openTickets: Number(openTickets[0]?.total || 0),
        databaseSizeBytes: Number((sizeRes.rows[0] as { bytes?: string })?.bytes || 0),
        apis,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر تحميل بيانات لوحة الإدارة" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureSeeded();
    const admin = await requireRole("support");
    const body = await req.json().catch(() => null);
    const action = typeof body?.action === "string" ? body.action : "";

    // Moderate User Account (Moderator+)
    if (action === "moderate_user") {
      if (!hasRoleAccess(admin.role, "moderator")) {
        return NextResponse.json({ error: "صلاحية مشرف أو أعلى مطلوبة" }, { status: 403 });
      }
      const { userId, status, reason } = body;
      if (!userId || !["active", "suspended", "banned", "pending_review"].includes(status)) {
        return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
      }
      const target = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
      if (!target.length) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
      if (target[0].role === "owner") {
        return NextResponse.json({ error: "لا يمكن تعديل حالة حساب المالك" }, { status: 403 });
      }

      await db
        .update(profiles)
        .set({
          accountStatus: status,
          banReason: status === "banned" || status === "suspended" ? reason || "مخالفة السياسات" : null,
          bannedAt: status === "banned" ? new Date() : null,
          bannedBy: status === "banned" ? admin.id : null,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, userId));

      if (status === "banned" || status === "suspended") {
        await revokeAllUserSessions(userId);
      }

      await db.insert(notifications).values({
        userId,
        category: "admin",
        title: status === "active" ? "تحديث حالة الحساب: نشط" : "إشعار إداري حول حالة حسابك",
        body:
          status === "active"
            ? "تمت إعادة تفعيل حسابك بالكامل."
            : `تم تغيير حالة حسابك إلى (${status}). السبب: ${reason || "مراجعة إدارية"}. يمكنك تقديم اعتراض من مركز الدعم.`,
        actionUrl: "/support",
      });

      await logAudit({
        actorId: admin.id,
        actorRole: admin.role,
        action: `USER_STATUS_${status.toUpperCase()}`,
        targetType: "profile",
        targetId: userId,
        metadata: { reason },
      });

      return NextResponse.json({ ok: true });
    }

    // Update User Role (Owner ONLY!)
    if (action === "update_role") {
      if (admin.role !== "owner") {
        return NextResponse.json({ error: "تعديل صلاحيات المشرفين متاح للمالك فقط" }, { status: 403 });
      }
      const { userId, role } = body;
      if (!userId || !["user", "support", "moderator", "admin", "super_admin"].includes(role)) {
        return NextResponse.json({ error: "الدور غير صالح" }, { status: 400 });
      }
      await db.update(profiles).set({ role, updatedAt: new Date() }).where(eq(profiles.id, userId));
      await logAudit({
        actorId: admin.id,
        actorRole: admin.role,
        action: "USER_ROLE_CHANGED",
        targetType: "profile",
        targetId: userId,
        metadata: { newRole: role },
      });
      return NextResponse.json({ ok: true });
    }

    // Review Payment & Activate Subscription (Admin+)
    if (action === "review_subscription") {
      if (!hasRoleAccess(admin.role, "admin")) {
        return NextResponse.json({ error: "صلاحية مدير مطلوبة لمراجعة المدفوعات" }, { status: 403 });
      }
      const { subscriptionId, decision, note } = body;
      const subs = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, subscriptionId))
        .limit(1);
      if (!subs.length) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

      const sub = subs[0];
      const now = new Date();
      const endsAt = new Date(now.getTime() + 30 * 86400000);

      if (decision === "approve") {
        await db
          .update(subscriptions)
          .set({ status: "active", startsAt: now, endsAt, adminNote: note || null, reviewedBy: admin.id, reviewedAt: now })
          .where(eq(subscriptions.id, sub.id));
        await db
          .update(payments)
          .set({ status: "verified", verifiedBy: admin.id, verifiedAt: now })
          .where(eq(payments.subscriptionId, sub.id));
        await db
          .update(profiles)
          .set({
            membershipPlan: sub.planCode,
            membershipStartsAt: now,
            membershipExpiresAt: endsAt,
            updatedAt: now,
          })
          .where(eq(profiles.id, sub.userId));
        await db.insert(notifications).values({
          userId: sub.userId,
          category: "membership",
          title: `تم تفعيل عضوية ${sub.planCode}`,
          body: `تمت مراجعة طلبك وتفعيل باقة ${sub.planCode} بنجاح لمدة 30 يومًا. تذكر أن التوثيق يتطلب طلبًا ومراجعة بشرية مستقلة.`,
          actionUrl: "/settings/membership",
        });
      } else {
        await db
          .update(subscriptions)
          .set({ status: "rejected", adminNote: note || null, reviewedBy: admin.id, reviewedAt: now })
          .where(eq(subscriptions.id, sub.id));
        await db
          .update(payments)
          .set({ status: "rejected", verifiedBy: admin.id, verifiedAt: now })
          .where(eq(payments.subscriptionId, sub.id));
      }

      await logAudit({
        actorId: admin.id,
        actorRole: admin.role,
        action: `SUBSCRIPTION_${decision.toUpperCase()}`,
        targetType: "subscription",
        targetId: sub.id,
        metadata: { planCode: sub.planCode, note },
      });

      return NextResponse.json({ ok: true });
    }

    // Update Plan Price (Owner / Super Admin)
    if (action === "update_plan_price") {
      if (!hasRoleAccess(admin.role, "super_admin")) {
        return NextResponse.json({ error: "تعديل الأسعار متاح للمدير الأعلى والمالك فقط" }, { status: 403 });
      }
      const { code, priceEgp } = body;
      const numericPrice = Math.max(0, Math.min(100000, Math.floor(Number(priceEgp))));
      await db
        .update(membershipPlans)
        .set({ priceEgp: numericPrice, updatedAt: new Date() })
        .where(eq(membershipPlans.code, code));
      await logAudit({
        actorId: admin.id,
        actorRole: admin.role,
        action: "PLAN_PRICE_UPDATED",
        targetType: "membership_plan",
        targetId: code,
        metadata: { priceEgp: numericPrice },
      });
      return NextResponse.json({ ok: true });
    }

    // Manual Human Verification Decision (Admin+)
    if (action === "review_verification") {
      if (!hasRoleAccess(admin.role, "admin")) {
        return NextResponse.json({ error: "صلاحية مدير مطلوبة لاعتماد التوثيق" }, { status: 403 });
      }
      const { requestId, decision, reason } = body;
      const rows = await db
        .select()
        .from(verificationRequests)
        .where(eq(verificationRequests.id, requestId))
        .limit(1);
      if (!rows.length) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

      const reqRow = rows[0];
      const badge =
        decision === "approved"
          ? reqRow.planCode === "VIP"
            ? "VIP VERIFIED"
            : reqRow.planCode === "PRO"
            ? "PRO VERIFIED"
            : "PLUS VERIFIED"
          : null;

      await db
        .update(verificationRequests)
        .set({
          status: decision,
          badgeGranted: badge,
          decisionReason: reason || null,
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        })
        .where(eq(verificationRequests.id, reqRow.id));

      await db
        .update(profiles)
        .set({
          verificationStatus: decision,
          verificationBadge: decision === "approved" ? badge : null,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, reqRow.userId));

      await db.insert(notifications).values({
        userId: reqRow.userId,
        category: "membership",
        title: decision === "approved" ? `تهانينا! تم توثيق حسابك (${badge})` : "تحديث حول طلب التوثيق",
        body:
          decision === "approved"
            ? `تمت الموافقة البشرية على توثيق حسابك ومنحك شارة ${badge}.`
            : `تم تحديث حالة طلب التوثيق إلى (${decision}). ${reason || ""}`,
        actionUrl: "/profile",
      });

      await logAudit({
        actorId: admin.id,
        actorRole: admin.role,
        action: `VERIFICATION_${decision.toUpperCase()}`,
        targetType: "verification_request",
        targetId: reqRow.id,
        metadata: { badge, reason },
      });

      return NextResponse.json({ ok: true });
    }

    // Moderate Content (Invitation / Campaign / Community / Report)
    if (action === "moderate_content") {
      if (!hasRoleAccess(admin.role, "moderator")) {
        return NextResponse.json({ error: "صلاحية مشرف مطلوبة" }, { status: 403 });
      }
      const { entity, id, status, note } = body;
      if (entity === "invitation") {
        await db.update(invitations).set({ status }).where(eq(invitations.id, id));
      } else if (entity === "campaign") {
        await db.update(campaigns).set({ status }).where(eq(campaigns.id, id));
      } else if (entity === "community") {
        await db.update(communities).set({ status }).where(eq(communities.id, id));
      } else if (entity === "post") {
        await db.update(communityPosts).set({ status }).where(eq(communityPosts.id, id));
      } else if (entity === "report") {
        await db
          .update(reports)
          .set({ status, resolutionNote: note || null, reviewedBy: admin.id })
          .where(eq(reports.id, id));
      }

      await logAudit({
        actorId: admin.id,
        actorRole: admin.role,
        action: `MODERATE_${String(entity).toUpperCase()}`,
        targetType: String(entity),
        targetId: String(id),
        metadata: { status, note },
      });
      return NextResponse.json({ ok: true });
    }

    // Reply Support Ticket (Support+)
    if (action === "reply_ticket") {
      const { ticketId, reply, status } = body;
      const rows = await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.id, ticketId))
        .limit(1);
      if (!rows.length) return NextResponse.json({ error: "التذكرة غير موجودة" }, { status: 404 });

      await db
        .update(supportTickets)
        .set({
          adminReply: reply,
          status: status || "resolved",
          repliedBy: admin.id,
          repliedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(supportTickets.id, ticketId));

      if (rows[0].userId) {
        await db.insert(notifications).values({
          userId: rows[0].userId,
          category: "support",
          title: `رد الدعم على: ${rows[0].subject}`,
          body: String(reply).slice(0, 300),
          actionUrl: "/support",
        });
      }

      await logAudit({
        actorId: admin.id,
        actorRole: admin.role,
        action: "SUPPORT_TICKET_REPLIED",
        targetType: "support_ticket",
        targetId: ticketId,
      });

      return NextResponse.json({ ok: true });
    }

    // Update CMS / System Settings (Admin+)
    if (action === "update_setting") {
      if (!hasRoleAccess(admin.role, "admin")) {
        return NextResponse.json({ error: "صلاحية مدير مطلوبة" }, { status: 403 });
      }
      const { key, value } = body;
      if (!key) return NextResponse.json({ error: "مفتاح الإعداد مطلوب" }, { status: 400 });

      await db
        .insert(systemSettings)
        .values({ key, value, updatedBy: admin.id, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: systemSettings.key,
          set: { value, updatedBy: admin.id, updatedAt: new Date() },
        });

      await logAudit({
        actorId: admin.id,
        actorRole: admin.role,
        action: "SYSTEM_SETTING_UPDATED",
        targetType: "system_settings",
        targetId: key,
      });

      return NextResponse.json({ ok: true });
    }

    // Broadcast Announcement Notification (Admin+)
    if (action === "broadcast_notification") {
      if (!hasRoleAccess(admin.role, "admin")) {
        return NextResponse.json({ error: "صلاحية مدير مطلوبة" }, { status: 403 });
      }
      const { title, bodyText } = body;
      const activeUsers = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.accountStatus, "active"))
        .limit(500);

      if (activeUsers.length > 0) {
        await db.insert(notifications).values(
          activeUsers.map((u) => ({
            userId: u.id,
            category: "system",
            title: String(title).slice(0, 120),
            body: String(bodyText).slice(0, 400),
          }))
        );
      }

      await logAudit({
        actorId: admin.id,
        actorRole: admin.role,
        action: "BROADCAST_NOTIFICATION_SENT",
        targetType: "notification",
        metadata: { recipientsCount: activeUsers.length },
      });

      return NextResponse.json({ ok: true, count: activeUsers.length });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "تعذر تنفيذ الإجراء الإداري" }, { status: 500 });
  }
}
