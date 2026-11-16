"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  Moon,
  Send,
  ShieldCheck,
  Users,
} from "@/components/ui/icons";
import {
  YawmakBadge,
  YawmakButton,
  YawmakCard,
  VerificationSeal,
} from "@/components/ui/DesignSystem";
import { AmbientBackdrop, DepthLayer, DepthStage, TiltCard } from "@/components/three/Depth";
import ShareBar from "./ShareBar";
import dynamic from "next/dynamic";
import { MOURNING_DUAS } from "@/lib/islamic-data";

const DhikrCounters = dynamic(() => import("@/components/dhikr/DhikrCounters"), {
  loading: () => <div className="h-64 rounded-3xl animate-pulse bg-white/5" />,
});

const QuranReadingSection = dynamic(() => import("./QuranReadingSection"), {
  loading: () => <div className="h-80 rounded-3xl animate-pulse bg-white/5" />,
});
import type { InvitationView } from "./InvitationExperience";
import { usePrefersReducedMotion } from "@/components/three/Depth";

const CALM = {
  bg: "#F7F4FB",
  surface: "rgba(255, 255, 255, 0.88)",
  text: "#292638",
  muted: "#898494",
  accent: "#B89545",
  accentSoft: "#5B4A8A",
  gold: "#B89545",
  border: "#EEEAF3",
};

function DuaCard({ item, index }: { item: (typeof MOURNING_DUAS)[number]; index: number }) {
  const [copied, setCopied] = useState(false);
  const reduced = usePrefersReducedMotion();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${item.text}\n— ${item.reference}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const share = async () => {
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    const payload = { title: "دعاء للمتوفى", text: `${item.text}\n— ${item.reference}` };
    if (typeof nav.share === "function") {
      try {
        await nav.share(payload);
        return;
      } catch {
        return;
      }
    }
    await copy();
  };

  return (
    <div
      className={`rounded-3xl p-6 space-y-4 ${reduced ? "" : "yawmak-fade-up"}`}
      style={{
        background: CALM.surface,
        border: `1px solid ${CALM.border}`,
        animationDelay: `${index * 90}ms`,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <YawmakBadge tone={item.verified ? "emerald" : "neutral"}>
          {item.verified ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5" /> {item.source}
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5" /> {item.source}
            </>
          )}
        </YawmakBadge>
        <span className="text-[11px]" style={{ color: CALM.muted }}>
          {item.reference}
        </span>
      </div>

      <p className="font-quran text-xl sm:text-2xl leading-[2.35]" style={{ color: CALM.text }}>
        {item.text}
      </p>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          style={{ background: "rgba(121,86,200,0.06)", border: `1px solid ${CALM.border}`, color: CALM.accentSoft }}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "تم النسخ" : "نسخ الدعاء"}
        </button>
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          style={{ background: "rgba(121,86,200,0.06)", border: `1px solid ${CALM.border}`, color: CALM.accentSoft }}
        >
          <Send className="w-3.5 h-3.5" /> مشاركة الدعاء
        </button>
      </div>
    </div>
  );
}

export default function MourningExperience({ invitation }: { invitation: InvitationView }) {
  const meta = invitation.metadata || {};
  const deceasedName = String(meta.deceasedName || "الفقيد");
  const deceasedPhotoUrl = typeof meta.deceasedPhotoUrl === "string" ? meta.deceasedPhotoUrl : "";
  const deceasedDate = typeof meta.deceasedDate === "string" ? meta.deceasedDate : "";
  const senderMessage = typeof meta.senderMessage === "string" ? meta.senderMessage : "";
  const dedicationDua = typeof meta.dedicationDua === "string" ? meta.dedicationDua : "";
  const [photoBroken, setPhotoBroken] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: CALM.bg }}>
      <AmbientBackdrop variant="noor" className="opacity-70" />

      <div className="relative z-10">
        <header className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between gap-3">
          <Link
            href="/invitations"
            className="inline-flex items-center gap-2 text-xs font-semibold hover:opacity-80 transition-opacity"
            style={{ color: CALM.muted }}
          >
            <ArrowRight className="w-4 h-4" />
            كل الدعوات
          </Link>
          <YawmakBadge tone="neutral">
            <Moon className="w-3.5 h-3.5" /> دعاء وذكر للفقيد
          </YawmakBadge>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 pt-10 space-y-14">
          <section className="text-center space-y-5">
            <p className="text-[11px] tracking-[0.32em]" style={{ color: CALM.gold }}>
              على روح فقيد
            </p>
            <h1
              className="font-display text-4xl sm:text-6xl font-bold leading-[1.5] yawmak-fade-up"
              style={{ color: CALM.accentSoft }}
            >
              «اجعل له دعاءً لا ينقطع»
            </h1>
            <p className="text-base sm:text-lg leading-[2.2] max-w-2xl mx-auto" style={{ color: CALM.muted }}>
              «ساهم بالذكر والدعاء وقراءة القرآن الكريم، ونسأل الله أن يتغمده بواسع رحمته»
            </p>
          </section>

          <DepthStage perspective={1200}>
            <TiltCard maxTilt={3} lift={6} glare={false}>
              <div
                className="rounded-[28px] p-7 sm:p-10 space-y-7"
                style={{
                  background: "linear-gradient(165deg, #FFFFFF, #FBF9FF)",
                  border: `1px solid ${CALM.border}`,
                  boxShadow: "0 46px 110px -60px rgba(41,38,56,0.18)",
                }}
              >
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <DepthLayer depth={18} float>
                    <div
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                      style={{
                        border: `1.5px solid ${CALM.border}`,
                        background: "rgba(255,255,255,0.88)",
                      }}
                    >
                      {deceasedPhotoUrl && !photoBroken ? (
                        <img
                          src={deceasedPhotoUrl}
                          alt={`صورة الفقيد ${deceasedName}`}
                          width={128}
                          height={128}
                          loading="lazy"
                          onError={() => setPhotoBroken(true)}
                          className="w-full h-full object-cover"
                          style={{ filter: "grayscale(28%) brightness(0.94)" }}
                        />
                      ) : (
                        <Moon className="w-11 h-11" style={{ color: CALM.gold, opacity: 0.85 }} />
                      )}
                    </div>
                  </DepthLayer>

                  <div className="text-center sm:text-right space-y-2.5">
                    <p className="text-xs" style={{ color: CALM.muted }}>
                      ندعو الله لـ
                    </p>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: CALM.accentSoft }}>
                      {deceasedName}
                    </h2>
                    {deceasedDate && (
                      <p className="text-xs" style={{ color: CALM.muted }}>
                        {deceasedDate}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <YawmakBadge tone="neutral">
                        <Users className="w-3.5 h-3.5" /> {invitation.viewsCount} مشاهدة
                      </YawmakBadge>
                      <YawmakBadge tone="neutral">
                        <Send className="w-3.5 h-3.5" /> {invitation.sharesCount} مشاركة
                      </YawmakBadge>
                      <span className="text-[11px]" style={{ color: CALM.muted }}>
                        من {invitation.creatorName}
                      </span>
                      <VerificationSeal badge={invitation.creatorBadge} />
                    </div>
                  </div>
                </div>

                {senderMessage && (
                  <div
                    className="rounded-2xl p-5 space-y-2"
                    style={{ background: "rgba(255,255,255,0.88)", border: `1px solid ${CALM.border}` }}
                  >
                    <p className="text-[11px] font-semibold" style={{ color: CALM.gold }}>
                      رسالة من صاحب الدعوة
                    </p>
                    <p className="text-sm sm:text-base leading-[2.1]" style={{ color: CALM.text }}>
                      {senderMessage}
                    </p>
                  </div>
                )}

                {dedicationDua && (
                  <div
                    className="rounded-2xl p-5 space-y-2"
                    style={{ background: "rgba(121,86,200,0.08)", border: `1px solid rgba(121,86,200,0.24)` }}
                  >
                    <p className="text-[11px] font-semibold" style={{ color: CALM.gold }}>
                      دعاء خاص من صاحب الدعوة
                    </p>
                    <p className="font-quran text-lg sm:text-2xl leading-[2.3]" style={{ color: CALM.accentSoft }}>
                      {dedicationDua}
                    </p>
                  </div>
                )}

                <ShareBar
                  title={`دعاء وذكر لـ ${deceasedName} — اجعل له دعاءً لا ينقطع`}
                  text={invitation.description.slice(0, 180)}
                  path={`/invitations/${invitation.slug}`}
                  tone="silver"
                />
              </div>
            </TiltCard>
          </DepthStage>

          <section className="space-y-5">
            <div className="space-y-1.5">
              <YawmakBadge tone="neutral">
                <Moon className="w-3.5 h-3.5" /> أدعية موثقة ندعو بها
              </YawmakBadge>
              <h2 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: CALM.accentSoft }}>
                أدعية للمتوفى
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed max-w-2xl" style={{ color: CALM.muted }}>
                أدعية مأخوذة من القرآن الكريم والسنّة الصحيحة، وأدعية عامة مباحة موضّح مصدرها، دون نسب أي نص
                إلى القرآن أو السنة إلا بعد التحقق.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {MOURNING_DUAS.map((item, index) => (
                <DuaCard key={item.id} item={item} index={index} />
              ))}
            </div>
          </section>

          <section
            className="rounded-[28px] p-6 sm:p-9 space-y-8"
            style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${CALM.border}` }}
          >
            <DhikrCounters
              scopeKey={invitation.id}
              heading="تسبيح وذكر نهديه للفقيد"
              subheading="عداد شخصي + إجمالي مشترك لكل الزوار"
              intro="كل تسبيحة تُضاف إلى عدادك الشخصي وإلى إجمالي مشترك يشارك فيه كل زائر لهذه الدعوة، ويتحدث لحظيًا دون إعادة تحميل الصفحة."
            />
          </section>

          <section
            className="rounded-[28px] p-6 sm:p-9 space-y-8"
            style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${CALM.border}` }}
          >
            <QuranReadingSection
              invitationId={invitation.id}
              heading="قرآن يُتلى وأجر نرجوه"
              subheading="تلاوة صادقة نهدي ثوابها للفقيد"
            />
          </section>

          <section className="text-center space-y-4">
            <p className="font-quran text-xl sm:text-2xl leading-[2.3] max-w-2xl mx-auto" style={{ color: CALM.accentSoft }}>
              «اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ»
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/tasbih">
                <YawmakButton variant="secondary" size="lg">
                  <BookOpen className="w-4 h-4" /> عدادات الأذكار
                </YawmakButton>
              </Link>
              <Link href="/invitations">
                <YawmakButton variant="outline" size="lg">
                  أنشئ دعوة على روح فقيد
                </YawmakButton>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
