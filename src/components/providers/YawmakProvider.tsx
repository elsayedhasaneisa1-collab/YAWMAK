"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_SUPPORT_CONTACTS, type AdminRole, type MembershipCode } from "@/lib/constants";

export interface ClientUser {
  id: string;
  username: string;
  phone: string;
  email: string | null;
  governorate: string;
  role: AdminRole;
  accountStatus: string;
  membershipPlan: MembershipCode;
  membershipStartsAt: string | null;
  membershipExpiresAt: string | null;
  verificationStatus: string;
  verificationBadge: string | null;
  onboardingCompleted: boolean;
  bio: string | null;
  publicProfile: boolean;
  publicLinks: Array<{ label: string; url: string }>;
  avatarUrl: string;
  canUploadAvatar: boolean;
  createdAt: string;
}

export interface ClientPlan {
  code: MembershipCode;
  nameAr: string;
  priceEgp: number;
  invitationLimit: number;
  invitationLimitScope: string;
  habitLimit: number;
  ogImageLimit: number;
  canVerify: boolean;
  canUploadAvatar: boolean;
  canUseStudio: boolean;
  canCreatePrivateCampaign: boolean;
}

export interface ClientSettings {
  prayerCity: string;
  prayerMethod: number;
  hijriAdjustment: number;
  quranFontSize: number;
  lastQuranSurah: number;
  lastQuranAyah: number;
  khatmaPlanDays: number;
  khatmaCurrentJuz: number;
  notificationsSystem: boolean;
  notificationsMembership: boolean;
  notificationsCampaigns: boolean;
}

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
}

interface YawmakContextValue {
  user: ClientUser | null;
  plan: ClientPlan | null;
  settings: ClientSettings | null;
  unreadNotifications: number;
  loadingAuth: boolean;
  theme: string;
  setTheme: (themeId: string) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  toast: (item: Omit<ToastItem, "id">) => void;
  toasts: ToastItem[];
  dismissToast: (id: string) => void;
  supportContacts: typeof DEFAULT_SUPPORT_CONTACTS;
}

const YawmakContext = createContext<YawmakContextValue | null>(null);

function resolveAppliedMode(themeId: string): "light" | "dark" {
  if (themeId === "system") {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }
  return themeId === "dark" ? "dark" : "light";
}

export function YawmakProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [plan, setPlan] = useState<ClientPlan | null>(null);
  const [settings, setSettings] = useState<ClientSettings | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [theme, setThemeState] = useState("light");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [supportContacts, setSupportContacts] = useState(DEFAULT_SUPPORT_CONTACTS);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { ...item, id }]);
      window.setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast]
  );

  const setTheme = useCallback((themeId: string) => {
    const valid = ["light", "dark", "system"].includes(themeId) ? themeId : "light";
    setThemeState(valid);
    try {
      localStorage.setItem("yawmak_theme", valid);
    } catch {
      return;
    }
    document.documentElement.setAttribute("data-mode", resolveAppliedMode(valid));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setUser(data.user || null);
      setPlan(data.plan || null);
      setSettings(data.settings || null);
      setUnreadNotifications(Number(data.unreadNotifications || 0));
    } catch {
      return;
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setPlan(null);
      setSettings(null);
      setUnreadNotifications(0);
      toast({ type: "success", title: "تم تسجيل الخروج" });
    }
  }, [toast]);

  useEffect(() => {
    const boot = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem("yawmak_theme") || "light";
        setThemeState(saved);
        document.documentElement.setAttribute("data-mode", resolveAppliedMode(saved));
      } catch {
        return;
      }
    }, 0);

    const auth = window.setTimeout(() => {
      refreshUser();
    }, 0);

    fetch("/api/support")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.contacts) setSupportContacts({ ...DEFAULT_SUPPORT_CONTACTS, ...d.contacts });
      })
      .catch(() => undefined);

    return () => {
      window.clearTimeout(boot);
      window.clearTimeout(auth);
    };
  }, [refreshUser]);

  return (
    <YawmakContext.Provider
      value={{
        user,
        plan,
        settings,
        unreadNotifications,
        loadingAuth,
        theme,
        setTheme,
        refreshUser,
        logout,
        toast,
        toasts,
        dismissToast,
        supportContacts,
      }}
    >
      {children}
    </YawmakContext.Provider>
  );
}

export function useYawmak() {
  const ctx = useContext(YawmakContext);
  if (!ctx) throw new Error("useYawmak must be used within YawmakProvider");
  return ctx;
}
