"use client";

import React, { useState } from "react";
import { MapPin } from "@/components/ui/icons";

export interface GovernorateStat {
  id: string;
  nameAr: string;
  nameEn: string;
  mapX: number;
  mapY: number;
  region: string;
  count: number;
  percentage: number;
}

export default function EgyptMap27({
  stats,
  totalAccounts,
  unknownCount,
}: {
  stats: GovernorateStat[];
  totalAccounts: number;
  unknownCount: number;
}) {
  const [selected, setSelected] = useState<GovernorateStat | null>(stats[0] || null);
  const maxCount = Math.max(1, ...stats.map((s) => s.count));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Interactive SVG Map of Egypt */}
      <div className="lg:col-span-6 rounded-2xl bg-[#FAF8F3] border border-[#B89545]/25 p-5 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#D4AF62] flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> خريطة محافظات مصر الـ27 التفاعلية
          </span>
          <span className="text-[#898494]">إجمالي الحسابات: {totalAccounts}</span>
        </div>

        <svg
          viewBox="0 0 460 480"
          className="w-full h-auto max-h-[440px] mx-auto"
          role="img"
          aria-label="خريطة توزيع الحسابات على محافظات مصر الـ27"
        >
          <defs>
            <radialGradient id="egyptGlow" cx="55%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#E8D8A8" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#FAF8F3" stopOpacity="0.95" />
            </radialGradient>
          </defs>

          {/* Stylized Egypt Geographic Silhouette (Mainland + Sinai Peninsula) */}
          <path
            d="M 55 82 L 175 74 L 222 68 L 285 62 L 322 86 L 348 92 L 388 86 L 404 146 L 380 232 L 352 210 L 332 162 L 334 198 L 368 265 L 402 355 L 420 436 L 315 442 L 176 442 L 62 436 L 52 292 L 50 154 Z"
            fill="url(#egyptGlow)"
            stroke="rgba(212,175,55,0.45)"
            strokeWidth="2"
          />

          {/* Stylized Nile River Path */}
          <path
            d="M 254 88 Q 250 150 256 196 Q 248 258 282 320 Q 322 362 312 436"
            fill="none"
            stroke="rgba(16,185,129,0.45)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* 27 Governorate Interactive Nodes */}
          {stats.map((gov) => {
            const intensity = gov.count / maxCount;
            const radius = 5.5 + intensity * 7;
            const isSelected = selected?.id === gov.id;
            return (
              <g
                key={gov.id}
                transform={`translate(${gov.mapX}, ${gov.mapY})`}
                onClick={() => setSelected(gov)}
                onMouseEnter={() => setSelected(gov)}
                className="cursor-pointer"
              >
                {gov.count > 0 && (
                  <circle
                    r={radius + 5}
                    fill="#B89545"
                    fillOpacity={0.14 + intensity * 0.22}
                  />
                )}
                <circle
                  r={isSelected ? radius + 2 : radius}
                  fill={gov.count > 0 ? "#B89545" : "#E8D8A8"}
                  stroke={isSelected ? "#FFFFFF" : "#FAF8F3"}
                  strokeWidth={isSelected ? 2 : 1.2}
                />
                <title>
                  {gov.nameAr}: {gov.count} حساب ({gov.percentage}%)
                </title>
              </g>
            );
          })}
        </svg>

        {selected && (
          <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#B89545]/35 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-sm text-[#D4AF62]">{selected.nameAr}</p>
              <p className="text-[#898494]">{selected.nameEn}</p>
            </div>
            <div className="text-left">
              <p className="text-lg font-extrabold text-[#292638]">{selected.count} حساب</p>
              <p className="text-emerald-300 font-semibold">{selected.percentage}% من الإجمالي</p>
            </div>
          </div>
        )}
      </div>

      {/* Ranked 27 Governorates Table */}
      <div className="lg:col-span-6 rounded-2xl bg-[#FAF8F3] border border-[#B89545]/25 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#D4AF62]">ترتيب المحافظات الـ27 (بيانات مجمّعة فقط)</h3>
          <span className="text-[11px] text-[#898494]">غير معروف (Unknown): {unknownCount}</span>
        </div>

        <div className="max-h-[460px] overflow-y-auto space-y-1.5 pl-1">
          {stats.map((gov, idx) => (
            <button
              key={gov.id}
              type="button"
              onClick={() => setSelected(gov)}
              className={`w-full p-2.5 rounded-xl border text-right flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${
                selected?.id === gov.id
                  ? "bg-[#B89545]/15 border-[#B89545]/50"
                  : "bg-white/[0.02] border-white/8 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-white/5 text-[#B89545] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="font-semibold truncate">{gov.nameAr}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden hidden sm:block">
                  <div
                    className="h-full yawmak-gold-gradient"
                    style={{ width: `${Math.max(4, gov.percentage)}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-[#D4AF62] w-10 text-left">{gov.count}</span>
                <span className="text-[#898494] font-mono w-12 text-left">{gov.percentage}%</span>
              </div>
            </button>
          ))}
        </div>

        <p className="text-[11px] text-[#898494] pt-2 border-t border-white/10">
          المصدر: المحافظة المختارة طوعًا عند التسجيل فقط. لا يُستخدم GPS ولا استنتاج الموقع من IP ولا تُكشف هويات الأفراد.
        </p>
      </div>
    </div>
  );
}
