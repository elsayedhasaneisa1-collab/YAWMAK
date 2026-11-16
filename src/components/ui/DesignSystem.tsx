"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Search,
  Check,
  ChevronDown,
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  Loader2,
  BadgeCheck,
  MapPin,
} from "@/components/ui/icons";
import { EGYPT_GOVERNORATES } from "@/lib/constants";

export function YawmakLogo({ size = 34, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="ywMark" x1="10" y1="8" x2="54" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D4AF62" />
            <stop offset="55%" stopColor="#B89545" />
            <stop offset="100%" stopColor="#8D6B2D" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#ywMark)" />
        <path
          d="M16 40c4.4-9.6 9.9-14.4 16-14.4S43.6 30.4 48 40"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.95"
        />
        <circle cx="32" cy="24.5" r="5.2" fill="#FFFFFF" opacity="0.95" />
        <path d="M15 46h34" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      </svg>
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-extrabold tracking-[0.14em] text-[var(--yawmak-text)]">
              YAWMAK
            </span>
            <span className="font-display text-lg font-bold text-[var(--yawmak-primary)]">يومك</span>
          </div>
        </div>
      )}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface YawmakButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--yawmak-primary)] text-white border border-[var(--yawmak-primary)] hover:bg-white hover:text-[var(--yawmak-primary)] hover:border-[var(--yawmak-primary)] active:bg-white active:text-[var(--yawmak-primary)]",
  secondary:
    "bg-[var(--yawmak-primary-tint)] text-[var(--yawmak-primary)] border border-[var(--yawmak-border)] hover:bg-[var(--yawmak-bg)] hover:border-[var(--yawmak-primary)]",
  outline:
    "bg-transparent text-[var(--yawmak-primary)] border border-[var(--yawmak-primary)]/45 hover:bg-[var(--yawmak-primary-tint)] hover:border-[var(--yawmak-primary)]",
  ghost:
    "bg-transparent text-[var(--yawmak-text-muted)] border border-transparent hover:bg-[var(--yawmak-primary-tint)] hover:text-[var(--yawmak-primary)]",
  danger:
    "bg-[#E05252] text-white border border-transparent hover:bg-transparent hover:text-[#E05252] hover:border-[#E05252]",
  success:
    "bg-[var(--yawmak-primary)] text-white border border-[var(--yawmak-primary)] hover:bg-white hover:text-[var(--yawmak-primary)] hover:border-[var(--yawmak-primary)] active:bg-white active:text-[var(--yawmak-primary)]",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-xs rounded-xl gap-1.5",
  md: "h-11 px-5 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-2xl gap-2.5",
  icon: "h-10 w-10 p-0 rounded-xl justify-center",
};

export function YawmakButton({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: YawmakButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--yawmak-primary)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.985] ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {children}
    </button>
  );
}

export function YawmakCard({
  className = "",
  children,
  glow = false,
}: {
  className?: string;
  children: React.ReactNode;
  glow?: boolean;
}) {
  return (
    <div
      className={`yawmak-card rounded-2xl p-5 sm:p-6 transition-shadow duration-200 ${
        glow ? "shadow-[var(--yawmak-shadow-hover)]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function YawmakBadge({
  children,
  tone = "gold",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "gold" | "emerald" | "neutral" | "danger" | "info";
  className?: string;
}) {
  const tones = {
    gold: "bg-[var(--yawmak-primary)]/12 text-[var(--yawmak-primary)] border-[var(--yawmak-primary)]/25",
    emerald: "bg-[#2FA36B]/12 text-[#218154] border-[#2FA36B]/25",
    neutral: "bg-[var(--yawmak-text)]/6 text-[var(--yawmak-text-muted)] border-[var(--yawmak-border)]",
    danger: "bg-[#E05252]/12 text-[#C93F3F] border-[#E05252]/25",
    info: "bg-[#B89545]/12 text-[#8D6B2D] border-[#B89545]/25",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function VerificationSeal({ badge }: { badge: string | null | undefined }) {
  if (!badge) return null;
  return (
    <span
      title="توثيق معتمد بعد مراجعة بشرية"
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border bg-[var(--yawmak-primary)]/12 text-[var(--yawmak-primary)] border-[var(--yawmak-primary)]/30"
    >
      <BadgeCheck className="w-3.5 h-3.5" />
      {badge}
    </span>
  );
}

export function YawmakInput({
  label,
  error,
  hint,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--yawmak-text)]">
          {label}
          {props.required && <span className="text-[var(--yawmak-primary)] mr-1">*</span>}
        </label>
      )}
      <input
        className={`w-full h-11 px-3.5 rounded-xl bg-[var(--yawmak-bg-elevated)] border ${
          error ? "border-[#E05252]" : "border-[var(--yawmak-border)] focus:border-[var(--yawmak-primary)]"
        } text-[var(--yawmak-text)] placeholder:text-[var(--yawmak-text-muted)]/70 text-sm outline-none transition-colors ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-[var(--yawmak-text-muted)]">{hint}</p>}
      {error && <p className="text-xs text-[#C93F3F]">{error}</p>}
    </div>
  );
}

export function YawmakPasswordInput({
  label,
  error,
  value,
  showStrength = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  value: string;
  showStrength?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const score =
    (value.length >= 8 ? 1 : 0) +
    (/[A-Za-z\u0600-\u06FF]/.test(value) ? 1 : 0) +
    (/[0-9]/.test(value) ? 1 : 0) +
    (/[^A-Za-z0-9\u0600-\u06FF]/.test(value) || value.length >= 12 ? 1 : 0);
  const strengthLabels = ["ضعيفة جدًا", "ضعيفة", "متوسطة", "قوية", "فائقة القوة"];
  const strengthColors = ["#E05252", "#C79A45", "#D9B23C", "#2FA36B", "#B89545"];

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--yawmak-text)]">
          {label}
          {props.required && <span className="text-[var(--yawmak-primary)] mr-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          className={`w-full h-11 pr-3.5 pl-11 rounded-xl bg-[var(--yawmak-bg-elevated)] border ${
            error ? "border-[#E05252]" : "border-[var(--yawmak-border)] focus:border-[var(--yawmak-primary)]"
          } text-[var(--yawmak-text)] placeholder:text-[var(--yawmak-text-muted)]/70 text-sm outline-none transition-colors`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[var(--yawmak-text-muted)] hover:text-[var(--yawmak-primary)] transition-colors cursor-pointer"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {showStrength && value.length > 0 && (
        <div className="space-y-1 pt-1">
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="h-1.5 rounded-full transition-colors"
                style={{ background: score >= idx ? strengthColors[score] : "var(--yawmak-border)" }}
              />
            ))}
          </div>
          <p className="text-[11px] text-[var(--yawmak-text-muted)]">
            قوة كلمة المرور:{" "}
            <span className="text-[var(--yawmak-text)] font-medium">{strengthLabels[score]}</span>
          </p>
        </div>
      )}
      {error && <p className="text-xs text-[#C93F3F]">{error}</p>}
    </div>
  );
}

export function YawmakTextarea({
  label,
  error,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--yawmak-text)]">
          {label}
          {props.required && <span className="text-[var(--yawmak-primary)] mr-1">*</span>}
        </label>
      )}
      <textarea
        className={`w-full min-h-[100px] p-3.5 rounded-xl bg-[var(--yawmak-bg-elevated)] border ${
          error ? "border-[#E05252]" : "border-[var(--yawmak-border)] focus:border-[var(--yawmak-primary)]"
        } text-[var(--yawmak-text)] placeholder:text-[var(--yawmak-text-muted)]/70 text-sm outline-none transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[#C93F3F]">{error}</p>}
    </div>
  );
}

export function GovernorateSearchSelect({
  value,
  onChange,
  label = "المحافظة",
  error,
  required = true,
  placeholder = "اختر محافظتك...",
}: {
  value: string;
  onChange: (gov: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const filtered = EGYPT_GOVERNORATES.filter(
    (g) => g.nameAr.includes(query.trim()) || g.nameEn.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative space-y-1.5 w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--yawmak-text)]">
          {label}
          {required && <span className="text-[var(--yawmak-primary)] mr-1">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`w-full h-11 px-3.5 rounded-xl bg-[var(--yawmak-bg-elevated)] border ${
          error ? "border-[#E05252]" : open ? "border-[var(--yawmak-primary)]" : "border-[var(--yawmak-border)]"
        } flex items-center justify-between text-sm transition-colors cursor-pointer`}
      >
        <span
          className={`flex items-center gap-2 ${
            value ? "text-[var(--yawmak-text)]" : "text-[var(--yawmak-text-muted)]"
          }`}
        >
          <MapPin className="w-4 h-4 text-[var(--yawmak-primary)] shrink-0" />
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[var(--yawmak-text-muted)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-2xl bg-[var(--yawmak-surface-solid)] border border-[var(--yawmak-border)] shadow-xl overflow-hidden">
          <div className="p-2.5 border-b border-[var(--yawmak-border)]">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--yawmak-text-muted)] absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن المحافظة..."
                autoFocus
                className="w-full h-9 pr-9 pl-3 rounded-lg bg-[var(--yawmak-bg)] border border-[var(--yawmak-border)] text-xs text-[var(--yawmak-text)] outline-none focus:border-[var(--yawmak-primary)]"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-[var(--yawmak-text-muted)] py-4">لا توجد نتائج</p>
            ) : (
              filtered.map((g) => {
                const selected = value === g.nameAr;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      onChange(g.nameAr);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-right transition-colors cursor-pointer ${
                      selected
                        ? "bg-[var(--yawmak-primary-tint)] text-[var(--yawmak-primary)] font-semibold"
                        : "text-[var(--yawmak-text)] hover:bg-[var(--yawmak-primary-tint)]"
                    }`}
                  >
                    <span>{g.nameAr}</span>
                    {selected && <Check className="w-4 h-4 text-[var(--yawmak-primary)]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-[#C93F3F]">{error}</p>}
    </div>
  );
}

export function YawmakDialog({
  open,
  onClose,
  title,
  description,
  tone = "info",
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  tone?: "info" | "success" | "warning" | "danger";
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const icons = {
    info: <Info className="w-5 h-5 text-[var(--yawmak-primary)]" />,
    success: <CheckCircle2 className="w-5 h-5 text-[#2FA36B]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#C79A45]" />,
    danger: <XCircle className="w-5 h-5 text-[#E05252]" />,
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-[#292638]/35 backdrop-blur-[3px] p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-[var(--yawmak-surface-solid)] border border-[var(--yawmak-border)] shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--yawmak-primary-tint)] flex items-center justify-center shrink-0">
              {icons[tone]}
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--yawmak-text)]">{title}</h3>
              {description && (
                <p className="text-xs text-[var(--yawmak-text-muted)] mt-0.5">{description}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="p-1.5 rounded-lg text-[var(--yawmak-text-muted)] hover:bg-[var(--yawmak-primary-tint)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {children && <div className="space-y-4">{children}</div>}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-[var(--yawmak-border)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function YawmakProgressBar({
  value,
  max = 100,
  className = "",
}: {
  value: number;
  max?: number;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;
  return (
    <div className={`w-full h-2 rounded-full bg-[var(--yawmak-border)] overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full yawmak-primary-gradient transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function YawmakEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12 px-6 rounded-2xl border border-dashed border-[var(--yawmak-border)] bg-[var(--yawmak-bg-elevated)]">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[var(--yawmak-primary-tint)] flex items-center justify-center text-[var(--yawmak-primary)]">
        {icon}
      </div>
      <h3 className="text-base font-bold text-[var(--yawmak-text)]">{title}</h3>
      <p className="text-sm text-[var(--yawmak-text-muted)] max-w-md mx-auto mt-1.5">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function YawmakSkeleton({ className = "h-24 w-full" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{ background: "var(--yawmak-border)", opacity: 0.65 }}
    />
  );
}
