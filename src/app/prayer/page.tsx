"use client";

import React, { useEffect, useState } from "react";
import { Clock, Bell, BellOff, Calendar } from "@/components/ui/icons";
import {
  YawmakCard,
  YawmakBadge,
  GovernorateSearchSelect,
  YawmakSkeleton,
} from "@/components/ui/DesignSystem";
import { useYawmak } from "@/components/providers/YawmakProvider";
import type { PrayerTimesData } from "@/lib/islamic-api";

const CALC_METHODS = [
  { id: 5, label: "الهيئة المصرية العامة للمساحة (الافتراضي لمصر)" },
  { id: 4, label: "أم القرى — مكة المكرمة" },
  { id: 3, label: "رابطة العالم الإسلامي" },
  { id: 2, label: "الجمعية الإسلامية لأمريكا الشمالية" },
];

const PRAYER_LIST = [
  { key: "Fajr", label: "الفجر" },
  { key: "Sunrise", label: "الشروق" },
  { key: "Dhuhr", label: "الظهر" },
  { key: "Asr", label: "العصر" },
  { key: "Maghrib", label: "المغرب" },
  { key: "Isha", label: "العشاء" },
] as const;

export default function PrayerPage() {
  const { user, settings, toast } = useYawmak();
  const [governorate, setGovernorate] = useState("القاهرة");
  const [method, setMethod] = useState(5);
  const [data, setData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<{ name: string; remaining: string } | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  useEffect(() => {
    const sync = window.setTimeout(() => {
      if (settings?.prayerCity) setGovernorate(settings.prayerCity);
      else if (user?.governorate) setGovernorate(user.governorate);
      if (settings?.prayerMethod) setMethod(settings.prayerMethod);
    }, 0);
    return () => window.clearTimeout(sync);
  }, [user, settings]);

  useEffect(() => {
    const sync = window.setTimeout(() => setLoading(true), 0);
    fetch(`/api/islamic/prayer?governorate=${encodeURIComponent(governorate)}&method=${method}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
    return () => window.clearTimeout(sync);
  }, [governorate, method]);

  // Live countdown to next prayer
  useEffect(() => {
    if (!data) return;
    const compute = () => {
      const now = new Date();
      const entries = PRAYER_LIST.map((p) => {
        const [hh, mm] = (data.timings[p.key] || "00:00").split(":").map(Number);
        const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh || 0, mm || 0, 0);
        return { label: p.label, dt };
      });
      const found = entries.find((e) => e.dt.getTime() > now.getTime());
      const [fHh, fMm] = (data.timings.Fajr || "04:30").split(":").map(Number);
      const next: { label: string; dt: Date } = found ?? {
        label: "الفجر (غدًا)",
        dt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, fHh || 4, fMm || 30, 0),
      };
      const diffSec = Math.max(0, Math.floor((next.dt.getTime() - now.getTime()) / 1000));
      const h = String(Math.floor(diffSec / 3600)).padStart(2, "0");
      const m = String(Math.floor((diffSec % 3600) / 60)).padStart(2, "0");
      const s = String(diffSec % 60).padStart(2, "0");
      setCountdown({ name: next.label, remaining: `${h}:${m}:${s}` });
    };
    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [data]);

  const toggleAlerts = async () => {
    if (!("Notification" in window)) {
      toast({ type: "warning", title: "متصفحك لا يدعم إشعارات التنبيه المحلية" });
      return;
    }
    if (!alertsEnabled) {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        setAlertsEnabled(true);
        toast({ type: "success", title: "تم تفعيل تنبيهات مواقيت الصلاة الاختيارية" });
      } else {
        toast({ type: "warning", title: "لم يتم منح إذن الإشعارات" });
      }
    } else {
      setAlertsEnabled(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <YawmakBadge tone="emerald">
            <Clock className="w-3.5 h-3.5" /> YAWMAK PRAYER — مواقيت دقيقة دون GPS
          </YawmakBadge>
          <h1 className="font-display text-3xl sm:text-4xl font-bold yawmak-gold-text">مواقيت الصلاة</h1>
          <p className="text-xs sm:text-sm text-[var(--yawmak-text-muted)]">
            اختر المحافظة وطريقة الحساب.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleAlerts}
          className={`inline-flex items-center gap-2 px-4 h-10 rounded-xl border text-xs font-bold cursor-pointer ${
            alertsEnabled
              ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300"
              : "bg-white/5 border-[var(--yawmak-border-subtle)] text-[var(--yawmak-text-muted)]"
          }`}
        >
          {alertsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          {alertsEnabled ? "التنبيهات مفعّلة" : "تفعيل تنبيه اختياري"}
        </button>
      </div>

      {/* Governorate & Method Selector */}
      <YawmakCard className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GovernorateSearchSelect
          label="المحافظة المختارة"
          value={governorate}
          onChange={setGovernorate}
          required={false}
        />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium">طريقة حساب المواقيت</label>
          <select
            value={method}
            onChange={(e) => setMethod(Number(e.target.value))}
            className="w-full h-11 px-3 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border-subtle)] text-sm"
          >
            {CALC_METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </YawmakCard>

      {loading || !data ? (
        <YawmakSkeleton className="h-64" />
      ) : (
        <>
          {/* Next Prayer Countdown Hero */}
          <YawmakCard glow className="text-center py-8 space-y-2 bg-gradient-to-br from-[#FAF3E3]/90 to-[#FAF8F3]">
            <p className="text-xs text-[var(--yawmak-text-muted)]">
              {data.dateHijri} • {data.dateGregorian}
            </p>
            <p className="text-sm font-semibold text-emerald-300">
              الوقت المتبقي لصلاة {countdown?.name || "..."}
            </p>
            <p className="text-5xl sm:text-6xl font-extrabold yawmak-gold-text font-mono tracking-wider">
              {countdown?.remaining || "--:--:--"}
            </p>
            <p className="text-[11px] text-[var(--yawmak-text-muted)]">
              المحافظة: {data.governorate} • المصدر: {data.source === "aladhan" ? "AlAdhan API (مخزن مؤقتًا)" : "الوضع الاحتياطي"}
            </p>
          </YawmakCard>

          {/* Today's 6 Prayer Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {PRAYER_LIST.map((p) => {
              const isNext = countdown?.name === p.label;
              return (
                <YawmakCard
                  key={p.key}
                  glow={isNext}
                  className={`!p-4 text-center ${isNext ? "border-[var(--yawmak-gold)]" : ""}`}
                >
                  <p className="text-xs text-[var(--yawmak-text-muted)]">{p.label}</p>
                  <p className="text-2xl font-bold yawmak-gold-text font-mono mt-1.5">
                    {data.timings[p.key]}
                  </p>
                  {isNext && <span className="text-[10px] text-emerald-300 font-bold">الصلاة القادمة</span>}
                </YawmakCard>
              );
            })}
          </div>

          {/* Upcoming 5 Days Table */}
          <YawmakCard className="space-y-4 overflow-x-auto">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--yawmak-gold)]" />
              مواقيت الأيام القادمة — {data.governorate}
            </h2>
            <table className="w-full text-xs text-right min-w-[540px]">
              <thead>
                <tr className="border-b border-[var(--yawmak-border)] text-[var(--yawmak-gold-soft)]">
                  <th className="py-2.5 px-2">اليوم</th>
                  <th className="py-2.5 px-2">الفجر</th>
                  <th className="py-2.5 px-2">الظهر</th>
                  <th className="py-2.5 px-2">العصر</th>
                  <th className="py-2.5 px-2">المغرب</th>
                  <th className="py-2.5 px-2">العشاء</th>
                </tr>
              </thead>
              <tbody>
                {data.upcomingDays.map((day, idx) => (
                  <tr key={idx} className="border-b border-[var(--yawmak-border-subtle)]">
                    <td className="py-2.5 px-2 font-semibold">{day.date}</td>
                    <td className="py-2.5 px-2 font-mono">{day.Fajr}</td>
                    <td className="py-2.5 px-2 font-mono">{day.Dhuhr}</td>
                    <td className="py-2.5 px-2 font-mono">{day.Asr}</td>
                    <td className="py-2.5 px-2 font-mono">{day.Maghrib}</td>
                    <td className="py-2.5 px-2 font-mono">{day.Isha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </YawmakCard>
        </>
      )}
    </div>
  );
}
