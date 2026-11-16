"use client";

import React, { useMemo, useState } from "react";
import { Calendar, Info, SlidersHorizontal } from "@/components/ui/icons";
import { YawmakCard, YawmakBadge } from "@/components/ui/DesignSystem";
import {
  getHijriDateFormatted,
  HIJRI_MONTHS_AR,
  ISLAMIC_OCCASIONS,
} from "@/lib/islamic-data";

export default function HijriPage() {
  const [adjustment, setAdjustment] = useState(0);

  const todayInfo = useMemo(() => getHijriDateFormatted(new Date(), adjustment), [adjustment]);

  // Build 30-day calendar window around current Gregorian month mapped to Hijri dates
  const monthDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: totalDays }, (_, idx) => {
      const dt = new Date(year, month, idx + 1);
      const h = getHijriDateFormatted(dt, adjustment);
      return {
        gregDay: idx + 1,
        isToday: idx + 1 === now.getDate(),
        hijriDay: h.hijriDay,
        hijriMonth: h.hijriMonth,
      };
    });
  }, [adjustment]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1.5">
        <YawmakBadge tone="emerald">
          <Calendar className="w-3.5 h-3.5" /> YAWMAK HIJRI — التقويم الهجري والمناسبات
        </YawmakBadge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold yawmak-gold-text">التقويم الهجري</h1>
        <p className="text-xs sm:text-sm text-[var(--yawmak-text-muted)]">
          اعرض التاريخ الهجري والميلادي والأشهر الهجرية والمناسبات الإسلامية مع إمكانية تعديل اليوم حسب الرؤية المحلية.
        </p>
      </div>

      {/* Today Banner + Adjustment */}
      <YawmakCard glow className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs text-[var(--yawmak-gold-soft)] font-semibold">التاريخ الهجري اليوم</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">{todayInfo.hijriFull}</h2>
          <p className="text-xs text-[var(--yawmak-text-muted)]">الموافق ميلاديًا: {todayInfo.gregorianFull}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-[var(--yawmak-border-subtle)] space-y-2">
          <p className="text-xs font-bold flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--yawmak-gold)]" />
            تعديل التاريخ وفق الجهة المعتمدة
          </p>
          <div className="flex items-center gap-1.5">
            {[-2, -1, 0, 1, 2].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAdjustment(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  adjustment === val
                    ? "yawmak-gold-gradient text-[#FFFFFF]"
                    : "bg-white/5 text-[var(--yawmak-text-muted)] hover:bg-white/10"
                }`}
              >
                {val > 0 ? `+${val}` : val}
              </button>
            ))}
          </div>
        </div>
      </YawmakCard>

      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-200 flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          تنويه شرعي: يعتمد التقويم على حساب تقويم أم القرى الفلكي، وقد يختلف التاريخ الهجري بمقدار يوم واحد عن الرؤية الشرعية المحلية للهلال في بلدك؛ لذا أتحنا خيار التعديل اليدوي أعلاه.
        </span>
      </div>

      {/* Monthly Grid */}
      <YawmakCard className="space-y-4">
        <h3 className="text-base font-bold">العرض الشهري (هجري / ميلادي)</h3>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {monthDays.map((d) => (
            <div
              key={d.gregDay}
              className={`p-2.5 rounded-xl border text-center ${
                d.isToday
                  ? "bg-[var(--yawmak-gold)]/20 border-[var(--yawmak-gold)]"
                  : "bg-white/[0.02] border-[var(--yawmak-border-subtle)]"
              }`}
            >
              <p className="text-base font-bold text-[var(--yawmak-gold-soft)]">{d.hijriDay}</p>
              <p className="text-[10px] text-[var(--yawmak-text-muted)] truncate">{d.hijriMonth}</p>
              <p className="text-[10px] opacity-60 mt-1">{d.gregDay} م</p>
            </div>
          ))}
        </div>
      </YawmakCard>

      {/* 12 Months & Islamic Occasions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <YawmakCard className="space-y-3">
          <h3 className="text-base font-bold">الأشهر الهجرية الـ12</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {HIJRI_MONTHS_AR.map((m, idx) => (
              <div
                key={m}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-[var(--yawmak-border-subtle)] text-xs flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-lg bg-[var(--yawmak-gold)]/15 text-[var(--yawmak-gold-soft)] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="font-semibold">{m}</span>
              </div>
            ))}
          </div>
        </YawmakCard>

        <YawmakCard className="space-y-3">
          <h3 className="text-base font-bold">المناسبات الإسلامية البارزة</h3>
          <div className="space-y-2">
            {ISLAMIC_OCCASIONS.map((occ) => (
              <div
                key={occ.title}
                className="p-3 rounded-xl bg-white/[0.02] border border-[var(--yawmak-border-subtle)] flex items-center justify-between gap-2"
              >
                <div>
                  <p className="text-sm font-bold text-[var(--yawmak-text)]">{occ.title}</p>
                  <p className="text-[11px] text-[var(--yawmak-text-muted)]">{occ.note}</p>
                </div>
                <YawmakBadge tone="gold" className="shrink-0">
                  {occ.day} {HIJRI_MONTHS_AR[occ.month - 1]}
                </YawmakBadge>
              </div>
            ))}
          </div>
        </YawmakCard>
      </div>
    </div>
  );
}
