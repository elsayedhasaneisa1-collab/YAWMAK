import React from "react";

type ArtProps = { className?: string; title?: string };

const GRADIENTS = (
  <defs>
    <linearGradient id="ymArtPrimary" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#D4AF62" />
      <stop offset="55%" stopColor="#B89545" />
      <stop offset="100%" stopColor="#8D6B2D" />
    </linearGradient>
    <linearGradient id="ymArtSoft" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="100%" stopColor="#FAF3E3" />
    </linearGradient>
    <linearGradient id="ymArtWarm" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#FAF3E3" />
      <stop offset="100%" stopColor="#FBF7F0" />
    </linearGradient>
  </defs>
);

export function TasksIllustration({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 220 160" className={className} role="img" aria-label="رسم توضيحي للمهام">
      {GRADIENTS}
      <rect x="26" y="30" width="140" height="96" rx="16" fill="url(#ymArtSoft)" stroke="#EEEAF3" />
      <rect x="40" y="20" width="140" height="96" rx="16" fill="#FFFFFF" stroke="#EEEAF3" />
      <rect x="54" y="40" width="18" height="18" rx="6" fill="url(#ymArtPrimary)" />
      <path d="M58.5 49.2l3 3 5.4-5.6" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="80" y="44" width="76" height="7" rx="3.5" fill="#EEEAF3" />
      <rect x="54" y="70" width="18" height="18" rx="6" fill="#FAF3E3" stroke="#D4AF62" strokeWidth="1.4" />
      <rect x="80" y="74" width="58" height="7" rx="3.5" fill="#EEEAF3" />
      <rect x="54" y="98" width="18" height="18" rx="6" fill="#FAF3E3" stroke="#D4AF62" strokeWidth="1.4" />
      <rect x="80" y="102" width="66" height="7" rx="3.5" fill="#EEEAF3" />
      <circle cx="184" cy="44" r="16" fill="url(#ymArtPrimary)" opacity="0.92" className="ym-float" />
      <path d="M178 44.2l4 4 7.4-7.8" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="30" cy="128" r="5" fill="#D4AF62" opacity="0.55" />
      <circle cx="196" cy="112" r="4" fill="#B89545" opacity="0.35" />
    </svg>
  );
}

export function FocusIllustration({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 220 160" className={className} role="img" aria-label="رسم توضيحي للتركيز">
      {GRADIENTS}
      <circle cx="110" cy="82" r="58" fill="url(#ymArtWarm)" />
      <circle cx="110" cy="82" r="58" fill="none" stroke="#EEEAF3" strokeWidth="2" />
      <circle cx="110" cy="82" r="44" fill="#FFFFFF" stroke="#E8D8A8" strokeWidth="1.6" />
      <path
        d="M110 46a36 36 0 0 1 32 19"
        fill="none"
        stroke="url(#ymArtPrimary)"
        strokeWidth="6"
        strokeLinecap="round"
        className="ym-draw"
      />
      <g className="ym-orbit" style={{ transformOrigin: "110px 82px" }}>
        <circle cx="110" cy="26" r="7" fill="url(#ymArtPrimary)" />
      </g>
      <path d="M110 62v22l14 8" stroke="#B89545" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="98" y="16" width="24" height="7" rx="3.5" fill="#D4AF62" opacity="0.75" />
      <circle cx="36" cy="46" r="5" fill="#D4AF62" opacity="0.4" />
      <circle cx="188" cy="122" r="6" fill="#B89545" opacity="0.3" />
    </svg>
  );
}

export function NotesIllustration({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 220 160" className={className} role="img" aria-label="رسم توضيحي للملاحظات">
      {GRADIENTS}
      <rect x="44" y="26" width="118" height="104" rx="16" fill="url(#ymArtSoft)" stroke="#EEEAF3" transform="rotate(-5 103 78)" />
      <rect x="58" y="34" width="118" height="104" rx="16" fill="#FFFFFF" stroke="#EEEAF3" />
      <rect x="76" y="56" width="82" height="8" rx="4" fill="#EEEAF3" />
      <rect x="76" y="74" width="62" height="8" rx="4" fill="#EEEAF3" />
      <rect x="76" y="92" width="72" height="8" rx="4" fill="#EEEAF3" />
      <rect x="76" y="110" width="42" height="8" rx="4" fill="#E8D8A8" />
      <g className="ym-float">
        <rect x="150" y="18" width="14" height="58" rx="7" fill="url(#ymArtPrimary)" transform="rotate(22 157 47)" />
        <path d="M155 72l7 3 -8 6z" fill="#8D6B2D" transform="rotate(22 157 72)" />
      </g>
      <circle cx="36" cy="112" r="6" fill="#D4AF62" opacity="0.35" />
    </svg>
  );
}

export function EmptyStateArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 200 150" className={className} role="img" aria-label="لا توجد بيانات">
      {GRADIENTS}
      <ellipse cx="100" cy="126" rx="66" ry="10" fill="#EEEAF3" opacity="0.7" />
      <path d="M42 62h116l-12 52a12 12 0 0 1-12 9H66a12 12 0 0 1-12-9z" fill="url(#ymArtSoft)" stroke="#EEEAF3" />
      <path d="M42 62l16-26h84l16 26z" fill="#FAF3E3" stroke="#E8D8A8" />
      <circle cx="100" cy="42" r="12" fill="url(#ymArtPrimary)" opacity="0.9" className="ym-float" />
      <path d="M96 42.4l3 3 5.6-6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function HeroArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 420 260" className={className} aria-hidden="true" focusable="false">
      {GRADIENTS}
      <circle cx="316" cy="72" r="86" fill="url(#ymArtWarm)" />
      <path
        d="M150 218c0-70 46-126 104-126s104 56 104 126"
        fill="none"
        stroke="#E8D8A8"
        strokeWidth="2"
        strokeDasharray="6 10"
      />
      <path
        d="M186 218c0-48 32-88 68-88s68 40 68 88"
        fill="none"
        stroke="#D4AF62"
        strokeWidth="2.4"
        opacity="0.65"
      />
      <circle cx="254" cy="130" r="30" fill="url(#ymArtPrimary)" opacity="0.92" />
      <circle cx="254" cy="130" r="46" fill="none" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.7" />
      <g className="ym-orbit" style={{ transformOrigin: "254px 130px" }}>
        <circle cx="254" cy="72" r="6" fill="#D4AF62" />
        <circle cx="312" cy="130" r="4.4" fill="#B89545" opacity="0.8" />
      </g>
      <g fill="#D4AF62" opacity="0.35">
        <circle cx="72" cy="64" r="5" />
        <circle cx="112" cy="112" r="3.4" />
        <circle cx="52" cy="152" r="4.2" />
        <circle cx="132" cy="188" r="3" />
        <circle cx="382" cy="196" r="4.6" />
      </g>
    </svg>
  );
}

export function DecorWaves({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 1200 120" className={className} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M0 78C160 30 320 30 480 66s320 42 480 6 200-42 240-52v100H0z" fill="#FAF3E3" opacity="0.75" />
      <path d="M0 96C180 56 340 56 500 84s320 34 480 2 180-34 220-42v76H0z" fill="#EDE6F9" opacity="0.55" />
    </svg>
  );
}

export function DecorDots({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" focusable="false">
      <g fill="#D4AF62" opacity="0.32">
        {Array.from({ length: 6 }).map((_, row) =>
          Array.from({ length: 6 }).map((__, col) => (
            <circle key={`${row}-${col}`} cx={10 + col * 20} cy={10 + row * 20} r="2.2" />
          ))
        )}
      </g>
    </svg>
  );
}

export function GoldCrescentArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="gcGlow" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#D4AF62" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#D4AF62" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gcMetal" x1="20" y1="18" x2="180" y2="184" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F2E3B8" />
          <stop offset="45%" stopColor="#D4AF62" />
          <stop offset="100%" stopColor="#8D6B2D" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="url(#gcGlow)" />
      <path
        d="M116 26C72 28 40 64 40 106c0 42 32 78 76 80 24 1.2 46-8 62-25-20 26-50 42-82 42-48 0-86-38-86-86 0-40 28-74 66-86 8-2.6 17-4 26-4.6z"
        fill="url(#gcMetal)"
      />
      <path
        d="M60 78c10-20 28-34 50-38"
        stroke="#FBF6EA"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function GoldOrnament({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 240 80" className={className} aria-hidden="true" focusable="false">
      <g fill="none" stroke="#D4AF62" strokeWidth="1.4" opacity="0.7">
        <path d="M8 40h84" />
        <path d="M148 40h84" />
        <rect x="104" y="22" width="32" height="36" rx="6" />
        <rect x="112" y="30" width="16" height="20" rx="4" />
        <circle cx="120" cy="40" r="4" fill="#D4AF62" stroke="none" />
        <circle cx="96" cy="40" r="3" />
        <circle cx="144" cy="40" r="3" />
      </g>
    </svg>
  );
}

export function EightPointStar({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <g fill="none" stroke="#B89545" strokeWidth="1.3">
        <rect x="10" y="10" width="20" height="20" rx="3" />
        <rect x="10" y="10" width="20" height="20" rx="3" transform="rotate(45 20 20)" />
        <circle cx="20" cy="20" r="3.2" fill="#D4AF62" stroke="none" />
      </g>
    </svg>
  );
}

export function RingsArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 240 180" className={className} role="img" aria-label="حلقتا زفاف">
    <defs>
      <linearGradient id="ringGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F2E3B8" />
        <stop offset="55%" stopColor="#D4AF62" />
        <stop offset="100%" stopColor="#8D6B2D" />
      </linearGradient>
    </defs>
    <ellipse cx="88" cy="98" rx="52" ry="24" fill="none" stroke="url(#ringGold)" strokeWidth="6" />
    <ellipse cx="154" cy="98" rx="52" ry="24" fill="none" stroke="#E8D8A8" strokeWidth="6" />
    <path d="M120 40c6 8 6 14 0 20-6-6-6-12 0-20z" fill="#D4AF62" />
  </svg>
  );
}

export function ConfettiArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 240 180" className={className} aria-hidden="true" focusable="false">
      <g>
        {[
          { x: 30, y: 40, c: "#D4AF62" },
          { x: 60, y: 24, c: "#E8D8A8" },
          { x: 96, y: 48, c: "#B89545" },
          { x: 132, y: 28, c: "#F2E3B8" },
          { x: 170, y: 52, c: "#D4AF62" },
          { x: 204, y: 36, c: "#E8D8A8" },
          { x: 48, y: 120, c: "#E8D8A8" },
          { x: 192, y: 128, c: "#D4AF62" },
        ].map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={i % 2 === 0 ? 5 : 3.4} fill={d.c} opacity="0.85" className="ym-float" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
        <path d="M120 74v34" stroke="#B89545" strokeWidth="1.6" opacity="0.6" />
        <path d="M108 108h24l-4 14H112z" fill="#D4AF62" />
      </g>
    </svg>
  );
}

export function CakeArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 240 180" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="120" cy="152" rx="74" ry="10" fill="#EDE5D3" />
      <rect x="70" y="96" width="100" height="48" rx="8" fill="#FFFFFF" stroke="#EDE5D3" />
      <rect x="84" y="64" width="72" height="34" rx="8" fill="#FAF3E3" stroke="#E8D8A8" />
      <path d="M78 110c8-6 12 6 20 0s12 6 20 0 12 6 20 0" fill="none" stroke="#D4AF62" strokeWidth="2" strokeLinecap="round" />
      <rect x="116" y="40" width="8" height="20" rx="3" fill="#D4AF62" />
      <circle cx="120" cy="36" r="5" fill="#F2E3B8" className="ym-float" />
      <circle cx="52" cy="70" r="4" fill="#D4AF62" opacity="0.5" />
      <circle cx="192" cy="90" r="5" fill="#E8D8A8" opacity="0.6" />
    </svg>
  );
}

export function LanternArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 200 180" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F2E3B8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#D4AF62" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="96" r="56" fill="url(#lanternGlow)" opacity="0.7" />
      <path d="M100 24v14" stroke="#8D6B2D" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="82" y="36" width="36" height="10" rx="4" fill="#8D6B2D" />
      <path d="M74 50h52l-8 62H82z" fill="#FAF3E3" stroke="#D4AF62" strokeWidth="1.6" />
      <path d="M88 50v62M100 50v62M112 50v62" stroke="#E8D8A8" strokeWidth="1.2" />
      <rect x="88" y="112" width="24" height="8" rx="3" fill="#8D6B2D" />
    </svg>
  );
}

export function AnimatedCheck({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="تم">
      <circle cx="24" cy="24" r="21" fill="url(#ymArtPrimary)" opacity="0.12" />
      <circle cx="24" cy="24" r="21" fill="none" stroke="#B89545" strokeWidth="2" className="ym-draw" />
      <path
        d="M15 24.4l6.4 6.4L33 18.4"
        fill="none"
        stroke="#B89545"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ym-draw"
      />
      {GRADIENTS}
    </svg>
  );
}
