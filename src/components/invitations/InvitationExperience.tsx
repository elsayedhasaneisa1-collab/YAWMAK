"use client";

import React, { useMemo, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CircleDot,
  Crown,
  ExternalLink,
  Flame,
  HeartHandshake,
  Send,
  Sparkles,
  Users,
} from "@/components/ui/icons";
import {
  YawmakBadge,
  YawmakButton,
  VerificationSeal,
} from "@/components/ui/DesignSystem";
import {
  AmbientBackdrop,
  DepthLayer,
  DepthStage,
  OrnamentFrame,
  TiltCard,
} from "@/components/three/Depth";
import ShareBar from "./ShareBar";

export interface InvitationView {
  id: string;
  slug: string;
  type: string;
  title: string;
  description: string;
  templateId: string;
  themeColor: string;
  fontFamily: string;
  bgStyle: string;
  targetUrl: string | null;
  metadata: Record<string, unknown> | null;
  viewsCount: number;
  sharesCount: number;
  createdAt: string;
  creatorName: string;
  creatorBadge: string | null;
}

interface Persona {
  label: string;
  mood: string;
  accent: string;
  accentSoft: string;
  backdrop: "emerald" | "gold" | "noor" | "charity";
  icon: React.ComponentType<{ className?: string }>;
  headline: string;
  action: string;
  note: string;
}

const PERSONAS: Record<string, Persona> = {
  quran: {
    label: "دعوة قرآنية",
    mood: "نور وهداية",
    accent: "#B89545",
    accentSoft: "#D4AF62",
    backdrop: "gold",
    icon: BookOpen,
    headline: "تلاوةٌ يرتاح لها القلب",
    action: "شارك الآية وادعُ لصاحبه بالقبول",
    note: "كل حرف من القرآن الكريم يُقرأ كما ورد بالرسم العثماني دون تعديل.",
  },
  adhkar: {
    label: "دعوة إلى الأذكار",
    mood: "سكينة وطمأنينة",
    accent: "#D4AF62",
    accentSoft: "#A7F3D0",
    backdrop: "emerald",
    icon: Sparkles,
    headline: "ذكرٌ يملأ اليوم بركة",
    action: "شارك الذكر وادعُ بظهر الغيب",
    note: "الأذكار موثقة بمصادرها، والعدّ محفوظ لك في عدادك الشخصي.",
  },
  khatma: {
    label: "دعوة إلى ختمة",
    mood: "تدبر ومداومة",
    accent: "#B89545",
    accentSoft: "#D4AF62",
    backdrop: "gold",
    icon: CircleDot,
    headline: "ختمةٌ نشارك أجرها",
    action: "سجّل نيتك وابدأ القراءة",
    note: "تُحتسب القراءات المكتملة في عداد مستقل عن عدد مرات المشاركة.",
  },
  charity: {
    label: "دعوة إلى عمل خيري",
    mood: "عطاء وامتداد",
    accent: "#B89545",
    accentSoft: "#DCC58E",
    backdrop: "charity",
    icon: HeartHandshake,
    headline: "عطاء لا يتوقف",
    action: "انشر الدعوة وشارك في الخير",
    note: "الدعوة إلى الخير تشارك صاحبها أجرها دون أن ينقص من أجره شيء.",
  },
  occasion: {
    label: "دعوة مناسبة",
    mood: "بهجة معتدلة",
    accent: "#E0B94B",
    accentSoft: "#D4AF62",
    backdrop: "gold",
    icon: Sparkles,
    headline: "مناسبةٌ نُحيّيها بذكرٍ ودعاء",
    action: "شارك المناسبة مع من تحب",
    note: "مناسبات تُعاش بتوازن، وذكرٌ لا ينقطع.",
  },
  personal: {
    label: "دعوة شخصية",
    mood: "دفء وقرب",
    accent: "#D4AF62",
    accentSoft: "#D4AF62",
    backdrop: "emerald",
    icon: Send,
    headline: "كلمةٌ من القلب تصل",
    action: "أرسل الدعوة لمن تحب",
    note: "رسالة شخصية بسيطة قد تحمل خيرًا كبيرًا.",
  },
  campaign: {
    label: "دعوة إلى حملة",
    mood: "تعاون وحركة",
    accent: "#B89545",
    accentSoft: "#DCC58E",
    backdrop: "emerald",
    icon: Users,
    headline: "حملةٌ نؤديها معًا",
    action: "انضم إلى الحملة وشارك التقدم",
    note: "التقدم الحقيقي يُقاس بالعمل لا بالتنظير.",
  },
};

function PersonaOrnament({ accent }: { accent: string }) {
  return (
    <svg
      viewBox="0 0 320 320"
      className="w-full h-full opacity-[0.19]"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <g fill="none" stroke={accent} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="160" cy="160" r="137" strokeWidth="1.1" strokeDasharray="2 9" />
        <circle cx="160" cy="160" r="119" strokeWidth="0.8" />
        <path strokeWidth="1.35" d="M160 17 181 66 232 39 225 93 281 99 245 140 293 176 239 191 254 245 203 226 176 282 151 232 103 270 105 215 49 211 87 170 34 137 89 119 74 64 126 83Z" />
        <path strokeWidth="1.1" d="M160 49 177 91 221 82 207 124 249 150 207 173 217 219 174 205 151 247 132 203 86 218 101 174 61 148 105 128 96 83 139 99Z" />
        <circle cx="160" cy="160" r="72" strokeWidth="1.25" />
        <circle cx="160" cy="160" r="57" strokeWidth="0.8" strokeDasharray="3 6" />
        <path strokeWidth="1.2" d="M160 89 171 137 219 160 171 183 160 231 149 183 101 160 149 137Z" />
        <path strokeWidth="0.9" d="M160 111V209M111 160H209M125 125 195 195M195 125 125 195" />
        <circle cx="160" cy="160" r="9" strokeWidth="1.2" />
        {[0,45,90,135,180,225,270,315].map((angle) => (
          <circle
            key={angle}
            cx={160 + Math.cos((angle * Math.PI) / 180) * 126}
            cy={160 + Math.sin((angle * Math.PI) / 180) * 126}
            r="2.8"
            fill={accent}
            stroke="none"
          />
        ))}
      </g>
    </svg>
  );
}

export default function InvitationExperience({ invitation }: { invitation: InvitationView }) {
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const persona = PERSONAS[invitation.type] || PERSONAS.personal;
  const Icon = persona.icon;

  const springX = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.6 });
  const springY = useSpring(my, { stiffness: 60, damping: 18, mass: 0.6 });
  const layerOneX = useTransform(springX, [-0.5, 0.5], [-18, 18]);
  const layerOneY = useTransform(springY, [-0.5, 0.5], [-14, 14]);
  const layerTwoX = useTransform(springX, [-0.5, 0.5], [14, -14]);
  const layerTwoY = useTransform(springY, [-0.5, 0.5], [10, -10]);

  const fontFamilyClass =
    invitation.fontFamily === "amiri" ? "font-quran" : invitation.fontFamily === "tajawal" ? "font-display" : "";

  const template = useMemo(() => {
    const dark = invitation.templateId !== "ivory-mosque";
    return {
      surface: dark ? "rgba(10, 22, 17, 0.72)" : "rgba(255, 252, 245, 0.86)",
      text: dark ? "#292638" : "#292638",
      muted: dark ? "#898494" : "#4B6158",
      border: dark ? "rgba(212,175,55,0.28)" : "rgba(154,114,20,0.28)",
    };
  }, [invitation.templateId]);

  const handleStageMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const metaDate = new Date(invitation.createdAt).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#FAF8F3" }}>
      <AmbientBackdrop variant={persona.backdrop} />

      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ x: layerOneX, y: layerOneY }}
        aria-hidden="true"
      >
        <div className="absolute -top-24 right-[-120px] w-[420px] h-[420px] yawmak-float-slow">
          <PersonaOrnament accent={persona.accent} />
        </div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ x: layerTwoX, y: layerTwoY }}
        aria-hidden="true"
      >
        <div className="absolute bottom-[-160px] left-[-140px] w-[520px] h-[520px] opacity-80">
          <PersonaOrnament accent="#D4AF62" />
        </div>
      </motion.div>

      <div
        ref={stageRef}
        onPointerMove={handleStageMove}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        className="relative z-10"
      >
        <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between gap-3">
          <Link
            href="/invitations"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#898494] hover:text-[#D4AF62] transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            كل الدعوات
          </Link>
          <YawmakBadge tone="gold">
            <Icon className="w-3.5 h-3.5" />
            {persona.label} — {persona.mood}
          </YawmakBadge>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 pt-8 space-y-10">
          <DepthStage>
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 72, z: -140, rotateX: -22, rotateY: 9, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, z: 0, rotateX: 0, rotateY: 0, scale: 1 }}
              transition={{ duration: 1.15, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              style={{ perspective: 1800, transformStyle: "preserve-3d" }}
            >
              <TiltCard maxTilt={9} lift={14}>
                <OrnamentFrame tone={invitation.templateId === "ivory-mosque" ? "silver" : "gold"}>
                  <div
                    className="relative isolate overflow-hidden rounded-[26px] p-7 sm:p-12 space-y-7"
                    style={{
                      transformStyle: "preserve-3d",
                      background: invitation.templateId === "ivory-mosque"
                        ? "linear-gradient(155deg,#FAF6EC,#EDE2CC)"
                        : "linear-gradient(155deg, #FFFFFF, #F7F3FC 55%, #FBF9FF)",
                      boxShadow: "0 50px 110px -55px rgba(212,175,55,0.85), 0 12px 28px -18px rgba(184,149,69,0.48)",
                      color: template.text,
                    }}
                  >
                    <div className="pointer-events-none absolute inset-3 rounded-[20px] border border-[#B89545]/20" aria-hidden="true" />
                    <div className="pointer-events-none absolute -top-16 left-1/2 h-44 w-44 -translate-x-1/2 opacity-[0.08]" aria-hidden="true">
                      <PersonaOrnament accent={persona.accent} />
                    </div>
                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-3" style={{ transform: "translateZ(28px)" }}>
                      <YawmakBadge tone="gold">
                        <Icon className="w-3.5 h-3.5" />
                        {persona.headline}
                      </YawmakBadge>
                      <span className="text-[11px]" style={{ color: template.muted }}>
                        {metaDate}
                      </span>
                    </div>

                    <div className="relative z-10 space-y-4" style={{ transform: "translateZ(42px)" }}>
                      <h1
                        className={`text-3xl sm:text-5xl leading-[1.45] font-bold ${fontFamilyClass}`}
                        style={{ color: persona.accentSoft }}
                      >
                        {invitation.title}
                      </h1>
                      <p
                        className={`text-base sm:text-lg leading-[2.2] whitespace-pre-line ${fontFamilyClass}`}
                        style={{ color: template.text }}
                      >
                        {invitation.description}
                      </p>
                    </div>

                    <div
                      className="relative z-10 flex flex-wrap items-center gap-2.5 pt-4 text-xs"
                      style={{ transform: "translateZ(24px)", borderTop: `1px solid ${template.border}` }}
                    >
                      <span className="inline-flex items-center gap-1.5" style={{ color: template.muted }}>
                        <Users className="w-3.5 h-3.5" />
                        {invitation.viewsCount} مشاهدة
                      </span>
                      <span className="inline-flex items-center gap-1.5" style={{ color: template.muted }}>
                        <Send className="w-3.5 h-3.5" />
                        {invitation.sharesCount} مشاركة
                      </span>
                      <span className="inline-flex items-center gap-1.5" style={{ color: template.muted }}>
                        <Crown className="w-3.5 h-3.5" />
                        {invitation.creatorName}
                      </span>
                      <VerificationSeal badge={invitation.creatorBadge} />
                    </div>

                    {invitation.targetUrl && (
                      <div>
                        <a
                          href={invitation.targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl font-bold text-sm transition-transform active:scale-[0.98]"
                          style={{
                            background: `linear-gradient(135deg, ${persona.accent}, ${persona.accent}bb)`,
                            color: "#FFFFFF",
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                          فتح الرابط المرفق
                        </a>
                      </div>
                    )}
                  </div>
                </OrnamentFrame>
              </TiltCard>
            </motion.div>
          </DepthStage>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="yawmak-glass rounded-3xl p-6 sm:p-8 space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-xl font-bold yawmak-gold-text">شارك هذه الدعوة</h2>
                <p className="text-xs text-[#898494]">{persona.action}</p>
              </div>
              <YawmakBadge tone="emerald">
                <Flame className="w-3.5 h-3.5" /> {persona.note}
              </YawmakBadge>
            </div>

            <ShareBar
              title={invitation.title}
              text={invitation.description.slice(0, 180)}
              path={`/invitations/${invitation.slug}`}
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Sparkles,
                title: "دعوة بصدق",
                body: "دعوة صادقة من القلب تصل بركتها إن شاء الله، ومشاركتها تضيف أجرًا لصاحبها.",
              },
              {
                icon: CircleDot,
                title: "ذكرٌ لا ينقطع",
                body: "يمكنك تسبيحك ودعائك في هذه الصفحة ليُحفظ في عدادك الشخصي وفي الإجمالي المشترك.",
              },
              {
                icon: Users,
                title: "مشاركة جماعية",
                body: "كل من يشارك يظهر في عدد المشاركين دون الكشف عن أي بيانات شخصية.",
              },
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={reduced ? false : { opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
              >
                <TiltCard maxTilt={11} lift={6} glare={false}>
                  <div className="yawmak-card rounded-3xl p-6 space-y-2.5 h-full">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: `${persona.accent}1f`, color: persona.accent }}
                    >
                      <card.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#292638]">{card.title}</h3>
                    <p className="text-xs text-[#898494] leading-relaxed">{card.body}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/tasbih">
              <YawmakButton variant="primary" size="lg">
                <CircleDot className="w-4 h-4" /> افتح عدادات الأذكار
              </YawmakButton>
            </Link>
            <Link href="/register">
              <YawmakButton variant="outline" size="lg">
                أنشئ دعوتك الخاصة
              </YawmakButton>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
