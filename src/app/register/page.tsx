"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Sparkles, UserPlus } from "@/components/ui/icons";
import {
  YawmakCard,
  YawmakInput,
  YawmakPasswordInput,
  YawmakButton,
  GovernorateSearchSelect,
  YawmakLogo,
} from "@/components/ui/DesignSystem";
import { useYawmak } from "@/components/providers/YawmakProvider";
import { registerSchema } from "@/lib/validation";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser, toast } = useYawmak();
  const startedAtRef = useRef<number>(0);
  const submittingRef = useRef(false);

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordHint, setPasswordHint] = useState("");
  const [gender, setGender] = useState<"" | "male" | "female">("");
  const [governorate, setGovernorate] = useState(""); // NO default value!
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [websiteTrap, setWebsiteTrap] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setFormError("");
    setErrors({});

    const parsed = registerSchema.safeParse({
      username,
      phone,
      email,
      password,
      passwordHint,
      gender: gender || undefined,
      governorate,
      termsAccepted,
      websiteTrap,
      formStartedAt: startedAtRef.current,
    });

    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || "form");
        if (!map[key]) map[key] = issue.message;
      }
      setErrors(map);
      setFormError(parsed.error.issues[0]?.message || "يرجى مراجعة الحقول المطلوبة");
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          phone,
          email,
          password,
          passwordHint,
          gender,
          governorate,
          termsAccepted,
          websiteTrap,
          formStartedAt: startedAtRef.current,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "تعذر إتمام التسجيل");
        return;
      }

      await refreshUser();
      toast({
        type: "success",
        title: "أهلًا بك في YAWMAK | يومك",
        message: "تم إنشاء حسابك بنجاح.",
      });
      router.push("/");
    } catch {
      setFormError("تعذر الاتصال بالخادم، يرجى المحاولة لاحقًا");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10 sm:py-14">
      <div className="text-center mb-6 space-y-2">
        <div className="flex justify-center">
          <YawmakLogo size={46} />
        </div>
        <h1 className="font-display text-3xl font-bold yawmak-gold-text pt-2">إنشاء حساب جديد</h1>
        <p className="text-xs sm:text-sm text-[var(--yawmak-text-muted)]">
          أنشئ حسابك في يومك.
        </p>
      </div>

      <YawmakCard glow>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Honeypot field hidden from legitimate users */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={websiteTrap}
              onChange={(e) => setWebsiteTrap(e.target.value)}
            />
          </div>

          <YawmakInput
            label="اسم المستخدم"
            required
            placeholder="مثال: أحمد المنصوري"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <YawmakInput
              label="رقم الهاتف"
              required
              type="tel"
              dir="ltr"
              placeholder="01012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              hint="يُستخدم لتسجيل الدخول فقط ولا يظهر للعامة"
            />
            <YawmakInput
              label="البريد الإلكتروني (اختياري)"
              type="email"
              dir="ltr"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
          </div>

          <YawmakPasswordInput
            label="كلمة المرور"
            required
            showStrength
            placeholder="8 أحرف على الأقل مع أرقام"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <YawmakInput
            label="تلميح كلمة المرور (سري)"
            required
            placeholder="جملة تذكرك بكلمة مرورك دون كتابتها"
            value={passwordHint}
            onChange={(e) => setPasswordHint(e.target.value)}
            error={errors.passwordHint}
            hint="لا يظهر للعامة، ولا يُسمح بأن يطابق كلمة المرور"
          />

          {/* Gender selection — strictly for FREE default avatar ONLY */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--yawmak-text)]">
              النوع <span className="text-[var(--yawmak-gold)]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { id: "male", label: "ذكر" },
                  { id: "female", label: "أنثى" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGender(opt.id)}
                  className={`h-11 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    gender === opt.id
                      ? "bg-[var(--yawmak-gold)]/15 border-[var(--yawmak-gold)] text-[var(--yawmak-gold-soft)]"
                      : "bg-[var(--yawmak-bg-elevated)] border-[var(--yawmak-border-subtle)] text-[var(--yawmak-text-muted)] hover:border-white/25"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[var(--yawmak-text-muted)]">
              يُستخدم فقط لتعيين الصورة الافتراضية للحساب المجاني، ولا يُعرض للعامة أبدًا.
            </p>
            {errors.gender && <p className="text-xs text-red-400">{errors.gender}</p>}
          </div>

          {/* Mandatory 27 Egypt Governorates Searchable Select */}
          <GovernorateSearchSelect
            value={governorate}
            onChange={setGovernorate}
            error={errors.governorate}
            required
          />
          <p className="text-[11px] text-[var(--yawmak-text-muted)] -mt-2">
            تُستخدم المحافظة لضبط مواقيت الصلاة والتحليلات المجمعة فقط.
          </p>

          {/* Terms Agreement */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-[var(--yawmak-border-subtle)] cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 accent-[#B89545] w-4 h-4"
            />
            <span className="text-xs text-[var(--yawmak-text-muted)] leading-relaxed">
              أوافق على{" "}
              <Link href="/terms" className="text-[var(--yawmak-gold-soft)] underline">
                الشروط والأحكام
              </Link>{" "}
              و{" "}
              <Link href="/privacy" className="text-[var(--yawmak-gold-soft)] underline">
                سياسة الخصوصية
              </Link>{" "}
              الخاصة بمنصة YAWMAK | يومك.
            </span>
          </label>
          {errors.termsAccepted && <p className="text-xs text-red-400">{errors.termsAccepted}</p>}

          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/35 text-xs text-red-300">
              {formError}
            </div>
          )}

          <YawmakButton type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            <UserPlus className="w-4 h-4" />
            إنشاء الحساب وبدء رحلة يومك
          </YawmakButton>

          <div className="flex items-center justify-between pt-2 text-xs text-[var(--yawmak-text-muted)]">
            <span />
            <Link href="/login" className="text-[var(--yawmak-gold-soft)] font-semibold hover:underline">
              لديك حساب؟ تسجيل الدخول
            </Link>
          </div>
        </form>
      </YawmakCard>

      <p className="text-center text-[11px] text-[var(--yawmak-text-muted)] mt-4 flex items-center justify-center gap-1.5">
      </p>
    </div>
  );
}
