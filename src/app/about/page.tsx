import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ListChecks, StickyNote, Timer } from "@/components/ui/icons";
import { YawmakButton, YawmakCard, YawmakLogo } from "@/components/ui/DesignSystem";

export const metadata: Metadata = {
  title: "عن يومك",
  description: "يومك — مهامك وتركيزك وملاحظاتك في مكان واحد.",
};

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <YawmakCard glow className="text-center space-y-4 py-12">
        <div className="flex justify-center">
          <YawmakLogo size={52} />
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-[var(--yawmak-text)]">
          يومك… ببساطة وترتيب
        </h1>
        <p className="text-sm sm:text-base text-[var(--yawmak-text-muted)] max-w-2xl mx-auto leading-relaxed">
          YAWMAK | يومك مساحة تنظيم شخصية تجمع مهامك اليومية وجلسات تركيزك وملاحظاتك في واجهة عربية واحدة.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/tasks">
            <YawmakButton size="lg">ابدأ بمهمتك الأولى</YawmakButton>
          </Link>
          <Link href="/focus">
            <YawmakButton size="lg" variant="secondary">
              جلسة تركيز
            </YawmakButton>
          </Link>
        </div>
      </YawmakCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <YawmakCard className="space-y-2.5">
          <ListChecks className="w-7 h-7 text-[var(--yawmak-primary)]" />
          <h2 className="font-bold text-lg text-[var(--yawmak-text)]">مهام واضحة</h2>
          <p className="text-xs text-[var(--yawmak-text-muted)] leading-relaxed">
            أضف مهامك بمواعيدها وأولوياتها، وتابع نسبة إنجاز يومك.
          </p>
        </YawmakCard>

        <YawmakCard className="space-y-2.5">
          <Timer className="w-7 h-7 text-[var(--yawmak-primary)]" />
          <h2 className="font-bold text-lg text-[var(--yawmak-text)]">تركيز متواصل</h2>
          <p className="text-xs text-[var(--yawmak-text-muted)] leading-relaxed">
            مؤقت تركيز مع سجل جلسات يبقى محفوظًا حتى إن أغلقت المتصفح.
          </p>
        </YawmakCard>

        <YawmakCard className="space-y-2.5">
          <StickyNote className="w-7 h-7 text-[var(--yawmak-primary)]" />
          <h2 className="font-bold text-lg text-[var(--yawmak-text)]">ملاحظات سريعة</h2>
          <p className="text-xs text-[var(--yawmak-text-muted)] leading-relaxed">
            اكتب ملاحظاتك مع حفظ تلقائي وبحث وتثبيت للمهم منها.
          </p>
        </YawmakCard>
      </div>

      <YawmakCard className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-[var(--yawmak-text)]">تحتاج مساعدة؟</h3>
          <p className="text-xs text-[var(--yawmak-text-muted)]">فريق الدعم جاهز للرد على استفساراتك.</p>
        </div>
        <Link href="/support">
          <YawmakButton variant="secondary">تواصل معنا</YawmakButton>
        </Link>
      </YawmakCard>
    </div>
  );
}
