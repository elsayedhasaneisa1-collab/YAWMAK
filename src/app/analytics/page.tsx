"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Send,
  Users,
  Target,
  Flame,
  Info,
  Lock,
} from "@/components/ui/icons";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { YawmakCard, YawmakBadge, YawmakButton, YawmakSkeleton } from "@/components/ui/DesignSystem";
import { useYawmak } from "@/components/providers/YawmakProvider";

interface AnalyticsData {
  summary: {
    invitationsCount: number;
    totalInvitationViews: number;
    totalInvitationShares: number;
    campaignsCreated: number;
    campaignsJoined: number;
    habitsCount: number;
    totalHabitCompletions: number;
    goalsTotal: number;
    goalsCompleted: number;
    journalCount: number;
    totalTasbihSaved: number;
  };
  weeklyActivity: Array<{ day: string; invitations: number; journal: number; habits: number }>;
  topInvitations: Array<{ id: string; title: string; slug: string; views: number; shares: number; status: string }>;
  habitsBreakdown: Array<{ title: string; streak: number; completions: number }>;
}

export default function AnalyticsPage() {
  const { user } = useYawmak();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      const idle = window.setTimeout(() => setLoading(false), 0);
      return () => window.clearTimeout(idle);
    }
    fetch("/api/analytics")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <YawmakCard glow className="space-y-4 py-10">
          <Lock className="w-10 h-10 text-[var(--yawmak-gold)] mx-auto" />
          <h1 className="font-display text-2xl font-bold">تحليلات يومك الشخصية</h1>
          <p className="text-sm text-[var(--yawmak-text-muted)]">
            سجّل الدخول للاطلاع على إحصائياتك الحقيقية في الدعوات والحملات والعادات والأهداف.
          </p>
          <Link href="/login">
            <YawmakButton variant="primary">تسجيل الدخول</YawmakButton>
          </Link>
        </YawmakCard>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1.5">
        <YawmakBadge tone="emerald">
          <BarChart3 className="w-3.5 h-3.5" /> YAWMAK ANALYTICS — بيانات حقيقية 100%
        </YawmakBadge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold yawmak-gold-text">
          لوحة التحليلات والتقارير
        </h1>
        <p className="text-xs sm:text-sm text-[var(--yawmak-text-muted)]">
          تعرض هذه الأرقام نشاطك التنظيمي الفعلي داخل المنصة، وليست بأي حال مقياسًا للأجر أو الثواب.
        </p>
      </div>

      {loading || !data ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <YawmakSkeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <YawmakCard className="space-y-1">
              <p className="text-xs text-[var(--yawmak-text-muted)] flex items-center gap-1.5">
                <Send className="w-4 h-4 text-[var(--yawmak-gold)]" /> الدعوات والمشاهدات
              </p>
              <p className="text-3xl font-extrabold yawmak-gold-text">{data.summary.invitationsCount}</p>
              <p className="text-[11px] text-[var(--yawmak-text-muted)]">
                {data.summary.totalInvitationViews} مشاهدة • {data.summary.totalInvitationShares} مشاركة
              </p>
            </YawmakCard>

            <YawmakCard className="space-y-1">
              <p className="text-xs text-[var(--yawmak-text-muted)] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" /> الحملات
              </p>
              <p className="text-3xl font-extrabold text-emerald-300">{data.summary.campaignsJoined}</p>
              <p className="text-[11px] text-[var(--yawmak-text-muted)]">
                أنشأت {data.summary.campaignsCreated} حملة
              </p>
            </YawmakCard>

            <YawmakCard className="space-y-1">
              <p className="text-xs text-[var(--yawmak-text-muted)] flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[var(--yawmak-gold)]" /> العادات اليومية
              </p>
              <p className="text-3xl font-extrabold yawmak-gold-text">{data.summary.totalHabitCompletions}</p>
              <p className="text-[11px] text-[var(--yawmak-text-muted)]">
                إنجاز مسجل عبر {data.summary.habitsCount} عادات
              </p>
            </YawmakCard>

            <YawmakCard className="space-y-1">
              <p className="text-xs text-[var(--yawmak-text-muted)] flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" /> الأهداف والدفتر
              </p>
              <p className="text-3xl font-extrabold text-emerald-300">
                {data.summary.goalsCompleted} / {data.summary.goalsTotal}
              </p>
              <p className="text-[11px] text-[var(--yawmak-text-muted)]">
                {data.summary.journalCount} تدوينة • {data.summary.totalTasbihSaved} تسبيحة محفوظة
              </p>
            </YawmakCard>
          </div>

          {/* Weekly Chart */}
          <YawmakCard className="space-y-4">
            <h2 className="text-base font-bold">التقرير الأسبوعي (آخر 7 أيام)</h2>
            <div className="w-full h-72" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="day" stroke="#898494" fontSize={12} />
                  <YAxis stroke="#898494" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid rgba(212,175,55,0.35)",
                      borderRadius: "12px",
                      color: "#292638",
                    }}
                  />
                  <Bar dataKey="invitations" name="الدعوات" fill="#B89545" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="habits" name="العادات" fill="#B89545" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="journal" name="الدفتر" fill="#B89545" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </YawmakCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <YawmakCard className="space-y-3">
              <h3 className="text-base font-bold">أداء الدعوات</h3>
              {data.topInvitations.length === 0 ? (
                <p className="text-xs text-[var(--yawmak-text-muted)]">لا توجد دعوات بعد.</p>
              ) : (
                data.topInvitations.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/invitations/${inv.slug}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-[var(--yawmak-border-subtle)] hover:border-[var(--yawmak-gold)]/40"
                  >
                    <span className="text-sm font-semibold truncate">{inv.title}</span>
                    <span className="text-xs text-[var(--yawmak-gold-soft)] shrink-0 mr-2">
                      {inv.views} مشاهدة • {inv.shares} مشاركة
                    </span>
                  </Link>
                ))
              )}
            </YawmakCard>

            <YawmakCard className="space-y-3">
              <h3 className="text-base font-bold">متابعة العادات</h3>
              {data.habitsBreakdown.length === 0 ? (
                <p className="text-xs text-[var(--yawmak-text-muted)]">لا توجد عادات مضافة بعد.</p>
              ) : (
                data.habitsBreakdown.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-[var(--yawmak-border-subtle)] text-xs"
                  >
                    <span className="font-semibold text-sm">{h.title}</span>
                    <span className="text-emerald-300">
                      استمرارية: {h.streak} • الإجمالي: {h.completions}
                    </span>
                  </div>
                ))
              )}
            </YawmakCard>
          </div>

          <p className="text-[11px] text-[var(--yawmak-text-muted)] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[var(--yawmak-gold)]" />
            ملاحظة إيمانية: هذه التحليلات أداة تنظيمية شخصية فقط، ولا تعكس بأي حال قدر الأجر والثواب عند الله عز وجل.
          </p>
        </>
      )}
    </div>
  );
}
