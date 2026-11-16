"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Archive,
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  Calendar,
  ChevronDown,
  CircleDot,
  Clock,
  Compass,
  Crown,
  HeartHandshake,
  Headphones,
  Home,
  ListChecks,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Palette,
  Settings,
  Sparkles,
  StickyNote,
  Timer,
  User,
  Users,
  X,
  Zap,
} from "@/components/ui/icons";
import {
  YmCalendar,
  YmCards,
  YmFocus,
  YmHome,
  YmNotes,
  YmTasks,
} from "@/components/svg/YawmakGlyphs";
import { useYawmak } from "@/components/providers/YawmakProvider";
import {
  YawmakBadge,
  YawmakButton,
  YawmakDialog,
  YawmakLogo,
} from "@/components/ui/DesignSystem";
import GoldenCrescent from "@/components/three/GoldenCrescent";
import { DEV_NAME, DEV_SIGNATURE, hasRoleAccess, formatWhatsAppIntlUrl } from "@/lib/constants";

const PRIMARY_NAV = [
  { href: "/", label: "الرئيسية", icon: YmHome },
  { href: "/tasks", label: "مهامي", icon: YmTasks },
  { href: "/focus", label: "التركيز", icon: YmFocus },
  { href: "/notes", label: "ملاحظاتي", icon: YmNotes },
  { href: "/invitations", label: "بطاقاتي", icon: YmCards },
];

const TOOL_NAV = [
  { href: "/quran", label: "القرآن الكريم", icon: BookOpen },
  { href: "/adhkar", label: "الأذكار", icon: Sparkles },
  { href: "/tasbih", label: "المسبحة", icon: CircleDot },
  { href: "/dua", label: "الأدعية", icon: HeartHandshake },
  { href: "/prayer", label: "مواقيت الصلاة", icon: Clock },
  { href: "/qibla", label: "بوصلة القبلة", icon: Compass },
  { href: "/hijri", label: "التقويم الهجري", icon: Calendar },
  { href: "/campaigns", label: "الحملات", icon: Users },
  { href: "/community", label: "المجتمعات", icon: Users },
  { href: "/journal", label: "الدفتر", icon: BookMarked },
  { href: "/legacy", label: "الأرشيف", icon: Archive },
  { href: "/studio", label: "الاستوديو", icon: Palette },
  { href: "/analytics", label: "الإحصاءات", icon: BarChart3 },
  { href: "/pricing", label: "العضويات", icon: Crown },
  { href: "/support", label: "الدعم", icon: Headphones },
];

const THEME_OPTIONS = [
  { id: "light", label: "فاتح", icon: Palette },
  { id: "dark", label: "داكن", icon: Moon },
  { id: "system", label: "النظام", icon: Settings },
];

export function YawmakShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, unreadNotifications, theme, setTheme, logout, toasts, dismissToast, supportContacts } =
    useYawmak();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen flex yawmak-geo-pattern relative">
      <GoldenCrescent />
      <aside className="hidden lg:flex w-[248px] shrink-0 flex-col gap-5 border-l border-[var(--yawmak-border)] bg-[var(--yawmak-card)] px-4 py-6 sticky top-0 h-screen overflow-y-auto yawmak-scroll-slim">
        <Link href="/" className="px-2">
          <YawmakLogo size={34} />
        </Link>

        <nav className="space-y-1" aria-label="التنقل الرئيسي">
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 h-11 px-3.5 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[var(--yawmak-primary)] text-white"
                    : "text-[var(--yawmak-text-muted)] hover:bg-[var(--yawmak-primary-tint)] hover:text-[var(--yawmak-primary)]"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div>
          <button
            type="button"
            onClick={() => setToolsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3.5 h-10 rounded-xl text-xs font-bold text-[var(--yawmak-text-muted)] hover:bg-[var(--yawmak-primary-tint)] hover:text-[var(--yawmak-primary)] transition-colors cursor-pointer"
          >
            أدوات
            <ChevronDown className={`w-4 h-4 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
          </button>

          {toolsOpen && (
            <div className="mt-1 space-y-0.5">
              {TOOL_NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 h-10 px-3.5 rounded-xl text-xs font-medium transition-colors ${
                      active
                        ? "bg-[var(--yawmak-primary-tint)] text-[var(--yawmak-primary)]"
                        : "text-[var(--yawmak-text-muted)] hover:bg-[var(--yawmak-primary-tint)] hover:text-[var(--yawmak-primary)]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-auto space-y-3 pt-4 border-t border-[var(--yawmak-border)]">
          <div className="grid grid-cols-3 gap-1.5">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  className={`h-9 rounded-xl text-[11px] font-semibold flex flex-col items-center justify-center gap-0.5 border transition-colors cursor-pointer ${
                    theme === option.id
                      ? "bg-[var(--yawmak-primary)] text-white border-transparent"
                      : "border-[var(--yawmak-border)] text-[var(--yawmak-text-muted)] hover:border-[var(--yawmak-primary)]/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {option.label}
                </button>
              );
            })}
          </div>

          {user ? (
            <div className="space-y-1.5">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[var(--yawmak-primary-tint)] transition-colors"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-9 h-9 rounded-xl object-cover border border-[var(--yawmak-border)]"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--yawmak-text)] truncate">{user.username}</p>
                  <p className="text-[10px] text-[var(--yawmak-text-muted)]">{user.membershipPlan}</p>
                </div>
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2.5 h-10 px-3 rounded-xl text-xs font-medium text-[var(--yawmak-text-muted)] hover:bg-[var(--yawmak-primary-tint)] hover:text-[var(--yawmak-primary)]"
              >
                <Settings className="w-4 h-4" /> الإعدادات
              </Link>
              {hasRoleAccess(user.role, "support") && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2.5 h-10 px-3 rounded-xl text-xs font-semibold text-[var(--yawmak-primary)] bg-[var(--yawmak-primary-tint)]"
                >
                  <Crown className="w-4 h-4" /> لوحة الإدارة
                </Link>
              )}
              <button
                type="button"
                onClick={() => setLogoutOpen(true)}
                className="w-full flex items-center gap-2.5 h-10 px-3 rounded-xl text-xs font-medium text-[#C93F3F] hover:bg-[#E05252]/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> تسجيل الخروج
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Link href="/login" className="block">
                <YawmakButton variant="secondary" className="w-full">
                  <LogIn className="w-4 h-4" /> تسجيل الدخول
                </YawmakButton>
              </Link>
              <Link href="/register" className="block">
                <YawmakButton className="w-full">حساب جديد</YawmakButton>
              </Link>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-40 h-16 px-4 flex items-center justify-between gap-3 border-b border-[var(--yawmak-border)] bg-[var(--yawmak-bg)]/92 backdrop-blur-xl">
          <Link href="/">
            <YawmakLogo size={30} />
          </Link>
          <div className="flex items-center gap-1.5">
            {user && (
              <Link
                href="/settings/notifications"
                aria-label="الإشعارات"
                className="relative w-10 h-10 rounded-xl border border-[var(--yawmak-border)] flex items-center justify-center text-[var(--yawmak-text)]"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--yawmak-primary)] text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="القائمة"
              className="w-10 h-10 rounded-xl border border-[var(--yawmak-border)] flex items-center justify-center text-[var(--yawmak-text)] cursor-pointer"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {mobileOpen && (
          <div className="lg:hidden border-b border-[var(--yawmak-border)] bg-[var(--yawmak-card)] px-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-1.5">
              {TOOL_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 h-11 px-3 rounded-xl text-xs font-medium text-[var(--yawmak-text-muted)] bg-[var(--yawmak-bg)] border border-[var(--yawmak-border)]"
                  >
                    <Icon className="w-4 h-4 text-[var(--yawmak-primary)]" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-1.5 mt-3">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  className={`h-10 rounded-xl text-[11px] font-semibold border cursor-pointer ${
                    theme === option.id
                      ? "bg-[var(--yawmak-primary)] text-white border-transparent"
                      : "border-[var(--yawmak-border)] text-[var(--yawmak-text-muted)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {!user && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Link href="/login">
                  <YawmakButton variant="secondary" className="w-full">
                    تسجيل الدخول
                  </YawmakButton>
                </Link>
                <Link href="/register">
                  <YawmakButton className="w-full">حساب جديد</YawmakButton>
                </Link>
              </div>
            )}

            {user && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Link href="/profile">
                  <YawmakButton variant="secondary" className="w-full">
                    <User className="w-4 h-4" /> حسابي
                  </YawmakButton>
                </Link>
                <YawmakButton variant="outline" className="w-full" onClick={() => setLogoutOpen(true)}>
                  <LogOut className="w-4 h-4" /> خروج
                </YawmakButton>
              </div>
            )}
          </div>
        )}

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-9 pb-28 lg:pb-10">
          {children}
        </main>

        <footer className="border-t border-[var(--yawmak-border)] bg-[var(--yawmak-card)] pb-24 lg:pb-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-9 space-y-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
              <div className="space-y-3">
                <YawmakLogo size={32} />
                <p className="text-xs text-[var(--yawmak-text-muted)] leading-relaxed">
                  يومك… ببساطة وترتيب. مهامك وتركيزك وملاحظاتك في مكان واحد.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[var(--yawmak-text)] mb-3">الأقسام</h3>
                <ul className="space-y-2 text-xs text-[var(--yawmak-text-muted)]">
                  {PRIMARY_NAV.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="hover:text-[var(--yawmak-primary)] transition-colors">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[var(--yawmak-text)] mb-3">روابط</h3>
                <ul className="space-y-2 text-xs text-[var(--yawmak-text-muted)]">
                  <li>
                    <Link href="/about" className="hover:text-[var(--yawmak-primary)] transition-colors">
                      عن يومك
                    </Link>
                  </li>
                  <li>
                    <Link href="/support" className="hover:text-[var(--yawmak-primary)] transition-colors">
                      الدعم
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-[var(--yawmak-primary)] transition-colors">
                      الشروط
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-[var(--yawmak-primary)] transition-colors">
                      الخصوصية
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[var(--yawmak-text)] mb-3">تواصل</h3>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={formatWhatsAppIntlUrl(supportContacts.whatsappPrimary)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-[var(--yawmak-primary-tint)] text-[var(--yawmak-primary)] text-[11px] font-semibold hover:opacity-85 transition-opacity"
                  >
                    واتساب
                  </a>
                  <a
                    href={`mailto:${supportContacts.email}`}
                    className="px-3 py-2 rounded-xl bg-[var(--yawmak-primary-tint)] text-[var(--yawmak-primary)] text-[11px] font-semibold hover:opacity-85 transition-opacity"
                  >
                    البريد
                  </a>
                  <a
                    href={supportContacts.whatsappCommunity}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-[var(--yawmak-primary-tint)] text-[var(--yawmak-primary)] text-[11px] font-semibold hover:opacity-85 transition-opacity"
                  >
                    مجتمع واتساب
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--yawmak-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-[var(--yawmak-text-muted)]">
                © {new Date().getFullYear()} YAWMAK | يومك
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <code
                  dir="ltr"
                  className="text-[11px] sm:text-xs font-mono px-3 py-1.5 rounded-xl bg-[var(--yawmak-primary-tint)] text-[var(--yawmak-text)] transition-colors hover:bg-[var(--yawmak-primary)] hover:text-white cursor-default"
                >
                  {DEV_SIGNATURE}
                </code>
                <span
                  dir="ltr"
                  className="text-xs sm:text-sm font-bold text-[var(--yawmak-primary)] transition-colors hover:text-[var(--yawmak-text)] cursor-default"
                >
                  {DEV_NAME}
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 pointer-events-none pb-safe">
        <div
          aria-hidden="true"
          className="absolute inset-x-4 bottom-4 h-16 rounded-full yawmak-nav-glow"
        />
        <nav
          aria-label="التنقل السفلي"
          className="pointer-events-auto relative mx-4 mb-4 h-[68px] rounded-full yawmak-floating-nav"
        >
          <div className="relative grid grid-cols-5 h-full">
            <span
              aria-hidden="true"
              className="absolute top-1/2 -translate-y-1/2 h-12 w-[68px] rounded-full bg-[var(--yawmak-primary)] transition-transform duration-300 ease-out"
              style={{
                transform: `translateY(-50%) translateX(var(--nav-indicator, 0px))`,
              }}
              ref={(node) => {
                if (!node) return;
                const index = Math.max(
                  0,
                  PRIMARY_NAV.findIndex((item) => isActive(item.href))
                );
                const slot = node.parentElement?.clientWidth
                  ? node.parentElement.clientWidth / 5
                  : 0;
                node.style.setProperty("--nav-indicator", `${(index - 2) * -slot}px`);
              }}
            />
            {PRIMARY_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-all duration-200 ${
                    active
                      ? "text-white scale-[1.06]"
                      : "text-[var(--yawmak-text-muted)] hover:text-[var(--yawmak-primary)]"
                  }`}
                >
                  <Icon size={19} strokeWidth={active ? 2.1 : 1.7} />
                  <span className="leading-none">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <div className="fixed top-4 left-4 right-4 sm:right-auto sm:w-96 z-[95] space-y-2 pointer-events-none">
        {toasts.map((toastItem) => (
          <div
            key={toastItem.id}
            className="pointer-events-auto rounded-2xl bg-[var(--yawmak-card)] border border-[var(--yawmak-border)] shadow-xl p-3.5 flex items-start gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[var(--yawmak-text)]">{toastItem.title}</p>
              {toastItem.message && (
                <p className="text-[11px] text-[var(--yawmak-text-muted)] mt-0.5">{toastItem.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toastItem.id)}
              className="text-[var(--yawmak-text-muted)] hover:text-[var(--yawmak-primary)] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <YawmakDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="تسجيل الخروج"
        tone="warning"
        footer={
          <>
            <YawmakButton variant="ghost" size="sm" onClick={() => setLogoutOpen(false)}>
              إلغاء
            </YawmakButton>
            <YawmakButton
              variant="danger"
              size="sm"
              onClick={async () => {
                setLogoutOpen(false);
                await logout();
                router.push("/login");
              }}
            >
              تأكيد
            </YawmakButton>
          </>
        }
      />
    </div>
  );
}
