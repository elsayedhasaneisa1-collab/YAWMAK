"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  EyeOff,
  Crown,
  Laptop,
  Bell,
  LogOut,
  Trash2,
  ShieldCheck,
  CheckCheck,
} from "@/components/ui/icons";
import {
  YawmakCard,
  YawmakBadge,
  YawmakButton,
  YawmakInput,
  YawmakPasswordInput,
  YawmakTextarea,
  GovernorateSearchSelect,
  YawmakDialog,
  VerificationSeal,
} from "@/components/ui/DesignSystem";
import { useYawmak } from "@/components/providers/YawmakProvider";

export type SettingsTab =
  | "account"
  | "security"
  | "privacy"
  | "membership"
  | "sessions"
  | "notifications";

const NAV_ITEMS: Array<{ id: SettingsTab; href: string; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "account", href: "/settings/account", label: "بيانات الحساب", icon: User },
  { id: "security", href: "/settings/security", label: "الأمان وحذف الحساب", icon: Lock },
  { id: "privacy", href: "/settings/privacy", label: "الخصوصية", icon: EyeOff },
  { id: "membership", href: "/settings/membership", label: "العضوية والتوثيق", icon: Crown },
  { id: "sessions", href: "/settings/sessions", label: "الجلسات والأجهزة", icon: Laptop },
  { id: "notifications", href: "/settings/notifications", label: "الإشعارات", icon: Bell },
];

export default function SettingsWorkspace({ activeTab }: { activeTab: SettingsTab }) {
  const router = useRouter();
  const { user, loadingAuth, refreshUser, logout, toast } = useYawmak();

  // Account fields
  const [username, setUsername] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [publicProfile, setPublicProfile] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newHint, setNewHint] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  // Account Deletion
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Sessions
  const [sessions, setSessions] = useState<
    Array<{ id: string; deviceOs: string; browser: string; lastActiveAt: string; isCurrent: boolean }>
  >([]);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);

  // Membership & Verification
  const [membershipData, setMembershipData] = useState<{
    mySubscriptions: Array<{ id: string; planCode: string; status: string; amountEgp: number; createdAt: string }>;
    myVerifications: Array<{ id: string; planCode: string; status: string; badgeGranted: string | null; decisionReason: string | null }>;
  }>({ mySubscriptions: [], myVerifications: [] });
  const [verifyName, setVerifyName] = useState("");
  const [verifyReason, setVerifyReason] = useState("");
  const [verifyRefUrl, setVerifyRefUrl] = useState("");
  const [submittingVerify, setSubmittingVerify] = useState(false);

  // Notifications
  const [notifList, setNotifList] = useState<
    Array<{ id: string; category: string; title: string; body: string; isRead: boolean; createdAt: string }>
  >([]);

  useEffect(() => {
    if (!user) return;
    const sync = window.setTimeout(() => {
      setUsername(user.username);
      setGovernorate(user.governorate);
      setEmail(user.email || "");
      setBio(user.bio || "");
      setPublicProfile(user.publicProfile);
      if (user.canUploadAvatar && user.avatarUrl.startsWith("https://")) {
        setCustomAvatarUrl(user.avatarUrl);
      }
    }, 0);
    return () => window.clearTimeout(sync);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === "sessions") {
      fetch("/api/account/sessions")
        .then((r) => (r.ok ? r.json() : { sessions: [] }))
        .then((d) => setSessions(d.sessions || []))
        .catch(() => undefined);
    }
    if (activeTab === "membership") {
      fetch("/api/memberships")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d) {
            setMembershipData({
              mySubscriptions: d.mySubscriptions || [],
              myVerifications: d.myVerifications || [],
            });
          }
        })
        .catch(() => undefined);
    }
    if (activeTab === "notifications") {
      fetch("/api/notifications")
        .then((r) => (r.ok ? r.json() : { notifications: [] }))
        .then((d) => setNotifList(d.notifications || []))
        .catch(() => undefined);
    }
  }, [user, activeTab]);

  if (loadingAuth) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-64 rounded-3xl animate-pulse bg-white/5" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <YawmakCard glow className="space-y-4 py-10">
          <Lock className="w-10 h-10 text-[var(--yawmak-gold)] mx-auto" />
          <h1 className="font-display text-2xl font-bold">إعدادات الحساب المحمية</h1>
          <p className="text-sm text-[var(--yawmak-text-muted)]">يرجى تسجيل الدخول لإدارة حسابك.</p>
          <Link href="/login">
            <YawmakButton variant="primary">تسجيل الدخول</YawmakButton>
          </Link>
        </YawmakCard>
      </div>
    );
  }

  const saveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAccount(true);
    try {
      const payload: Record<string, unknown> = { username, governorate, email, bio, publicProfile };
      if (user.canUploadAvatar) payload.customAvatarUrl = customAvatarUrl;
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok) toast({ type: "error", title: d.error || "تعذر الحفظ" });
      else {
        await refreshUser();
        toast({ type: "success", title: "تم حفظ إعدادات حسابك بنجاح" });
      }
    } finally {
      setSavingAccount(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPass(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, passwordHint: newHint }),
      });
      const d = await res.json();
      if (!res.ok) toast({ type: "error", title: d.error || "تعذر تغيير كلمة المرور" });
      else {
        setCurrentPassword("");
        setNewPassword("");
        setNewHint("");
        toast({ type: "success", title: d.message });
      }
    } finally {
      setChangingPass(false);
    }
  };

  const confirmDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword, confirmText: deleteConfirmText }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast({ type: "error", title: d.error || "تعذر حذف الحساب" });
      } else {
        setDeleteDialogOpen(false);
        toast({ type: "success", title: d.message });
        await refreshUser();
        router.push("/");
      }
    } finally {
      setDeleting(false);
    }
  };

  const requestVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingVerify(true);
    try {
      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_verification",
          fullName: verifyName,
          reason: verifyReason,
          referenceUrl: verifyRefUrl,
        }),
      });
      const d = await res.json();
      if (!res.ok) toast({ type: "error", title: d.error });
      else {
        toast({ type: "success", title: d.message });
        setVerifyName("");
        setVerifyReason("");
        setVerifyRefUrl("");
        await refreshUser();
      }
    } finally {
      setSubmittingVerify(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold yawmak-gold-text">إدارة وإعدادات الحساب</h1>
        <p className="text-xs text-[var(--yawmak-text-muted)] mt-1">
          تحكم كامل ببياناتك، خصوصيتك، عضويتك، جلساتك النشطة، وإشعاراتك.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-1.5">
          <YawmakCard className="!p-2.5 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? "yawmak-gold-gradient text-[#FFFFFF]"
                      : "text-[var(--yawmak-text-muted)] hover:bg-white/5 hover:text-[var(--yawmak-text)]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </YawmakCard>
        </aside>

        {/* Active Panel */}
        <div className="lg:col-span-9 space-y-6">
          {activeTab === "account" && (
            <YawmakCard>
              <form onSubmit={saveAccount} className="space-y-4">
                <h2 className="text-lg font-bold">بيانات الحساب الأساسية</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <YawmakInput label="اسم المستخدم" required value={username} onChange={(e) => setUsername(e.target.value)} />
                  <YawmakInput label="البريد الإلكتروني (اختياري)" type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <GovernorateSearchSelect label="المحافظة (يمكن تعديلها دائمًا)" value={governorate} onChange={setGovernorate} />
                <YawmakTextarea label="نبذة تعريفية اختيارية" value={bio} onChange={(e) => setBio(e.target.value)} />
                {user.canUploadAvatar ? (
                  <YawmakInput
                    label="رابط الصورة الشخصية (HTTPS — متاح لـ PLUS وأعلى)"
                    dir="ltr"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    placeholder="https://..."
                  />
                ) : (
                  <p className="text-xs text-[var(--yawmak-text-muted)] p-3 rounded-xl bg-white/[0.03] border border-[var(--yawmak-border-subtle)]">
                    الباقة المجانية (FREE) تستخدم الصورة الافتراضية المخصصة تلقائيًا ولا تدعم تخصيص صورة شخصية.
                  </p>
                )}
                <YawmakButton type="submit" variant="primary" loading={savingAccount}>
                  حفظ التعديلات
                </YawmakButton>
              </form>
            </YawmakCard>
          )}

          {activeTab === "security" && (
            <>
              <YawmakCard>
                <form onSubmit={changePassword} className="space-y-4">
                  <h2 className="text-lg font-bold">تغيير كلمة المرور</h2>
                  <YawmakPasswordInput
                    label="كلمة المرور الحالية"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <YawmakPasswordInput
                    label="كلمة المرور الجديدة"
                    required
                    showStrength
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <YawmakInput
                    label="تلميح جديد لكلمة المرور (اختياري)"
                    value={newHint}
                    onChange={(e) => setNewHint(e.target.value)}
                  />
                  <YawmakButton type="submit" variant="primary" loading={changingPass}>
                    تحديث كلمة المرور وإبطال الجلسات القديمة
                  </YawmakButton>
                </form>
              </YawmakCard>

              {/* REAL ACCOUNT DELETION SECTION */}
              <YawmakCard className="border-red-500/40 bg-red-950/15 space-y-4">
                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-red-400 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" /> حذف الحساب نهائيًا
                  </h2>
                  <p className="text-xs text-[var(--yawmak-text-muted)] leading-relaxed">
                    تحذير هام: هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم حذف ملفك الشخصي، دعواتك، دفترك، عاداتك، أهدافك، مفضلتك، إشعاراتك، وإبطال جميع جلساتك فورًا. قد يُحتفظ فقط بسجل تدقيق مجهول الهوية لأغراض الامتثال والأمان دون أي بيانات شخصية أو كلمات مرور.
                  </p>
                </div>
                <YawmakButton variant="danger" onClick={() => setDeleteDialogOpen(true)}>
                  طلب الحذف النهائي لحسابي
                </YawmakButton>
              </YawmakCard>
            </>
          )}

          {activeTab === "privacy" && (
            <YawmakCard className="space-y-4">
              <h2 className="text-lg font-bold">إعدادات الخصوصية</h2>
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.03] border border-[var(--yawmak-border-subtle)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={publicProfile}
                  onChange={(e) => setPublicProfile(e.target.checked)}
                  className="mt-1 accent-[#B89545] w-4 h-4"
                />
                <div className="space-y-1">
                  <p className="text-sm font-bold">السماح بالملف الشخصي العام (اختياري)</p>
                  <p className="text-xs text-[var(--yawmak-text-muted)]">
                    يعرض اسم المستخدم والنبذة والروابط العامة ودعواتك العامة فقط. لن نعرض أبدًا رقم هاتفك أو بريدك الخاص أو النوع أو المحافظة أو تلميح كلمة المرور.
                  </p>
                </div>
              </label>
              <YawmakButton variant="primary" loading={savingAccount} onClick={saveAccount}>
                حفظ تفضيلات الخصوصية
              </YawmakButton>
            </YawmakCard>
          )}

          {activeTab === "membership" && (
            <div className="space-y-6">
              <YawmakCard glow className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-[var(--yawmak-text-muted)]">الباقة الحالية</p>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold yawmak-gold-text">{user.membershipPlan}</h2>
                    <VerificationSeal badge={user.verificationBadge} />
                  </div>
                  {user.membershipExpiresAt && (
                    <p className="text-xs text-[var(--yawmak-text-muted)]">
                      تاريخ الانتهاء: {new Date(user.membershipExpiresAt).toLocaleDateString("ar-EG")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href="/pricing">
                    <YawmakButton variant="primary" size="sm">ترقية / تجديد الباقة</YawmakButton>
                  </Link>
                  {user.membershipPlan !== "FREE" && (
                    <YawmakButton
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const r = await fetch("/api/memberships", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "cancel_subscription" }),
                        });
                        if (r.ok) {
                          await refreshUser();
                          toast({ type: "info", title: "تم إلغاء الاشتراك والعودة للخطة المجانية دون حذف بياناتك" });
                        }
                      }}
                    >
                      إلغاء الاشتراك
                    </YawmakButton>
                  )}
                </div>
              </YawmakCard>

              {/* Human Verification Request Form */}
              <YawmakCard className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[var(--yawmak-gold)]" />
                    طلب التوثيق البشري (PLUS / PRO / VIP VERIFIED)
                  </h3>
                  <p className="text-xs text-[var(--yawmak-text-muted)]">
                    الاشتراك المدفوع لا يمنح الشارة تلقائيًا؛ بل يحدد أولوية مراجعة طلبك من فريق إدارة يومك.
                  </p>
                </div>

                {user.membershipPlan === "FREE" ? (
                  <p className="text-xs text-amber-300">
                    طلب التوثيق متاح لأعضاء باقات PLUS و PRO و VIP فقط.
                  </p>
                ) : user.verificationStatus === "approved" ? (
                  <p className="text-xs text-emerald-300 font-bold">
                    حسابك موثق حاليًا بشارة: {user.verificationBadge}
                  </p>
                ) : (
                  <form onSubmit={requestVerification} className="space-y-3">
                    <YawmakInput label="الاسم الكامل للمراجعة الإدارية" required value={verifyName} onChange={(e) => setVerifyName(e.target.value)} />
                    <YawmakTextarea label="سبب طلب التوثيق ونشاطك الدعوي/المجتمعي" required value={verifyReason} onChange={(e) => setVerifyReason(e.target.value)} />
                    <YawmakInput label="رابط مرجعي (اختياري — HTTPS)" dir="ltr" value={verifyRefUrl} onChange={(e) => setVerifyRefUrl(e.target.value)} />
                    <YawmakButton type="submit" variant="primary" loading={submittingVerify}>
                      إرسال طلب التوثيق للمراجعة البشرية
                    </YawmakButton>
                  </form>
                )}

                {membershipData.myVerifications.length > 0 && (
                  <div className="pt-3 border-t border-[var(--yawmak-border-subtle)] space-y-2">
                    <p className="text-xs font-bold">سجل طلبات التوثيق</p>
                    {membershipData.myVerifications.map((v) => (
                      <div key={v.id} className="p-2.5 rounded-xl bg-white/[0.03] text-xs flex items-center justify-between">
                        <span>باقة {v.planCode} {v.decisionReason ? `— ${v.decisionReason}` : ""}</span>
                        <YawmakBadge tone={v.status === "approved" ? "emerald" : v.status === "rejected" ? "danger" : "gold"}>
                          {v.status}
                        </YawmakBadge>
                      </div>
                    ))}
                  </div>
                )}
              </YawmakCard>

              {/* Subscription History */}
              <YawmakCard className="space-y-3">
                <h3 className="text-base font-bold">سجل طلبات الاشتراك والمدفوعات</h3>
                {membershipData.mySubscriptions.length === 0 ? (
                  <p className="text-xs text-[var(--yawmak-text-muted)]">لا توجد طلبات اشتراك مسجلة بعد.</p>
                ) : (
                  membershipData.mySubscriptions.map((s) => (
                    <div key={s.id} className="p-3 rounded-xl bg-white/[0.02] border border-[var(--yawmak-border-subtle)] flex items-center justify-between text-xs">
                      <span>
                        باقة <strong>{s.planCode}</strong> — {s.amountEgp} ج.م
                      </span>
                      <YawmakBadge tone={s.status === "active" ? "emerald" : s.status === "rejected" ? "danger" : "gold"}>
                        {s.status}
                      </YawmakBadge>
                    </div>
                  ))
                )}
              </YawmakCard>
            </div>
          )}

          {activeTab === "sessions" && (
            <YawmakCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">الجلسات والأجهزة النشطة</h2>
                  <p className="text-xs text-[var(--yawmak-text-muted)]">
                    يمكنك إبطال أي جلسة منفردة أو تسجيل الخروج الفعلي من جميع الأجهزة فورًا.
                  </p>
                </div>
                <YawmakButton variant="danger" size="sm" onClick={() => setLogoutAllOpen(true)}>
                  <LogOut className="w-4 h-4" /> خروج من جميع الأجهزة
                </YawmakButton>
              </div>

              <div className="space-y-2.5">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-[var(--yawmak-border-subtle)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold flex items-center gap-2">
                        {s.deviceOs} • {s.browser}
                        {s.isCurrent && <YawmakBadge tone="emerald">الجلسة الحالية</YawmakBadge>}
                      </p>
                      <p className="text-[var(--yawmak-text-muted)] mt-0.5">
                        آخر نشاط: {new Date(s.lastActiveAt).toLocaleString("ar-EG")}
                      </p>
                    </div>
                    {!s.isCurrent && (
                      <YawmakButton
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await fetch("/api/account/sessions", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ sessionId: s.id }),
                          });
                          setSessions((prev) => prev.filter((x) => x.id !== s.id));
                          toast({ type: "success", title: "تم إنهاء الجلسة" });
                        }}
                      >
                        إنهاء
                      </YawmakButton>
                    )}
                  </div>
                ))}
              </div>
            </YawmakCard>
          )}

          {activeTab === "notifications" && (
            <YawmakCard className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">صندوق الإشعارات</h2>
                <YawmakButton
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await fetch("/api/notifications", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ markAllRead: true }),
                    });
                    setNotifList((prev) => prev.map((n) => ({ ...n, isRead: true })));
                    await refreshUser();
                    toast({ type: "success", title: "تم تحديد جميع الإشعارات كمقروءة" });
                  }}
                >
                  <CheckCheck className="w-4 h-4" /> تحديد الكل كمقروء
                </YawmakButton>
              </div>

              {notifList.length === 0 ? (
                <p className="text-sm text-[var(--yawmak-text-muted)] py-6 text-center">لا توجد إشعارات حاليًا.</p>
              ) : (
                <div className="space-y-2.5">
                  {notifList.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 rounded-xl border space-y-1 ${
                        n.isRead
                          ? "bg-white/[0.02] border-[var(--yawmak-border-subtle)]"
                          : "bg-[var(--yawmak-gold)]/10 border-[var(--yawmak-gold)]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold">{n.title}</p>
                        <button
                          type="button"
                          onClick={async () => {
                            await fetch(`/api/notifications?id=${encodeURIComponent(n.id)}`, { method: "DELETE" });
                            setNotifList((prev) => prev.filter((x) => x.id !== n.id));
                          }}
                          className="text-red-400 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-[var(--yawmak-text-muted)]">{n.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </YawmakCard>
          )}
        </div>
      </div>

      {/* Delete Account Final Confirmation Dialog */}
      <YawmakDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="تأكيد الحذف النهائي للحساب"
        description="لا يمكن التراجع عن حذف الحساب بعد تنفيذه."
        tone="danger"
      >
        <form onSubmit={confirmDeleteAccount} className="space-y-4">
          <YawmakPasswordInput
            label="أدخل كلمة المرور للتحقق من هويتك"
            required
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
          <YawmakInput
            label='اكتب عبارة "حذف حسابي" للتأكيد النهائي'
            required
            placeholder="حذف حسابي"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <YawmakButton type="button" variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              إلغاء
            </YawmakButton>
            <YawmakButton type="submit" variant="danger" loading={deleting}>
              حذف الحساب نهائيًا
            </YawmakButton>
          </div>
        </form>
      </YawmakDialog>

      {/* Logout All Devices Confirmation */}
      <YawmakDialog
        open={logoutAllOpen}
        onClose={() => setLogoutAllOpen(false)}
        title="تسجيل الخروج من جميع الأجهزة"
        description="سيتم إبطال جميع جلساتك النشطة فورًا على جميع الهواتف والمتصفحات بما في ذلك هذا الجهاز."
        tone="warning"
        footer={
          <>
            <YawmakButton variant="ghost" size="sm" onClick={() => setLogoutAllOpen(false)}>
              إلغاء
            </YawmakButton>
            <YawmakButton
              variant="danger"
              size="sm"
              onClick={async () => {
                await fetch("/api/account/sessions", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ all: true }),
                });
                setLogoutAllOpen(false);
                await logout();
                router.push("/login");
              }}
            >
              تأكيد إبطال جميع الجلسات
            </YawmakButton>
          </>
        }
      />
    </div>
  );
}
