"use client";

import React, { useEffect, useRef } from "react";

const STAGES = [
  { x: -16, y: -6, scale: 0.9, rotate: -8, opacity: 0.9 },
  { x: 14, y: 16, scale: 1.06, rotate: -2, opacity: 0.82 },
  { x: -12, y: 38, scale: 1.16, rotate: 4, opacity: 0.6 },
  { x: 16, y: 60, scale: 1.3, rotate: 9, opacity: 0.42 },
  { x: -14, y: 80, scale: 1.42, rotate: 13, opacity: 0.26 },
  { x: 8, y: 100, scale: 1.52, rotate: 17, opacity: 0.16 },
];

export default function GoldenCrescent() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const layer = layerRef.current;
    if (!layer) return;

    if (reduced) {
      layer.style.setProperty("--cres-x", "-16vw");
      layer.style.setProperty("--cres-y", "-4vh");
      layer.style.setProperty("--cres-scale", "0.85");
      layer.style.setProperty("--cres-rotate", "-8deg");
      layer.style.setProperty("--cres-opacity", "0.5");
      return;
    }

    const isMobile = window.innerWidth < 768;
    let raf = 0;
    let current = { progress: 0, smooth: 0 };
    let running = true;

    const measure = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      current.progress = Math.min(1, Math.max(0, scrollTop / max));
    };

    const render = () => {
      if (!running) return;

      const target = current.progress;
      current.smooth += (target - current.smooth) * 0.085;

      const p = current.smooth;
      const scaled = p * (STAGES.length - 1);
      const index = Math.min(STAGES.length - 2, Math.floor(scaled));
      const t = Math.min(1, Math.max(0, scaled - index));
      const eased = t * t * (3 - 2 * t);
      const a = STAGES[index];
      const b = STAGES[index + 1];

      const x = a.x + (b.x - a.x) * eased;
      const y = a.y + (b.y - a.y) * eased;
      const scale = (a.scale + (b.scale - a.scale) * eased) * (isMobile ? 0.72 : 1);
      const rotate = a.rotate + (b.rotate - a.rotate) * eased;
      const opacity = a.opacity + (b.opacity - a.opacity) * eased;

      layer.style.setProperty("--cres-x", `${x}vw`);
      layer.style.setProperty("--cres-y", `${y}vh`);
      layer.style.setProperty("--cres-scale", scale.toFixed(3));
      layer.style.setProperty("--cres-rotate", `${rotate.toFixed(2)}deg`);
      layer.style.setProperty("--cres-opacity", opacity.toFixed(3));

      raf = requestAnimationFrame(render);
    };

    const onScroll = () => {
      if (coarse) {
        measure();
        current.smooth = current.progress;
        const p = current.progress;
        const scaled = p * (STAGES.length - 1);
        const index = Math.min(STAGES.length - 2, Math.floor(scaled));
        const eased = 0;
        const a = STAGES[index];
        const b = STAGES[index + 1];
        const x = a.x + (b.x - a.x) * eased;
        const y = a.y + (b.y - a.y) * eased;
        const scale = (a.scale + (b.scale - a.scale) * eased) * 0.72;
        layer.style.setProperty("--cres-x", `${x}vw`);
        layer.style.setProperty("--cres-y", `${y}vh`);
        layer.style.setProperty("--cres-scale", scale.toFixed(3));
        layer.style.setProperty("--cres-rotate", `${a.rotate}deg`);
        layer.style.setProperty("--cres-opacity", a.opacity.toFixed(3));
        return;
      }
      measure();
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(render);
      else cancelAnimationFrame(raf);
    };

    measure();
    if (!coarse) raf = requestAnimationFrame(render);
    else onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    const onResize = () => {
      measure();
      if (coarse) onScroll();
    };
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        ["--cres-x" as string]: "-16vw",
        ["--cres-y" as string]: "-4vh",
        ["--cres-scale" as string]: "0.9",
        ["--cres-rotate" as string]: "-8deg",
        ["--cres-opacity" as string]: "0.9",
      }}
    >
      <div
        className="absolute"
        style={{
          left: "50%",
          top: "42%",
          transform:
            "translate3d(calc(var(--cres-x) - 50%), calc(var(--cres-y) - 42%), 0) scale(var(--cres-scale)) rotate(var(--cres-rotate))",
          transformOrigin: "center",
          opacity: "var(--cres-opacity)",
          transition: "opacity 0.4s ease",
        }}
      >
        <svg
          width="340"
          height="340"
          viewBox="0 0 200 200"
          fill="none"
          className="yawmak-crescent"
        >
          <defs>
            <radialGradient id="cresGlow" cx="50%" cy="42%" r="58%">
              <stop offset="0%" stopColor="#D4AF62" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#D4AF62" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#D4AF62" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="cresMetal" x1="20" y1="18" x2="180" y2="184" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F2E3B8" />
              <stop offset="45%" stopColor="#D4AF62" />
              <stop offset="100%" stopColor="#8D6B2D" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="86" fill="url(#cresGlow)" />
          <path
            d="M116 26C72 28 40 64 40 106c0 42 32 78 76 80 24 1.2 46-8 62-25-20 26-50 42-82 42-48 0-86-38-86-86 0-40 28-74 66-86 8-2.6 17-4 26-4.6z"
            fill="url(#cresMetal)"
          />
          <path
            d="M60 78c10-20 28-34 50-38"
            stroke="#FBF6EA"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.55"
          />
          <circle cx="152" cy="54" r="4" fill="#F2E3B8" opacity="0.8" />
          <circle cx="164" cy="92" r="2.6" fill="#D4AF62" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
}
