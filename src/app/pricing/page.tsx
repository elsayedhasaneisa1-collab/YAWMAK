"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Crown, ShieldCheck, Sparkles } from "@/components/ui/icons";
import {
  YawmakCard,
  YawmakButton,
  YawmakBadge,
  YawmakDialog,
  YawmakInput,
  YawmakSkeleton,
} from "@/components/ui/DesignSystem";
import { useYawmak } from "@/components/providers/YawmakProvider";

interface PlanItem {
  code: "FREE" | "PLUS" | "PRO" | "VIP";
  nameAr: string;
  priceEgp: number;
  invitationLimit: number;
  invitationLimitScope: string;
  habitLimit: number;
  ogImageLimit: number;
  canVerify: boolean;
  badgeLabel: string | null;
  features: string[];
}

interface PaymentMethod {
  id: string;
  nameAr: string;
  instructions: string;
  active: boolean;
}

export default function PricingPage() {
  const { user, toast } = useYawmak();
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("vodafone_cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/memberships")
      .then((r) => r.json())
      .then((d) => {
        setPlans(d.plans || []);
        setMethods(d.paymentMethods || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const submitSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "subscribe",
          planCode: selectedPlan.code,
          paymentMethod,
          paymentReference,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ type: "error", title: data.error || "تعذر إرسال الطلب" });
      } else {
        toast({ type: "success", title: "تم إرسال طلب الاشتراك", message: data.message });
        setSelectedPlan(null);
        setPaymentReference("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <YawmakBadge tone="gold">
          <Crown className="w-3.5 h-3.5" /> نظام العضويات الشفاف
        </YawmakBadge>
        <h1 className="font-display text-3xl sm:text-5xl font-bold yawmak-gold-text">
          خطط وباقات YAWMAK | يومك
        </h1>
        <p className="text-sm text-[var(--yawmak-text-muted)] leading-relaxed">
          القرآن والأذكار والأدعية والمسبحة والصلاة والقبلة والتقويم الهجري مجانية دائمًا للجميع. اختر الباقة التي تناسب احتياجاتك في الدعوات والحملات والتصميم.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <YawmakSkeleton key={i} className="h-96" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((p) => {
            const isCurrent = user?.membershipPlan === p.code;
            const highlight = p.code === "PRO" || p.code === "VIP";
            return (
              <YawmakCard
                key={p.code}
                glow={highlight}
                className={`flex flex-col justify-between space-y-6 ${
                  p.code === "VIP" ? "bg-gradient-to-b from-[#FAF3E3]/90 to-[var(--yawmak-surface)]" : ""
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-widest text-[var(--yawmak-gold)]">
                      {p.code}
                    </span>
                    {isCurrent && <YawmakBadge tone="emerald">باقتك الحالية</YawmakBadge>}
                    {p.code === "VIP" && !isCurrent && (
                      <YawmakBadge tone="gold">
                        <Sparkles className="w-3 h-3" /> ملكية
                      </YawmakBadge>
                    )}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">{p.nameAr}</h2>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold yawmak-gold-text">{p.priceEgp}</span>
                      <span className="text-xs text-[var(--yawmak-text-muted)]">
                        {p.priceEgp === 0 ? "ج.م / مجانًا" : "ج.م / شهريًا"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-[var(--yawmak-border-subtle)] text-xs space-y-1">
                    <p>
                      الدعوات:{" "}
                      <strong>
                        {p.invitationLimit === -1
                          ? "غير محدودة (استخدام عادل)"
                          : `${p.invitationLimit} ${p.invitationLimitScope === "lifetime" ? "طوال عمر الحساب" : "شهريًا"}`}
                      </strong>
                    </p>
                    <p>
                      العادات: <strong>{p.habitLimit === -1 ? "غير محدودة" : `${p.habitLimit} عادات`}</strong>
                    </p>
                    <p>
                      روابط صور OG:{" "}
                      <strong>{p.ogImageLimit === 0 ? "الصورة الافتراضية" : `${p.ogImageLimit} رابط للحساب`}</strong>
                    </p>
                  </div>

                  <ul className="space-y-2 text-xs text-[var(--yawmak-text-muted)]">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {p.code === "FREE" ? (
                    <Link href={user ? "/profile" : "/register"}>
                      <YawmakButton variant="outline" className="w-full">
                        {user ? "متاح لحسابك" : "ابدأ مجانًا"}
                      </YawmakButton>
                    </Link>
                  ) : user ? (
                    <YawmakButton
                      variant={p.code === "VIP" ? "primary" : "secondary"}
                      className="w-full"
                      disabled={isCurrent}
                      onClick={() => setSelectedPlan(p)}
                    >
                      {isCurrent ? "مشترك حاليًا" : `طلب الاشتراك في ${p.code}`}
                    </YawmakButton>
                  ) : (
                    <Link href="/register">
                      <YawmakButton variant="primary" className="w-full">
                        سجّل للاشتراك في {p.code}
                      </YawmakButton>
                    </Link>
                  )}
                </div>
              </YawmakCard>
            );
          })}
        </div>
      )}

      <YawmakCard className="space-y-2 border-emerald-500/30">
        <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-300">
          <ShieldCheck className="w-4 h-4" />
          قواعد العضويات والتوثيق
        </h3>
        <ul className="text-xs text-[var(--yawmak-text-muted)] space-y-1 list-disc pr-5">
          <li>دفع الاشتراك لا يمنح شارة التوثيق تلقائيًا؛ كل شارة (PLUS / PRO / VIP VERIFIED) تتطلب طلبًا ومراجعة بشرية من الإدارة.</li>
          <li>لا نقوم بتخزين بيانات بطاقات الدفع، ولا نفعّل أي باقة مدفوعة إلا بعد التحقق الفعلي من عملية الدفع.</li>
          <li>عند انتهاء الاشتراك أو تخفيضه، لا نحذف بياناتك؛ بل نطبق حدود الخطة الجديدة ونخفي صور OG الزائدة مؤقتًا.</li>
        </ul>
      </YawmakCard>

      {/* Subscription Request Dialog */}
      <YawmakDialog
        open={Boolean(selectedPlan)}
        onClose={() => setSelectedPlan(null)}
        title={`طلب الاشتراك في باقة ${selectedPlan?.code || ""}`}
        description={`القيمة الشهرية: ${selectedPlan?.priceEgp || 0} ج.م — يتم التفعيل بعد التحقق اليدوي من الإدارة.`}
      >
        <form onSubmit={submitSubscription} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">طريقة الدفع</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-[var(--yawmak-bg-elevated)] border border-[var(--yawmak-border-subtle)] text-sm"
            >
              {methods
                .filter((m) => m.active)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nameAr}
                  </option>
                ))}
            </select>
            {methods.find((m) => m.id === paymentMethod) && (
              <p className="text-xs text-[var(--yawmak-gold-soft)] bg-[var(--yawmak-gold)]/10 p-2.5 rounded-xl mt-2">
                {methods.find((m) => m.id === paymentMethod)?.instructions}
              </p>
            )}
          </div>

          <YawmakInput
            label="رقم العملية / مرجع التحويل"
            required
            placeholder="أدخل رقم العملية أو رقم المحفظة المحوّل منها"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <YawmakButton type="button" variant="ghost" onClick={() => setSelectedPlan(null)}>
              إلغاء
            </YawmakButton>
            <YawmakButton type="submit" variant="primary" loading={submitting}>
              إرسال للمراجعة الإدارية
            </YawmakButton>
          </div>
        </form>
      </YawmakDialog>
    </div>
  );
}
