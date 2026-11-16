"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, CheckCircle2 } from "@/components/ui/icons";
import { YawmakCard, YawmakInput, YawmakTextarea, YawmakButton } from "@/components/ui/DesignSystem";

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر إرسال الطلب");
      } else {
        setResult(data.message);
      }
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <YawmakCard glow className="space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[var(--yawmak-gold)]/15 border border-[var(--yawmak-border)] flex items-center justify-center text-[var(--yawmak-gold)]">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-bold yawmak-gold-text">استعادة الوصول للحساب</h1>
          <p className="text-xs text-[var(--yawmak-text-muted)] leading-relaxed">
            لا نعتمد على تلميح كلمة المرور لتغيير كلمة المرور. يمكنك إرسال طلب تحقق إلى فريق الدعم.
          </p>
        </div>

        {result ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-center">
            <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto" />
            <p className="text-xs text-emerald-200 leading-relaxed">{result}</p>
            <Link href="/login" className="inline-block text-xs font-bold text-[var(--yawmak-gold-soft)] underline pt-2">
              العودة لتسجيل الدخول
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <YawmakInput
              label="رقم الهاتف المسجل"
              required
              type="tel"
              dir="ltr"
              placeholder="01012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <YawmakTextarea
              label="ملاحظة إضافية للتحقق (اختياري)"
              placeholder="مثال: اسم المستخدم أو المحافظة المسجلة لتسريع المراجعة..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <YawmakButton type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              إرسال طلب التحقق للدعم
            </YawmakButton>
          </form>
        )}

        <div className="text-center text-xs text-[var(--yawmak-text-muted)]">
          <Link href="/support" className="text-[var(--yawmak-gold-soft)] hover:underline">
            التواصل المباشر مع مركز الدعم
          </Link>
        </div>
      </YawmakCard>
    </div>
  );
}
