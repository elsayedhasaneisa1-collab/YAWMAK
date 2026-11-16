"use client";

import React, { useEffect, useRef, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function usePointerStrength(): number {
  const [strength, setStrength] = useState(1);
  useEffect(() => {
    const coarse = window.matchMedia("(hover: none) and (pointer: coarse)");
    const lowMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const update = () => setStrength(coarse.matches ? 0.55 : 1);
    const init = window.setTimeout(() => {
      update();
      if (typeof lowMemory === "number" && lowMemory <= 2) setStrength(0.5);
    }, 0);
    coarse.addEventListener("change", update);
    return () => {
      window.clearTimeout(init);
      coarse.removeEventListener("change", update);
    };
  }, []);
  return strength;
}

export interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  glare?: boolean;
  lift?: number;
  style?: React.CSSProperties;
}

export function TiltCard({
  children,
  className = "",
  maxTilt = 9,
  scale = 1.015,
  glare = true,
  lift = 8,
  style,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const strength = usePointerStrength();

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || reduced) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    const tilt = maxTilt * strength;
    el.style.transform = `perspective(1200px) rotateX(${(-py * tilt).toFixed(2)}deg) rotateY(${(
      px * tilt
    ).toFixed(2)}deg) translateY(${-lift * strength}px) scale(${scale})`;
    el.style.setProperty("--yawmak-glare-x", `${(px + 0.5) * 100}%`);
    el.style.setProperty("--yawmak-glare-y", `${(py + 0.5) * 100}%`);
  };

  const handleReset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)";
  };

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleReset}
      onPointerCancel={handleReset}
      className={`yawmak-tilt relative ${className}`.trim()}
      style={{ transform: "perspective(1200px)", transformOrigin: "center", ...style }}
    >
      {glare && <span aria-hidden="true" className="yawmak-glare" />}
      {children}
    </div>
  );
}

export function DepthStage({
  children,
  className = "",
  perspective = 1400,
}: {
  children: React.ReactNode;
  className?: string;
  perspective?: number;
}) {
  return (
    <div
      className={`relative ${className}`.trim()}
      style={{ perspective: `${perspective}px`, perspectiveOrigin: "50% 45%" }}
    >
      {children}
    </div>
  );
}

export function DepthLayer({
  children,
  depth = 0,
  className = "",
  float = false,
}: {
  children: React.ReactNode;
  depth?: number;
  className?: string;
  float?: boolean;
}) {
  return (
    <div
      className={`yawmak-depth-layer ${float ? "yawmak-float-slow" : ""} ${className}`.trim()}
      style={{ transform: `translateZ(${depth}px)` }}
    >
      {children}
    </div>
  );
}

export function AmbientBackdrop({
  variant = "emerald",
  className = "",
}: {
  variant?: "emerald" | "gold" | "noor" | "charity";
  className?: string;
}) {
  const palettes = {
    emerald:
      "radial-gradient(900px 520px at 12% -10%, rgba(16,185,129,0.22), transparent 62%), radial-gradient(760px 460px at 92% 8%, rgba(212,175,98,0.2), transparent 60%), linear-gradient(180deg, rgba(6,14,11,0.2), rgba(6,14,11,0.75))",
    gold:
      "radial-gradient(880px 520px at 82% -8%, rgba(226,190,74,0.22), transparent 60%), radial-gradient(700px 420px at 10% 18%, rgba(212,175,55,0.14), transparent 58%), linear-gradient(180deg, rgba(10,12,10,0.25), rgba(8,10,9,0.8))",
    noor:
      "radial-gradient(900px 540px at 50% -12%, rgba(240,215,136,0.2), transparent 62%), radial-gradient(680px 420px at 8% 78%, rgba(159,179,169,0.12), transparent 60%), linear-gradient(180deg, rgba(10,16,14,0.28), rgba(8,13,11,0.86))",
    charity:
      "radial-gradient(860px 500px at 18% 6%, rgba(16,185,129,0.18), transparent 58%), radial-gradient(720px 460px at 88% 76%, rgba(212,175,55,0.14), transparent 60%), linear-gradient(180deg, rgba(7,14,11,0.22), rgba(6,11,9,0.78))",
  };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 yawmak-shimmer ${className}`.trim()}
      style={{ background: palettes[variant] }}
    />
  );
}

export function OrnamentFrame({
  children,
  className = "",
  tone = "gold",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "gold" | "silver";
}) {
  const color = tone === "gold" ? "var(--yawmak-gold)" : "#D4AF62";
  return (
    <div className={`relative rounded-[28px] p-[1.5px] ${className}`.trim()}>
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[28px] opacity-70"
        style={{
          background: `linear-gradient(145deg, ${color}, transparent 42%, ${color}66 78%, transparent)`,
        }}
      />
      <div className="relative rounded-[26px] h-full">{children}</div>
    </div>
  );
}
