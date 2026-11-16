import React from "react";
import Link from "next/link";
import { EmptyStateArt } from "@/components/svg/YawmakArt";
import { YmHome } from "@/components/svg/YawmakGlyphs";
import { YawmakButton, YawmakCard } from "@/components/ui/DesignSystem";

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center py-16">
      <YawmakCard className="max-w-md w-full text-center space-y-5">
        <EmptyStateArt className="w-44 h-32 mx-auto" />
        <div className="space-y-1.5">
          <p className="text-xs font-bold tracking-[0.3em] text-[var(--yawmak-primary)]">404</p>
          <h1 className="text-2xl font-bold text-[var(--yawmak-text)]">الصفحة غير موجودة</h1>
        </div>
        <Link href="/">
          <YawmakButton>
            <YmHome size={18} /> العودة إلى الرئيسية
          </YawmakButton>
        </Link>
      </YawmakCard>
    </div>
  );
}
