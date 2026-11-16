"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Palette } from "@/components/ui/icons";
import { YawmakBadge, YawmakSkeleton } from "@/components/ui/DesignSystem";

// Lazy-load studio editor ONLY when user opens /studio (Resource conservation rule!)
const YawmakStudioEditor = dynamic(() => import("@/components/studio/YawmakStudioEditor"), {
  ssr: false,
  loading: () => <YawmakSkeleton className="h-[520px]" />,
});

export default function StudioPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1.5">
        <YawmakBadge tone="gold">
          <Palette className="w-3.5 h-3.5" /> YAWMAK STUDIO — استوديو التصميم الفاخر
        </YawmakBadge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold yawmak-gold-text">
          استوديو تصميم البطاقات والدعوات
        </h1>
        <p className="text-xs sm:text-sm text-[var(--yawmak-text-muted)]">
          صمّم بطاقات قرآنية ودعوات ومنشورات إسلامية فاخرة بزخارف هندسية وتصدير فوري بدقة 1200×630 أو 1080×1080.
        </p>
      </div>

      <YawmakStudioEditor />
    </div>
  );
}
