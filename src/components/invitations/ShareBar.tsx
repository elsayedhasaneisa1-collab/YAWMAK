"use client";

import React, { useEffect, useState } from "react";
import { MessageCircle, Copy, Share2, QrCode, Check } from "@/components/ui/icons";
import { YawmakButton } from "@/components/ui/DesignSystem";
import { useYawmak } from "@/components/providers/YawmakProvider";
import { formatWhatsAppIntlUrl } from "@/lib/constants";

export interface ShareBarProps {
  title: string;
  text: string;
  path: string;
  compact?: boolean;
  tone?: "gold" | "silver";
}

export default function ShareBar({ title, text, path, compact = false, tone = "gold" }: ShareBarProps) {
  const { toast, supportContacts } = useYawmak();
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [absoluteUrl, setAbsoluteUrl] = useState("");

  useEffect(() => {
    const sync = window.setTimeout(() => {
      const base = typeof window !== "undefined" ? window.location.origin : "";
      setAbsoluteUrl(`${base}${path}`);
    }, 0);
    return () => window.clearTimeout(sync);
  }, [path]);

  useEffect(() => {
    let cancelled = false;
    if (!qrOpen || qrDataUrl || !absoluteUrl) return;
    import("qrcode")
      .then((QRCode) => QRCode.toDataURL(absoluteUrl, { width: 420, margin: 1, color: { dark: "#FAF3E3", light: "#292638" } }))
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [qrOpen, qrDataUrl, absoluteUrl]);

  const message = `${title}\n${text}\n${absoluteUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      toast({ type: "success", title: "تم نسخ رابط الدعوة بنجاح" });
    } catch {
      toast({ type: "warning", title: "تعذر النسخ التلقائي", message: "انسخ الرابط يدويًا من شريط العنوان." });
    }
  };

  const handleShare = async () => {
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (typeof nav.share === "function") {
      try {
        await nav.share({ title, text, url: absoluteUrl });
        return;
      } catch {
        return;
      }
    }
    await handleCopy();
  };

  const accent = tone === "gold" ? "var(--yawmak-gold)" : "#D4AF62";

  return (
    <div className="space-y-3">
      <div className={`flex flex-wrap items-center gap-2 ${compact ? "" : "sm:gap-3"}`}>
        <a
          href={formatWhatsAppIntlUrl(supportContacts.whatsappPrimary, message)}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center gap-2 rounded-2xl font-bold text-xs transition-all active:scale-[0.97] hover:brightness-110 ${
            compact ? "h-10 px-4" : "h-12 px-5"
          }`}
          style={{
            background: "linear-gradient(135deg,#B89545,#8D6B2D)",
            color: "#FFFFFF",
            boxShadow: "0 12px 30px -14px rgba(18,140,126,0.75)",
          }}
        >
          <MessageCircle className="w-4 h-4" />
          مشاركة عبر واتساب
        </a>

        <YawmakButton variant="outline" size={compact ? "sm" : "md"} onClick={handleShare} style={{ borderColor: accent }}>
          <Share2 className="w-4 h-4" />
          مشاركة
        </YawmakButton>

        <YawmakButton variant="secondary" size={compact ? "sm" : "md"} onClick={handleCopy}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "تم نسخ الرابط" : "نسخ الرابط"}
        </YawmakButton>

        <YawmakButton variant="ghost" size={compact ? "sm" : "md"} onClick={() => setQrOpen((v) => !v)}>
          <QrCode className="w-4 h-4" />
          رمز QR
        </YawmakButton>
      </div>

      {qrOpen && (
        <div className="yawmak-glass rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 yawmak-fade-up">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`رمز QR لرابط الدعوة ${title}`}
              width={168}
              height={168}
              className="rounded-2xl border border-[var(--yawmak-border)] bg-[#292638] p-2"
            />
          ) : (
            <div className="w-[168px] h-[168px] rounded-2xl animate-pulse bg-white/10" />
          )}
          <div className="text-center sm:text-right space-y-1.5">
            <p className="text-sm font-bold">امسح الرمز للمشاركة المباشرة</p>
            <p className="text-xs text-[var(--yawmak-text-muted)] leading-relaxed">
              يعمل الرمز دون اتصال بخدمات خارجية، ويقود الزائر مباشرة إلى صفحة الدعوة.
            </p>
            <p className="text-[11px] font-mono text-[var(--yawmak-gold-soft)] break-all max-w-xs">{absoluteUrl}</p>
          </div>
        </div>
      )}
    </div>
  );
}
