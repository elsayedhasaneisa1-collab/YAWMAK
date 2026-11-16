"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Play,
  RotateCcw,
  Send,
  Share2,
  Moon,
} from "@/components/ui/icons";
import {
  CakeArt,
  ConfettiArt,
  GoldOrnament,
  LanternArt,
  RingsArt,
} from "@/components/svg/YawmakArt";
import ShareBar from "./ShareBar";
import DhikrCounters from "@/components/dhikr/DhikrCounters";
import QuranReadingSection from "./QuranReadingSection";
import { MOURNING_DUAS } from "@/lib/islamic-data";
import type { InvitationView } from "./InvitationExperience";
import { usePrefersReducedMotion } from "@/components/three/Depth";

function GoldScene({ children, tint = "#B89545" }: { children: React.ReactNode; tint?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "linear-gradient(180deg,#FBF7EC 0%,#FAF8F0 45%,#F6EFE0 100%)" }}>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `radial-gradient(720px 420px at 82% 4%, rgba(212,175,98,0.22), transparent 62%), radial-gradient(620px 400px at 6% 78%, rgba(184,149,69,0.16), transparent 60%)`,
        }}
      />
      <div
        aria-hidden="true"
        className={`absolute -left-20 top-24 w-72 h-72 rounded-full ${reduced ? "" : "ym-float"}`}
        style={{ background: "radial-gradient(closest-side, rgba(212,175,98,0.18), transparent)" }}
      />
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="flex items-center justify-center gap-2 text-[11px] tracking-[0.32em] font-bold" style={{ color: tint }}>
          <GoldOrnament className="w-40 h-14" />
        </div>
        {children}
      </div>
    </div>
  );
}

function SectionCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduced = usePrefersReducedMotion();
  return (
    <div
      className={`rounded-[26px] p-7 sm:p-9 space-y-5 bg-white/85 border border-[#EDE5D3] shadow-[0_24px_50px_-34px_rgba(184,149,69,0.5)] ${reduced ? "" : "ym-rise"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function NamesRow({ groom, bride }: { groom: string; bride: string }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-center">
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-[#8D6B2D]">العريس</p>
        <p className="font-display text-3xl sm:text-4xl text-[#29251D]">{groom}</p>
      </div>
      <GoldOrnament className="w-24 h-8 opacity-80" />
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-[#8D6B2D]">العروس</p>
        <p className="font-display text-3xl sm:text-4xl text-[#29251D]">{bride}</p>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF3E3]/70 border border-[#EDE5D3]">
      <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#B89545] shrink-0">
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-[#898273]">{label}</p>
        <p className="text-sm font-semibold text-[#29251D] truncate">{value}</p>
      </div>
    </div>
  );
}

function WeddingAttendanceExperience({ invitation }: { invitation: InvitationView }) {
  const meta = (invitation.metadata || {}) as Record<string, string>;
  const [opened, setOpened] = useState(false);
  const reduced = usePrefersReducedMotion();

  return (
    <GoldScene>
      {!opened ? (
        <div className="flex flex-col items-center text-center space-y-8 pt-8">
          <RingsArt className="w-64 h-48" />
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#8D6B2D] tracking-[0.22em]">دعوة حضور حفل زفاف</p>
            <h1 className="font-display text-3xl sm:text-5xl text-[#29251D] leading-[1.5]">
              {meta.groomName} <span className="text-[#B89545]">&</span> {meta.brideName}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setOpened(true)}
            className="group relative inline-flex items-center gap-2.5 h-14 px-8 rounded-full text-white text-sm font-bold transition-transform active:scale-[0.98] hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg,#E8D8A8,#D4AF62 55%,#B89545)", boxShadow: "0 20px 40px -18px rgba(184,149,69,0.7)" }}
          >
            <span className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </span>
            فتح الدعوة
          </button>
        </div>
      ) : (
        <>
          <SectionCard>
            <div className="space-y-4 text-center">
              <p className="text-xs font-bold text-[#8D6B2D] tracking-[0.24em]">يتشرفان بدعوتكم</p>
              <NamesRow groom={meta.groomName} bride={meta.brideName} />
              {(meta.groomFamily || meta.brideFamily) && (
                <div className="flex flex-wrap justify-center gap-3 text-xs text-[#898273]">
                  {meta.groomFamily && <span className="px-3 py-1 rounded-full bg-white border border-[#EDE5D3]">{meta.groomFamily}</span>}
                  {meta.brideFamily && <span className="px-3 py-1 rounded-full bg-white border border-[#EDE5D3]">{meta.brideFamily}</span>}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard delay={120}>
            <p className="text-base leading-[2.2] text-[#29251D] text-center">{meta.invitationMessage}</p>
          </SectionCard>

          <SectionCard delay={220}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailRow icon={Calendar} label="التاريخ" value={meta.eventDate} />
              {meta.eventTime && <DetailRow icon={Clock} label="الوقت" value={meta.eventTime} />}
              <DetailRow icon={MapPin} label="المكان" value={meta.venue} />
              {meta.venueUrl && (
                <a href={meta.venueUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF3E3] border border-[#EDE5D3] hover:border-[#D4AF62] transition-colors">
                  <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#B89545] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-[11px] text-[#898273]">رابط الموقع</p>
                    <p className="text-sm font-semibold text-[#B89545]">فتح الخريطة</p>
                  </div>
                </a>
              )}
            </div>
          </SectionCard>

          {meta.imageUrl && (
            <SectionCard delay={300}>
              <img src={meta.imageUrl} alt="صورة الدعوة" loading="lazy" className="w-full rounded-2xl object-cover max-h-[340px] border border-[#EDE5D3]" />
            </SectionCard>
          )}

          <SectionCard delay={380}>
            <ShareBar
              title={`دعوة حضور حفل زفاف ${meta.groomName} و ${meta.brideName}`}
              text={meta.invitationMessage.slice(0, 180)}
              path={`/invitations/${invitation.slug}`}
            />
          </SectionCard>
        </>
      )}
    </GoldScene>
  );
}

function WeddingCongratulationsExperience({ invitation }: { invitation: InvitationView }) {
  const meta = (invitation.metadata || {}) as Record<string, string>;
  const reduced = usePrefersReducedMotion();
  return (
    <GoldScene>
      <div className="flex flex-col items-center text-center space-y-6 pt-6">
        <ConfettiArt className="w-72 h-52" />
        <div className="space-y-3">
          <p className="text-xs font-bold text-[#8D6B2D] tracking-[0.26em]">تهنئة زفاف</p>
          <h1 className="font-display text-3xl sm:text-5xl text-[#29251D] leading-[1.5]">
            {meta.groomName} <span className="text-[#B89545]">&</span> {meta.brideName}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={`inline-flex items-center gap-2 h-11 px-5 rounded-full text-sm font-bold text-[#8D6B2D] border border-[#D4AF62] bg-white/70 ${reduced ? "" : "hover:-translate-y-0.5"} transition-transform`}
        >
          <RotateCcw className="w-4 h-4" /> إعادة المشاهدة
        </button>
      </div>

      <SectionCard>
        <p className="text-base leading-[2.3] text-[#29251D] text-center">{meta.message}</p>
        {meta.senderName && <p className="text-center text-xs font-bold text-[#B89545]">— {meta.senderName}</p>}
      </SectionCard>

      {meta.imageUrl && (
        <SectionCard delay={140}>
          <img src={meta.imageUrl} alt="صورة التهنئة" loading="lazy" className="w-full rounded-2xl object-cover max-h-[320px] border border-[#EDE5D3]" />
        </SectionCard>
      )}

      <SectionCard delay={240}>
        <ShareBar
          title={`تهنئة زفاف ${meta.groomName} و ${meta.brideName}`}
          text={meta.message.slice(0, 180)}
          path={`/invitations/${invitation.slug}`}
        />
      </SectionCard>
    </GoldScene>
  );
}

function BirthdayExperience({ invitation }: { invitation: InvitationView }) {
  const meta = (invitation.metadata || {}) as Record<string, string>;
  return (
    <GoldScene>
      <div className="flex flex-col items-center text-center space-y-6 pt-6">
        <CakeArt className="w-72 h-52" />
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#8D6B2D] tracking-[0.26em]">{meta.occasion}</p>
          <h1 className="font-display text-3xl sm:text-5xl text-[#29251D]">{meta.personName}</h1>
          {meta.eventDate && <p className="text-sm text-[#898273]">{meta.eventDate}</p>}
        </div>
      </div>
      <SectionCard>
        <p className="text-base leading-[2.3] text-[#29251D] text-center">{meta.message}</p>
      </SectionCard>
      {meta.imageUrl && (
        <SectionCard delay={140}>
          <img src={meta.imageUrl} alt="صورة المناسبة" loading="lazy" className="w-full rounded-2xl object-cover max-h-[320px] border border-[#EDE5D3]" />
        </SectionCard>
      )}
      <SectionCard delay={220}>
        <ShareBar
          title={`${meta.occasion} ${meta.personName}`}
          text={meta.message.slice(0, 180)}
          path={`/invitations/${invitation.slug}`}
        />
      </SectionCard>
    </GoldScene>
  );
}

function GeneralCongratulationsExperience({ invitation }: { invitation: InvitationView }) {
  const meta = (invitation.metadata || {}) as Record<string, string>;
  return (
    <GoldScene>
      <div className="flex flex-col items-center text-center space-y-6 pt-6">
        <LanternArt className="w-56 h-52" />
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#8D6B2D] tracking-[0.26em]">{meta.occasion}</p>
          <h1 className="font-display text-3xl sm:text-5xl text-[#29251D]">{meta.personName}</h1>
        </div>
      </div>
      <SectionCard>
        <p className="text-base leading-[2.3] text-[#29251D] text-center">{meta.message}</p>
        {meta.senderName && <p className="text-center text-xs font-bold text-[#B89545]">— {meta.senderName}</p>}
      </SectionCard>
      <SectionCard delay={180}>
        <ShareBar
          title={`${meta.occasion} — ${meta.personName}`}
          text={meta.message.slice(0, 180)}
          path={`/invitations/${invitation.slug}`}
        />
      </SectionCard>
    </GoldScene>
  );
}

function MemorialExperience({ invitation }: { invitation: InvitationView }) {
  const meta = (invitation.metadata || {}) as Record<string, string>;
  const [photoBroken, setPhotoBroken] = useState(false);
  return (
    <GoldScene tint="#8D6B2D">
      <div className="text-center space-y-4">
        <div className="mx-auto h-1 w-16 rounded-full bg-emerald-700/20" />
        <div className="space-y-1.5">
          <p className="text-xs text-[#898273]">ندعو الله لـ</p>
          <h1 className="font-display text-3xl sm:text-5xl text-[#29251D]">{meta.deceasedName}</h1>
          {meta.deceasedDate && <p className="text-xs text-[#898273]">{meta.deceasedDate}</p>}
        </div>
      </div>

      {meta.imageUrl && !photoBroken && (
        <SectionCard>
          <img
            src={meta.imageUrl}
            alt={meta.deceasedName}
            loading="lazy"
            onError={() => setPhotoBroken(true)}
            className="w-40 h-40 rounded-full object-cover mx-auto border border-[#EDE5D3]"
          />
        </SectionCard>
      )}

      {meta.senderMessage && (
        <SectionCard delay={120}>
          <p className="text-sm font-bold text-[#8D6B2D] mb-2">رسالة صاحب الدعوة</p>
          <p className="text-base leading-[2.2] text-[#29251D]">{meta.senderMessage}</p>
        </SectionCard>
      )}

      <SectionCard delay={200}>
        <p className="text-sm font-bold text-[#8D6B2D] mb-3">أدعية</p>
        <div className="space-y-3">
          {MOURNING_DUAS.slice(0, 4).map((dua) => (
            <button
              key={dua.id}
              type="button"
              onClick={() => navigator.clipboard.writeText(`${dua.text}\n— ${dua.reference}`).catch(() => undefined)}
              className="w-full text-right p-3.5 rounded-2xl bg-[#FAF3E3]/70 border border-[#EDE5D3] hover:border-[#D4AF62] transition-colors"
            >
              <p className="font-quran text-base leading-[2.1] text-[#29251D]">{dua.text}</p>
              <p className="text-[10px] text-[#898273] mt-1.5">{dua.reference}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      <div className="rounded-[26px] p-6 space-y-6 bg-white/85 border border-[#EDE5D3]">
        <DhikrCounters scopeKey={invitation.id} heading="تسبيح وذكر" intro="" />
      </div>

      <div className="rounded-[26px] p-6 space-y-6 bg-white/85 border border-[#EDE5D3]">
        <QuranReadingSection invitationId={invitation.id} heading="قرآن يُتلى" subheading="" />
      </div>

      <SectionCard>
        <ShareBar
          title={`دعاء وذكر لـ ${meta.deceasedName}`}
          text={invitation.description.slice(0, 180)}
          path={`/invitations/${invitation.slug}`}
          tone="silver"
        />
      </SectionCard>
    </GoldScene>
  );
}

const ROUTES: Record<string, React.ComponentType<{ invitation: InvitationView }>> = {
  wedding_attendance: WeddingAttendanceExperience,
  wedding_congrats: WeddingCongratulationsExperience,
  birthday: BirthdayExperience,
  congrats: GeneralCongratulationsExperience,
  mourning: MemorialExperience,
};

export default function ExperienceEngine({ invitation }: { invitation: InvitationView }) {
  const Component = useMemo(() => ROUTES[invitation.type], [invitation.type]);

  if (!Component) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <div className="mx-auto h-1 w-16 rounded-full bg-emerald-700/20" />
          <h1 className="text-2xl font-bold text-[#29251D]">هذه الرحلة غير متاحة</h1>
          <Link href="/invitations" className="text-sm font-semibold text-[#B89545] hover:underline">
            العودة إلى البطاقات
          </Link>
        </div>
      </div>
    );
  }

  return <Component invitation={invitation} />;
}
