"use client";

import React from "react";
import Link from "next/link";
import { EmptyStateArt } from "@/components/svg/YawmakArt";
import { YmReset, YmHome } from "@/components/svg/YawmakGlyphs";
import { YawmakButton, YawmakCard } from "@/components/ui/DesignSystem";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center py-16">
      <YawmakCard className="max-w-md w-full text-center space-y-5">
        <EmptyStateArt className="w-44 h-32 mx-auto" />
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-[var(--yawmak-text)]">حدث خطأ غير متوقع</h2>
          <p className="text-sm text-[var(--yawmak-text-muted)]">يمكنك إعادة المحاولة الآن.</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <YawmakButton onClick={() => reset()}>
            <YmReset size={18} /> إعادة المحاولة
          </YawmakButton>
          <Link href="/">
            <YawmakButton variant="secondary">
              <YmHome size={18} /> الرئيسية
            </YawmakButton>
          </Link>
        </div>
      </YawmakCard>
    </div>
  );
}
