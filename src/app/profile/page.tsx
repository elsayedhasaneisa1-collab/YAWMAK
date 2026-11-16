"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Settings,
  Crown,
  Bookmark,
  Send,
  Users,
  ExternalLink,
  Shield,
  LogIn,
} from "@/components/ui/icons";
import {
  YawmakCard,
  YawmakBadge,
  YawmakButton,
  VerificationSeal,
} from "@/components/ui/DesignSystem";
import { useYawmak } from "@/components/providers/YawmakProvider";
import { hasRoleAccess } from "@/lib/constants";

interface BookmarkItem {
  id: string;
  itemType: string;
  title: string;
  subtitle: string | null;
  note: string | null;
}

export default function ProfilePage() {
  const { user, loadingAuth } = useYawmak();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [invitations, setInvitations] = useState<Array<{ id: string; slug: string; title: string; status: string }>>([]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/bookmarks")
      .then((r) => (r.ok ? r.json() : { bookmarks: [] }))
      .then((d) => setBookmarks(d.bookmarks || []))
      .catch(() => undefined);

    fetch("/api/invitations?scope=mine")
      .then((r) => (r.ok ? r.json() : { invitations: [] }))
      .then((d) => setInvitations(d.invitations || []))
      .catch(() => undefined);
  }, [user]);

  if (loadingAuth) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-48 rounded-3xl animate-pulse bg-white/5" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <YawmakCard glow className="space-y-4 py-10">
          <LogIn className="w-10 h-10 text-[var(--yawmak-gold)] mx-auto" />
          <h1 className="font-display text-2xl font-bold">الملف الشخصي</h1>
          <p className="text-sm text-[var(--yawmak-text-muted)]">
            سجّل الدخول أو أنشئ حسابًا جديدًا للوصول إلى ملفك الشخصي ومفضلتك ودعواتك وإعداداتك.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/login">
              <YawmakButton variant="primary">تسجيل الدخول</YawmakButton>
            </Link>
            <Link href="/register">
              <YawmakButton variant="outline">إنشاء حساب جديد</YawmakButton>
            </Link>
          </div>
        </YawmakCard>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header Profile Card (Privacy-Safe: never shows phone/gender/governorate/password hint) */}
      <YawmakCard glow className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-right">
          <img
            src={user.avatarUrl || "/avatars/default-male.svg"}
            alt={user.username}
            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/avatars/default-male.svg"; }}
            className="w-24 h-24 rounded-3xl border-2 border-[var(--yawmak-gold)]/60 object-cover shadow-xl bg-[var(--yawmak-card)]"
          />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold">{user.username}</h1>
              <VerificationSeal badge={user.verificationBadge} />
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <YawmakBadge tone="gold">
                <Crown className="w-3.5 h-3.5" /> عضوية {user.membershipPlan}
              </YawmakBadge>
              <YawmakBadge tone={user.publicProfile ? "emerald" : "neutral"}>
                {user.publicProfile ? "الملف العام مفعل" : "ملف خاص"}
              </YawmakBadge>
            </div>

            {user.bio && (
              <p className="text-xs sm:text-sm text-[var(--yawmak-text-muted)] max-w-xl leading-relaxed">
                {user.bio}
              </p>
            )}

            {user.publicLinks.length > 0 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                {user.publicLinks.map((lnk, idx) => (
                  <a
                    key={idx}
                    href={lnk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-[var(--yawmak-border-subtle)] text-xs text-[var(--yawmak-gold-soft)] hover:border-[var(--yawmak-gold)]/50"
                  >
                    <ExternalLink className="w-3 h-3" /> {lnk.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
          <Link href="/settings">
            <YawmakButton variant="secondary" size="sm" className="w-full">
              <Settings className="w-4 h-4" /> إدارة الحساب
            </YawmakButton>
          </Link>
          <Link href="/settings/membership">
            <YawmakButton variant="outline" size="sm" className="w-full">
              <Crown className="w-4 h-4" /> العضوية والتوثيق
            </YawmakButton>
          </Link>
          {hasRoleAccess(user.role, "support") && (
            <Link href="/admin">
              <YawmakButton variant="primary" size="sm" className="w-full">
                <Shield className="w-4 h-4" /> لوحة الإدارة
              </YawmakButton>
            </Link>
          )}
        </div>
      </YawmakCard>

      {/* Invitations & Bookmarks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <YawmakCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Send className="w-4 h-4 text-[var(--yawmak-gold)]" /> بطاقاتي ({invitations.length})
            </h2>
            <Link href="/invitations" className="text-xs text-[var(--yawmak-gold-soft)] hover:underline">
              إدارة البطاقات
            </Link>
          </div>
          {invitations.length === 0 ? (
            <p className="text-xs text-[var(--yawmak-text-muted)]">لا توجد دعوات بعد.</p>
          ) : (
            <div className="space-y-2">
              {invitations.slice(0, 6).map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invitations/${inv.slug}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-[var(--yawmak-border-subtle)] hover:border-[var(--yawmak-gold)]/45 text-sm"
                >
                  <span className="truncate font-medium">{inv.title}</span>
                  <YawmakBadge tone={inv.status === "published" ? "emerald" : "neutral"}>
                    {inv.status === "published" ? "منشورة" : inv.status}
                  </YawmakBadge>
                </Link>
              ))}
            </div>
          )}
        </YawmakCard>

        <YawmakCard className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[var(--yawmak-gold)]" /> المفضلة والعلامات المرجعية ({bookmarks.length})
            </h2>
            <Link href="/quran" className="text-xs text-[var(--yawmak-gold-soft)] hover:underline">
              المصحف والأذكار
            </Link>
          </div>
          {bookmarks.length === 0 ? (
            <p className="text-xs text-[var(--yawmak-text-muted)]">لم تحفظ أي آيات أو أذكار أو أدعية في المفضلة بعد.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {bookmarks.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl bg-white/[0.02] border border-[var(--yawmak-border-subtle)] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--yawmak-gold-soft)]">{b.title}</span>
                    <YawmakBadge tone="neutral">{b.itemType}</YawmakBadge>
                  </div>
                  {b.subtitle && <p className="text-[11px] text-[var(--yawmak-text-muted)] line-clamp-1">{b.subtitle}</p>}
                  {b.note && <p className="text-xs text-emerald-300">ملاحظة: {b.note}</p>}
                </div>
              ))}
            </div>
          )}
        </YawmakCard>
      </div>

      {/* Quick Ecosystem Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/journal", label: "الدفتر والعادات" },
          { href: "/legacy", label: "الإنجازات" },
          { href: "/analytics", label: "إحصائياتي" },
          { href: "/settings/sessions", label: "الجلسات النشطة" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <YawmakCard className="!p-4 text-center hover:border-[var(--yawmak-gold)]/50 text-xs font-bold flex items-center justify-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[var(--yawmak-gold)]" />
              {item.label}
            </YawmakCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
