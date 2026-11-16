"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Crown,
  CreditCard,
  BadgeCheck,
  Send,
  Flag,
  ShieldAlert,
  BarChart3,
  Map,
  Database,
  Activity,
  Headphones,
  FileText,
  Megaphone,
  Settings,
  ScrollText,
  ArrowRight,
  MessageSquare,
} from "@/components/ui/icons";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  YawmakLogo,
  YawmakCard,
  YawmakBadge,
  YawmakButton,
  YawmakInput,
  YawmakTextarea,
  YawmakSkeleton,
} from "@/components/ui/DesignSystem";
import { useYawmak } from "@/components/providers/YawmakProvider";
import { ADMIN_ROLES_AR, BAN_REASONS, type AdminRole } from "@/lib/constants";
import EgyptMap27, { type GovernorateStat } from "./EgyptMap27";

export type AdminSectionId =
  | "overview"
  | "users"
  | "memberships"
  | "payments"
  | "verifications"
  | "invitations"
  | "campaigns"
  | "communities"
  | "moderation"
  | "reports"
  | "visitors"
  | "geography"
  | "database"
  | "api-health"
  | "support"
  | "content"
  | "announcements"
  | "settings"
  | "audit-logs";

const ADMIN_NAV: Array<{
  id: AdminSectionId;
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "overview", href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "users", href: "/admin/users", label: "المستخدمون", icon: Users },
  { id: "memberships", href: "/admin/memberships", label: "العضويات", icon: Crown },
  { id: "payments", href: "/admin/payments", label: "المدفوعات", icon: CreditCard },
  { id: "verifications", href: "/admin/verifications", label: "مركز التوثيق", icon: BadgeCheck },
  { id: "invitations", href: "/admin/invitations", label: "الدعوات", icon: Send },
  { id: "campaigns", href: "/admin/campaigns", label: "الحملات", icon: Users },
  { id: "communities", href: "/admin/communities", label: "المجتمعات", icon: MessageSquare },
  { id: "moderation", href: "/admin/moderation", label: "مركز الإشراف", icon: ShieldAlert },
  { id: "reports", href: "/admin/reports", label: "البلاغات", icon: Flag },
  { id: "visitors", href: "/admin/visitors", label: "تحليلات الزوار", icon: BarChart3 },
  { id: "geography", href: "/admin/geography", label: "خريطة المحافظات (27)", icon: Map },
  { id: "database", href: "/admin/database", label: "مراقبة قاعدة البيانات", icon: Database },
  { id: "api-health", href: "/admin/api-health", label: "صحة الـ APIs", icon: Activity },
  { id: "support", href: "/admin/support", label: "تذاكر الدعم", icon: Headphones },
  { id: "content", href: "/admin/content", label: "إدارة المحتوى", icon: FileText },
  { id: "announcements", href: "/admin/announcements", label: "الإعلانات والتعميم", icon: Megaphone },
  { id: "settings", href: "/admin/settings", label: "إعدادات المنصة", icon: Settings },
  { id: "audit-logs", href: "/admin/audit-logs", label: "سجل التدقيق", icon: ScrollText },
];

export default function AdminControlCenter({ section }: { section: AdminSectionId }) {
  const { user, toast } = useYawmak();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [heroTitle, setHeroTitle] = useState("يومك… ببساطة وترتيب");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [whatsappPrimary, setWhatsappPrimary] = useState("01550802408");
  const [supportEmail, setSupportEmail] = useState("elsayedhasaneisa1@gmail.com");

  const apiSection = section === "payments" ? "memberships" : section;

  const loadSection = () => {
    setLoading(true);
    fetch(`/api/admin?section=${encodeURIComponent(apiSection)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (Array.isArray(d?.settings)) {
          for (const s of d.settings) {
            if (s.key === "site_content" && s.value) {
              setHeroTitle(s.value.heroTitle || "يومك… ببساطة وترتيب");
              setHeroSubtitle(s.value.heroSubtitle || "");
            }
            if (s.key === "support_contacts" && s.value) {
              setWhatsappPrimary(s.value.whatsappPrimary || "01550802408");
              setSupportEmail(s.value.email || "elsayedhasaneisa1@gmail.com");
            }
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const boot = window.setTimeout(loadSection, 0);
    return () => window.clearTimeout(boot);
  }, [apiSection]);

  const runAction = async (payload: Record<string, unknown>, successMsg: string) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await res.json();
    if (!res.ok) {
      toast({ type: "error", title: d.error || "تعذر تنفيذ الإجراء" });
    } else {
      toast({ type: "success", title: successMsg });
      loadSection();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#292638]">
      {/* Top Admin Command Bar */}
      <header className="sticky top-0 z-40 h-16 border-b border-[#B89545]/25 bg-[#FAF8F3]/95 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <YawmakLogo size={34} showText={false} />
          <div>
            <p className="text-xs font-extrabold tracking-[0.2em] yawmak-gold-text">
              YAWMAK CONTROL CENTER
            </p>
            <p className="text-[11px] text-[#898494]">
              الدور الإداري: {ADMIN_ROLES_AR[(user?.role as AdminRole) || "support"]}
            </p>
          </div>
        </div>
        <Link href="/">
          <YawmakButton variant="outline" size="sm">
            <ArrowRight className="w-4 h-4" /> العودة للمنصة
          </YawmakButton>
        </Link>
      </header>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-3 xl:col-span-2">
          <div className="rounded-2xl bg-[#FFFFFF] border border-[#B89545]/20 p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                    active
                      ? "yawmak-gold-gradient text-[#FFFFFF] font-bold"
                      : "text-[#898494] hover:text-[#292638] hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Main Workspace */}
        <div className="lg:col-span-9 xl:col-span-10 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <YawmakSkeleton className="h-32" />
              <YawmakSkeleton className="h-32" />
              <YawmakSkeleton className="h-32" />
            </div>
          ) : (
            <>
              {/* OVERVIEW */}
              {section === "overview" && data?.overview && (
                <div className="space-y-6">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold yawmak-gold-text">
                    لوحة القيادة الشاملة
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    {[
                      { label: "إجمالي المستخدمين", val: data.overview.totalUsers },
                      { label: "تسجيلات (7 أيام)", val: data.overview.newUsers7d },
                      { label: "نشطون (24 ساعة)", val: data.overview.activeUsers24h },
                      { label: "عضويات مدفوعة", val: data.overview.paidMemberships },
                      { label: "توثيقات معلقة", val: data.overview.pendingVerifications },
                      { label: "إجمالي الدعوات", val: data.overview.totalInvitations },
                      { label: "إجمالي الحملات", val: data.overview.totalCampaigns },
                      { label: "بلاغات معلقة", val: data.overview.pendingReports },
                      { label: "تذاكر دعم مفتوحة", val: data.overview.openTickets },
                      {
                        label: "حجم قاعدة البيانات",
                        val: `${(data.overview.databaseSizeBytes / (1024 * 1024)).toFixed(2)} MB`,
                      },
                    ].map((kpi) => (
                      <YawmakCard key={kpi.label} className="!p-4 bg-[#FFFFFF]">
                        <p className="text-[11px] text-[#898494]">{kpi.label}</p>
                        <p className="text-2xl font-extrabold yawmak-gold-text mt-1">{kpi.val}</p>
                      </YawmakCard>
                    ))}
                  </div>
                </div>
              )}

              {/* USERS MANAGEMENT */}
              {section === "users" && (
                <YawmakCard className="space-y-4 overflow-x-auto bg-[#FFFFFF]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-xl font-bold yawmak-gold-text">إدارة المستخدمين (دون كلمات مرور أو تلميحات)</h1>
                    <div className="w-64">
                      <YawmakInput
                        placeholder="بحث بالاسم أو المحافظة..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <table className="w-full text-xs text-right min-w-[780px]">
                    <thead>
                      <tr className="border-b border-[#B89545]/25 text-[#D4AF62]">
                        <th className="py-2.5 px-2">المستخدم</th>
                        <th className="py-2.5 px-2">المحافظة</th>
                        <th className="py-2.5 px-2">العضوية / التوثيق</th>
                        <th className="py-2.5 px-2">الدور</th>
                        <th className="py-2.5 px-2">الحالة</th>
                        <th className="py-2.5 px-2">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.users || [])
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .filter((u: any) => u.username.includes(searchTerm) || u.governorate.includes(searchTerm))
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .map((u: any) => (
                          <tr key={u.id} className="border-b border-white/8">
                            <td className="py-3 px-2 font-bold">{u.username}</td>
                            <td className="py-3 px-2">{u.governorate}</td>
                            <td className="py-3 px-2">
                              {u.membershipPlan} {u.verificationBadge ? `• ${u.verificationBadge}` : ""}
                            </td>
                            <td className="py-3 px-2">
                              {data.adminRole === "owner" && u.role !== "owner" ? (
                                <select
                                  value={u.role}
                                  onChange={(e) =>
                                    runAction(
                                      { action: "update_role", userId: u.id, role: e.target.value },
                                      "تم تحديث الدور الإداري"
                                    )
                                  }
                                  className="h-8 px-2 rounded-lg bg-[#FAF8F3] border border-white/15"
                                >
                                  <option value="user">مستخدم</option>
                                  <option value="support">دعم</option>
                                  <option value="moderator">مشرف</option>
                                  <option value="admin">مدير</option>
                                  <option value="super_admin">مدير أعلى</option>
                                </select>
                              ) : (
                                ADMIN_ROLES_AR[u.role as AdminRole] || u.role
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <YawmakBadge tone={u.accountStatus === "active" ? "emerald" : "danger"}>
                                {u.accountStatus}
                              </YawmakBadge>
                            </td>
                            <td className="py-3 px-2 flex flex-wrap gap-1.5">
                              {u.role !== "owner" && (
                                <>
                                  {u.accountStatus !== "suspended" && (
                                    <YawmakButton
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        runAction(
                                          { action: "moderate_user", userId: u.id, status: "suspended", reason: BAN_REASONS[5] },
                                          "تم تعليق الحساب وإبطال جلساته"
                                        )
                                      }
                                    >
                                      تعليق
                                    </YawmakButton>
                                  )}
                                  {u.accountStatus !== "banned" ? (
                                    <YawmakButton
                                      size="sm"
                                      variant="danger"
                                      onClick={() =>
                                        runAction(
                                          { action: "moderate_user", userId: u.id, status: "banned", reason: BAN_REASONS[0] },
                                          "تم حظر الحساب وإبطال جلساته"
                                        )
                                      }
                                    >
                                      حظر
                                    </YawmakButton>
                                  ) : (
                                    <YawmakButton
                                      size="sm"
                                      variant="success"
                                      onClick={() =>
                                        runAction(
                                          { action: "moderate_user", userId: u.id, status: "active" },
                                          "تم رفع الحظر"
                                        )
                                      }
                                    >
                                      رفع الحظر
                                    </YawmakButton>
                                  )}
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </YawmakCard>
              )}

              {/* MEMBERSHIPS & PAYMENTS */}
              {(section === "memberships" || section === "payments") && (
                <div className="space-y-6">
                  <YawmakCard className="space-y-4 bg-[#FFFFFF]">
                    <h2 className="text-lg font-bold yawmak-gold-text">إدارة أسعار الخطط (EGP / شهريًا)</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(data?.plans || []).map((p: any) => (
                        <div key={p.code} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                          <p className="font-bold text-sm">{p.code} — {p.nameAr}</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              defaultValue={p.priceEgp}
                              id={`price-${p.code}`}
                              className="w-24 h-9 px-2 rounded-lg bg-[#FAF8F3] border border-white/15 text-xs"
                            />
                            <YawmakButton
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const el = document.getElementById(`price-${p.code}`) as HTMLInputElement | null;
                                if (el) {
                                  runAction(
                                    { action: "update_plan_price", code: p.code, priceEgp: Number(el.value) },
                                    `تم تحديث سعر باقة ${p.code}`
                                  );
                                }
                              }}
                            >
                              حفظ
                            </YawmakButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  </YawmakCard>

                  <YawmakCard className="space-y-3 bg-[#FFFFFF]">
                    <h2 className="text-lg font-bold yawmak-gold-text">مراجعة طلبات الاشتراك والمدفوعات</h2>
                    {(data?.subscriptions || []).length === 0 ? (
                      <p className="text-xs text-[#898494]">لا توجد طلبات اشتراك حاليًا.</p>
                    ) : (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (data?.subscriptions || []).map((s: any) => (
                        <div
                          key={s.id}
                          className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <p className="font-bold">
                              {s.username} — باقة {s.planCode} ({s.amountEgp} ج.م)
                            </p>
                            <p className="text-[#898494]">
                              الطريقة: {s.paymentMethod} • المرجع: {s.paymentReference || "-"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <YawmakBadge tone={s.status === "active" ? "emerald" : "gold"}>{s.status}</YawmakBadge>
                            {s.status === "pending" && (
                              <>
                                <YawmakButton
                                  size="sm"
                                  variant="success"
                                  onClick={() =>
                                    runAction(
                                      { action: "review_subscription", subscriptionId: s.id, decision: "approve" },
                                      "تم التحقق من الدفع وتفعيل الاشتراك"
                                    )
                                  }
                                >
                                  اعتماد وتفعيل
                                </YawmakButton>
                                <YawmakButton
                                  size="sm"
                                  variant="danger"
                                  onClick={() =>
                                    runAction(
                                      { action: "review_subscription", subscriptionId: s.id, decision: "reject" },
                                      "تم رفض الطلب"
                                    )
                                  }
                                >
                                  رفض
                                </YawmakButton>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </YawmakCard>
                </div>
              )}

              {/* HUMAN VERIFICATION CENTER */}
              {section === "verifications" && (
                <YawmakCard className="space-y-4 bg-[#FFFFFF]">
                  <h1 className="text-xl font-bold yawmak-gold-text">مركز التوثيق البشري (Verification Center)</h1>
                  {(data?.requests || []).length === 0 ? (
                    <p className="text-xs text-[#898494]">لا توجد طلبات توثيق حاليًا.</p>
                  ) : (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (data?.requests || []).map((req: any) => (
                      <div key={req.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-sm">
                            {req.username} ({req.fullName}) — {req.planCode} (أولوية {req.priority})
                          </span>
                          <YawmakBadge tone={req.status === "approved" ? "emerald" : req.status === "pending" ? "gold" : "danger"}>
                            {req.status}
                          </YawmakBadge>
                        </div>
                        <p className="text-[#898494]">{req.reason}</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <YawmakButton
                            size="sm"
                            variant="success"
                            onClick={() =>
                              runAction(
                                { action: "review_verification", requestId: req.id, decision: "approved", reason: "تم التحقق البشري" },
                                "تم منح شارة التوثيق بنجاح"
                              )
                            }
                          >
                            موافقة ومنح الشارة
                          </YawmakButton>
                          <YawmakButton
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              runAction(
                                { action: "review_verification", requestId: req.id, decision: "rejected", reason: "بيانات غير كافية" },
                                "تم رفض الطلب"
                              )
                            }
                          >
                            رفض
                          </YawmakButton>
                          {req.status === "approved" && (
                            <YawmakButton
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                runAction(
                                  { action: "review_verification", requestId: req.id, decision: "revoked", reason: "سحب التوثيق إداريًا" },
                                  "تم سحب الشارة"
                                )
                              }
                            >
                              سحب التوثيق
                            </YawmakButton>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </YawmakCard>
              )}

              {/* INVITATIONS / CAMPAIGNS / COMMUNITIES / MODERATION / REPORTS */}
              {section === "invitations" && (
                <YawmakCard className="space-y-3 bg-[#FFFFFF]">
                  <h1 className="text-xl font-bold yawmak-gold-text">إدارة الدعوات</h1>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(data?.invitations || []).map((inv: any) => (
                    <div key={inv.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <p className="font-bold">{inv.title}</p>
                        <p className="text-[#898494]">بواسطة {inv.creatorName} • {inv.viewsCount} مشاهدة</p>
                      </div>
                      <div className="flex gap-2">
                        <YawmakBadge>{inv.status}</YawmakBadge>
                        <YawmakButton size="sm" variant="outline" onClick={() => runAction({ action: "moderate_content", entity: "invitation", id: inv.id, status: "paused" }, "تم إيقاف الدعوة")}>
                          إيقاف
                        </YawmakButton>
                        <YawmakButton size="sm" variant="danger" onClick={() => runAction({ action: "moderate_content", entity: "invitation", id: inv.id, status: "removed" }, "تمت إزالة الدعوة المخالفة")}>
                          حذف مخالفة
                        </YawmakButton>
                      </div>
                    </div>
                  ))}
                </YawmakCard>
              )}

              {section === "campaigns" && (
                <YawmakCard className="space-y-3 bg-[#FFFFFF]">
                  <h1 className="text-xl font-bold yawmak-gold-text">إدارة الحملات</h1>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(data?.campaigns || []).map((c: any) => (
                    <div key={c.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <p className="font-bold">{c.title}</p>
                        <p className="text-[#898494]">بواسطة {c.creatorName} • التقدم: {c.currentProgress}/{c.goalTarget}</p>
                      </div>
                      <div className="flex gap-2">
                        <YawmakBadge>{c.status}</YawmakBadge>
                        <YawmakButton size="sm" variant="outline" onClick={() => runAction({ action: "moderate_content", entity: "campaign", id: c.id, status: c.status === "active" ? "paused" : "active" }, "تم تحديث حالة الحملة")}>
                          {c.status === "active" ? "إيقاف" : "تفعيل"}
                        </YawmakButton>
                      </div>
                    </div>
                  ))}
                </YawmakCard>
              )}

              {section === "communities" && (
                <YawmakCard className="space-y-4 bg-[#FFFFFF]">
                  <h1 className="text-xl font-bold yawmak-gold-text">إدارة المجتمعات والمنشورات</h1>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(data?.communities || []).map((c: any) => (
                    <div key={c.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                      <span className="font-bold">{c.name} (بواسطة {c.creatorName})</span>
                      <YawmakButton size="sm" variant="outline" onClick={() => runAction({ action: "moderate_content", entity: "community", id: c.id, status: c.status === "active" ? "suspended" : "active" }, "تم التحديث")}>
                        {c.status === "active" ? "تعليق" : "تفعيل"}
                      </YawmakButton>
                    </div>
                  ))}
                </YawmakCard>
              )}

              {(section === "moderation" || section === "reports") && (
                <YawmakCard className="space-y-3 bg-[#FFFFFF]">
                  <h1 className="text-xl font-bold yawmak-gold-text">مركز البلاغات والإشراف البشري</h1>
                  {(data?.reports || []).length === 0 ? (
                    <p className="text-xs text-[#898494]">لا توجد بلاغات مسجلة حاليًا.</p>
                  ) : (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (data?.reports || []).map((r: any) => (
                      <div key={r.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div>
                          <p className="font-bold">{r.reason} ({r.targetType})</p>
                          <p className="text-[#898494]">{r.details || r.targetId}</p>
                        </div>
                        <div className="flex gap-2">
                          <YawmakBadge tone={r.status === "resolved" ? "emerald" : "gold"}>{r.status}</YawmakBadge>
                          <YawmakButton size="sm" variant="success" onClick={() => runAction({ action: "moderate_content", entity: "report", id: r.id, status: "resolved" }, "تمت معالجة البلاغ")}>
                            اعتماد المعالجة
                          </YawmakButton>
                          <YawmakButton size="sm" variant="ghost" onClick={() => runAction({ action: "moderate_content", entity: "report", id: r.id, status: "dismissed" }, "تم إغلاق البلاغ")}>
                            رفض
                          </YawmakButton>
                        </div>
                      </div>
                    ))
                  )}
                </YawmakCard>
              )}

              {/* VISITOR ANALYTICS */}
              {section === "visitors" && (
                <div className="space-y-6">
                  <YawmakCard className="space-y-4 bg-[#FFFFFF]">
                    <h1 className="text-xl font-bold yawmak-gold-text">تحليلات الزوار المجمّعة (دون بصمة جهاز)</h1>
                    <div className="w-full h-72" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data?.daily || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                          <XAxis dataKey="dateKey" stroke="#898494" fontSize={11} />
                          <YAxis stroke="#898494" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#B89545" }} />
                          <Area type="monotone" dataKey="pageViews" name="مشاهدات الصفحات" stroke="#B89545" fill="#B89545" fillOpacity={0.2} />
                          <Area type="monotone" dataKey="uniqueVisitors" name="زوار جدد" stroke="#B89545" fill="#B89545" fillOpacity={0.2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </YawmakCard>

                  <YawmakCard className="space-y-3 bg-[#FFFFFF]">
                    <h2 className="text-base font-bold">الصفحات الأكثر زيارة</h2>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(data?.topPages || []).map((p: any) => (
                      <div key={p.path} className="flex items-center justify-between text-xs py-2 border-b border-white/8">
                        <span className="font-mono text-[#D4AF62]">{p.path}</span>
                        <span className="font-bold">{p.views} مشاهدة</span>
                      </div>
                    ))}
                  </YawmakCard>
                </div>
              )}

              {/* EGYPT 27 GOVERNORATES INTERACTIVE MAP */}
              {section === "geography" && (
                <div className="space-y-4">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold yawmak-gold-text">
                    التحليلات الجغرافية — محافظات مصر الـ27
                  </h1>
                  <EgyptMap27
                    stats={(data?.governorates || []) as GovernorateStat[]}
                    totalAccounts={Number(data?.totalAccounts || 0)}
                    unknownCount={Number(data?.unknownCount || 0)}
                  />
                </div>
              )}

              {/* DATABASE MONITOR */}
              {section === "database" && (
                <div className="space-y-4">
                  <h1 className="text-xl font-bold yawmak-gold-text">مراقبة قاعدة البيانات الفعلية (PostgreSQL)</h1>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <YawmakCard className="bg-[#FFFFFF]">
                      <p className="text-xs text-[#898494]">حجم القاعدة الفعلي</p>
                      <p className="text-2xl font-bold yawmak-gold-text mt-1">
                        {((data?.databaseSizeBytes || 0) / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </YawmakCard>
                    <YawmakCard className="bg-[#FFFFFF]">
                      <p className="text-xs text-[#898494]">الاتصالات النشطة</p>
                      <p className="text-2xl font-bold text-emerald-400 mt-1">{data?.activeConnections || 1}</p>
                    </YawmakCard>
                    <YawmakCard className="bg-[#FFFFFF]">
                      <p className="text-xs text-[#898494]">آخر قياس</p>
                      <p className="text-sm font-mono mt-2">{data?.measuredAt ? new Date(data.measuredAt).toLocaleTimeString("ar-EG") : "-"}</p>
                    </YawmakCard>
                  </div>
                  <YawmakCard className="bg-[#FFFFFF] space-y-2">
                    <h2 className="text-sm font-bold">الجداول وعدد الصفوف الحية</h2>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(data?.tables || []).map((t: any) => (
                      <div key={t.table_name} className="flex justify-between text-xs py-1.5 border-b border-white/8">
                        <span className="font-mono text-[#D4AF62]">{t.table_name}</span>
                        <span>{t.row_count} صف</span>
                      </div>
                    ))}
                  </YawmakCard>
                </div>
              )}

              {/* API HEALTH MONITOR */}
              {section === "api-health" && (
                <YawmakCard className="space-y-3 bg-[#FFFFFF]">
                  <h1 className="text-xl font-bold yawmak-gold-text">مراقبة صحة الواجهات الخارجية (API Health)</h1>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(data?.apis || []).map((api: any) => (
                    <div key={api.apiName} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-sm">{api.apiName}</p>
                        <p className="text-[#898494] font-mono">{api.endpoint}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>زمن الاستجابة: {api.responseTimeMs} ms</span>
                        <span>أخطاء: {api.errorCount}</span>
                        <YawmakBadge tone={api.status === "healthy" ? "emerald" : "danger"}>{api.status}</YawmakBadge>
                      </div>
                    </div>
                  ))}
                </YawmakCard>
              )}

              {/* SUPPORT TICKETS */}
              {section === "support" && (
                <YawmakCard className="space-y-4 bg-[#FFFFFF]">
                  <h1 className="text-xl font-bold yawmak-gold-text">إدارة تذاكر الدعم وبلاغات الخصوصية</h1>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(data?.tickets || []).map((t: any) => (
                    <div key={t.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{t.subject} ({t.category})</span>
                        <YawmakBadge tone={t.status === "resolved" ? "emerald" : "gold"}>{t.status}</YawmakBadge>
                      </div>
                      <p className="text-[#898494]">التواصل: {t.contactInfo}</p>
                      <p>{t.message}</p>
                      <div className="flex gap-2">
                        <input
                          value={replyDrafts[t.id] ?? t.adminReply ?? ""}
                          onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [t.id]: e.target.value }))}
                          placeholder="اكتب رد الإدارة..."
                          className="flex-1 h-9 px-3 rounded-xl bg-[#FAF8F3] border border-white/15"
                        />
                        <YawmakButton
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            runAction(
                              { action: "reply_ticket", ticketId: t.id, reply: replyDrafts[t.id] || "تمت المراجعة", status: "resolved" },
                              "تم إرسال الرد للمستخدم"
                            )
                          }
                        >
                          إرسال الرد
                        </YawmakButton>
                      </div>
                    </div>
                  ))}
                </YawmakCard>
              )}

              {/* CMS / SETTINGS / ANNOUNCEMENTS */}
              {(section === "content" || section === "settings" || section === "announcements") && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <YawmakCard className="space-y-4 bg-[#FFFFFF]">
                    <h2 className="text-lg font-bold yawmak-gold-text">إدارة نصوص الصفحة الرئيسية وروابط الدعم</h2>
                    <YawmakInput label="عنوان الهيرو" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
                    <YawmakTextarea label="وصف المنصة" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
                    <YawmakButton
                      variant="primary"
                      onClick={() =>
                        runAction(
                          { action: "update_setting", key: "site_content", value: { heroTitle, heroSubtitle } },
                          "تم تحديث محتوى الصفحة الرئيسية"
                        )
                      }
                    >
                      حفظ المحتوى
                    </YawmakButton>
                    <hr className="border-white/10" />
                    <YawmakInput label="رقم واتساب الدعم الأساسي" value={whatsappPrimary} onChange={(e) => setWhatsappPrimary(e.target.value)} />
                    <YawmakInput label="البريد الرسمي" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
                    <YawmakButton
                      variant="secondary"
                      onClick={() =>
                        runAction(
                          {
                            action: "update_setting",
                            key: "support_contacts",
                            value: {
                              whatsappPrimary,
                              whatsappSecondary: "01041254010",
                              email: supportEmail,
                              facebook: "https://www.facebook.com/share/1HfHwZvxGP/",
                              instagram: "https://www.instagram.com/eng.sayedhasan?cplk=MTN0bWJjaGY1d3dobg==",
                              tiktok: "https://www.tiktok.com/@eng.sayedhasan",
                              telegram: "@sayoda_elgadar",
                              telegramUrl: "https://t.me/sayoda_elgadar",
                              whatsappCommunity: "https://chat.whatsapp.com/JWTRlLrWI4nFuXFZsN1U0q?s=cl&p=a&iam=2",
                            },
                          },
                          "تم تحديث روابط الدعم الرسمية"
                        )
                      }
                    >
                      حفظ روابط الدعم
                    </YawmakButton>
                  </YawmakCard>

                  <YawmakCard className="space-y-4 bg-[#FFFFFF]">
                    <h2 className="text-lg font-bold yawmak-gold-text">إرسال إشعار تعميم عام للأعضاء</h2>
                    <YawmakInput label="عنوان الإشعار" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} />
                    <YawmakTextarea label="نص التعميم" value={broadcastBody} onChange={(e) => setBroadcastBody(e.target.value)} />
                    <YawmakButton
                      variant="primary"
                      onClick={() => {
                        runAction(
                          { action: "broadcast_notification", title: broadcastTitle, bodyText: broadcastBody },
                          "تم إرسال التعميم للأعضاء النشطين"
                        );
                        setBroadcastTitle("");
                        setBroadcastBody("");
                      }}
                    >
                      إرسال التعميم
                    </YawmakButton>
                  </YawmakCard>
                </div>
              )}

              {/* AUDIT LOGS */}
              {section === "audit-logs" && (
                <YawmakCard className="space-y-3 bg-[#FFFFFF]">
                  <h1 className="text-xl font-bold yawmak-gold-text">سجل التدقيق الأمني (Audit Logs)</h1>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(data?.logs || []).map((log: any) => (
                      <div key={log.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/8 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="font-mono font-bold text-[#D4AF62]">{log.action}</span>
                          <span className="text-[#898494] mr-2">
                            ({log.targetType}) • الدور: {log.actorRole}
                          </span>
                        </div>
                        <span className="text-[#898494] font-mono">
                          {new Date(log.createdAt).toLocaleString("ar-EG")}
                        </span>
                      </div>
                    ))}
                  </div>
                </YawmakCard>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
