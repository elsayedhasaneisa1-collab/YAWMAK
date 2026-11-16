import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Archive,
  BarChart3,
  BookMarked,
  BookOpen,
  Calendar,
  CircleDot,
  Clock,
  Compass,
  Crown,
  HeartHandshake,
  ListChecks,
  Palette,
  Send,
  Sparkles,
  StickyNote,
  Timer,
  Users,
} from "@/components/ui/icons";
import { YawmakButton, YawmakCard } from "@/components/ui/DesignSystem";

export const metadata: Metadata = {
  title: "المزايا",
  description: "مزايا يومك: المهام والتركيز والملاحظات والأدوات اليومية.",
};

const FEATURES = [
  { href: "/tasks", icon: ListChecks, title: "مهامي", desc: "مهام بمواعيد وأولويات وتصنيفات مع نسبة إنجاز يومية." },
  { href: "/focus", icon: Timer, title: "التركيز", desc: "مؤقت تركيز واستراحة مع سجل جلسات وإحصائيات." },
  { href: "/notes", icon: StickyNote, title: "ملاحظاتي", desc: "محرر ملاحظات بحفظ تلقائي وبحث وتثبيت." },
  { href: "/invitations", icon: Send, title: "بطاقاتي", desc: "بطاقات ودعوات قابلة للمشاركة مع معاينة ورابط ورمز QR." },
  { href: "/quran", icon: BookOpen, title: "القرآن الكريم", desc: "قراءة وتلاوة وخطط قراءة." },
  { href: "/adhkar", icon: Sparkles, title: "الأذكار", desc: "أذكار موثقة بمصادرها مع عدادات." },
  { href: "/tasbih", icon: CircleDot, title: "المسبحة", desc: "عداد تسبيح شخصي وعدادات مشتركة." },
  { href: "/dua", icon: HeartHandshake, title: "الأدعية", desc: "أدعية موثقة وصندوق دعاء خاص." },
  { href: "/prayer", icon: Clock, title: "مواقيت الصلاة", desc: "مواقيت المحافظات مع العد التنازلي." },
  { href: "/qibla", icon: Compass, title: "بوصلة القبلة", desc: "اتجاه القبلة بالزاوية أو عبر المستشعر." },
  { href: "/hijri", icon: Calendar, title: "التقويم الهجري", desc: "التاريخ الهجري والمناسبات." },
  { href: "/campaigns", icon: Users, title: "الحملات", desc: "حملات عامة وخاصة مع توزيع المهام." },
  { href: "/community", icon: Users, title: "المجتمعات", desc: "مساحات نقاش بإشراف وبلاغات." },
  { href: "/journal", icon: BookMarked, title: "الدفتر", desc: "يوميات وأهداف وعادات." },
  { href: "/legacy", icon: Archive, title: "الأرشيف", desc: "أرشفة المبادرات والمشاريع." },
  { href: "/studio", icon: Palette, title: "الاستوديو", desc: "تصميم بطاقات وتصدير PNG." },
  { href: "/analytics", icon: BarChart3, title: "الإحصاءات", desc: "متابعة الأداء والنشاط." },
  { href: "/pricing", icon: Crown, title: "العضويات", desc: "خطط مرنة للمزايا الإضافية." },
];

export default function FeaturesPage() {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--yawmak-text)]">
          مزايا يومك
        </h1>
        <p className="text-sm text-[var(--yawmak-text-muted)]">
          كل قسم صُمم ليكون سريعًا وواضحًا ويعمل على جميع الأجهزة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Link key={f.href} href={f.href} className="group">
              <YawmakCard className="yawmak-card-3d h-full space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[var(--yawmak-primary-tint)] flex items-center justify-center text-[var(--yawmak-primary)]">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-[var(--yawmak-text)]">{f.title}</h2>
                <p className="text-xs text-[var(--yawmak-text-muted)] leading-relaxed">{f.desc}</p>
              </YawmakCard>
            </Link>
          );
        })}
      </div>

      <div className="text-center pt-2">
        <Link href="/tasks">
          <YawmakButton size="lg">ابدأ الآن</YawmakButton>
        </Link>
      </div>
    </div>
  );
}
