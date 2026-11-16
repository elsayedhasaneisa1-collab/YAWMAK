import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "@/components/ui/icons";
import { getCurrentUser } from "@/lib/auth";
import { hasRoleAccess } from "@/lib/constants";
import { YawmakCard, YawmakButton } from "@/components/ui/DesignSystem";

export const metadata: Metadata = {
  title: "YAWMAK Control Center",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || !hasRoleAccess(user.role, "support")) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] text-[#292638] flex items-center justify-center px-4">
        <YawmakCard className="max-w-md w-full text-center space-y-4 py-10 border-red-500/35">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
          <h1 className="font-display text-2xl font-bold">دخول غير مصرح به (403)</h1>
          <p className="text-xs text-[#898494] leading-relaxed">
            لوحة YAWMAK CONTROL CENTER محمية بصلاحيات الخادم ومخصصة حصريًا للمالك وفريق الإدارة المعتمد.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/login">
              <YawmakButton variant="primary" size="sm">تسجيل الدخول</YawmakButton>
            </Link>
            <Link href="/">
              <YawmakButton variant="outline" size="sm">الرئيسية</YawmakButton>
            </Link>
          </div>
        </YawmakCard>
      </div>
    );
  }

  return <>{children}</>;
}
