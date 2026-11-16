"use client";

import React, { useEffect, useRef, useState } from "react";

export default function YawmakOrb({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const node = mountRef.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const fallback = window.setTimeout(() => setUseFallback(true), 0);
      return () => window.clearTimeout(fallback);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setArmed(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px" }
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!armed || useFallback) return;
    const container = mountRef.current;
    if (!container) return;

    let disposed = false;
    let renderer: import("three").WebGLRenderer | null = null;
    let frame = 0;

    import("three")
      .then((THREE) => {
        if (disposed || !container) return;

        try {
          renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        } catch {
          setUseFallback(true);
          return;
        }

        const isMobile = window.innerWidth < 768;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.innerHTML = "";
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          42,
          container.clientWidth / Math.max(1, container.clientHeight),
          0.1,
          60
        );
        camera.position.set(0, 0.2, 6.4);

        scene.add(new THREE.AmbientLight(0xf3effc, 1.35));
        const key = new THREE.DirectionalLight(0xffffff, 2.1);
        key.position.set(3, 4, 5);
        scene.add(key);
        const rim = new THREE.PointLight(0x7956c8, 22, 22);
        rim.position.set(-3.4, -1.6, 3.2);
        scene.add(rim);
        const fill = new THREE.PointLight(0xa58add, 12, 20);
        fill.position.set(2.6, -2.4, -2);
        scene.add(fill);

        const group = new THREE.Group();
        scene.add(group);

        const accentHex = getComputedStyle(document.documentElement).getPropertyValue("--yawmak-primary").trim() || "#168653";
        const accent = new THREE.Color(accentHex);
        const accentSoft = accent.clone().lerp(new THREE.Color(0xffffff), 0.48);
        const moonShape = new THREE.Shape();
        moonShape.moveTo(0.42, 1.23);
        moonShape.quadraticCurveTo(-1.34, 0.04, 0.42, -1.23);
        moonShape.quadraticCurveTo(-0.28, 0.02, 0.42, 1.23);
        const moonGeometry = new THREE.ExtrudeGeometry(moonShape, {
          depth: 0.34,
          bevelEnabled: true,
          bevelSegments: 5,
          steps: 1,
          bevelSize: 0.075,
          bevelThickness: 0.075,
          curveSegments: 48,
        });
        moonGeometry.center();
        const moon = new THREE.Mesh(
          moonGeometry,
          new THREE.MeshPhysicalMaterial({
            color: accentSoft,
            metalness: 0.48,
            roughness: 0.38,
            clearcoat: 0.82,
            clearcoatRoughness: 0.22,
            emissive: accent,
            emissiveIntensity: 0.11,
          })
        );
        moon.rotation.z = -0.22;
        group.add(moon);

        const craterMaterial = new THREE.MeshStandardMaterial({
          color: accent,
          roughness: 0.88,
          metalness: 0.08,
          transparent: true,
          opacity: 0.22,
        });
        const craters = [
          [-0.42, 0.56, 0.13], [-0.72, 0.04, 0.085], [-0.38, -0.58, 0.17],
          [-0.02, 0.9, 0.055], [-0.02, -0.94, 0.07], [-0.92, -0.34, 0.045],
        ];
        craters.forEach(([x, y, r]) => {
          const crater = new THREE.Mesh(new THREE.CircleGeometry(r, 32), craterMaterial);
          crater.position.set(x, y, 0.235);
          group.add(crater);
        });

        const halo = new THREE.Mesh(
          new THREE.TorusGeometry(1.88, 0.012, 8, 160),
          new THREE.MeshBasicMaterial({ color: accentSoft, transparent: true, opacity: 0.42 })
        );
        halo.rotation.x = Math.PI * 0.28;
        halo.rotation.y = -0.18;
        group.add(halo);

        const orbit = new THREE.Mesh(
          new THREE.TorusGeometry(1.62, 0.022, 10, 128),
          new THREE.MeshStandardMaterial({ color: accent, metalness: 0.7, roughness: 0.3, transparent: true, opacity: 0.62 })
        );
        orbit.rotation.set(0.92, 0.28, -0.35);
        group.add(orbit);

        const starMaterial = new THREE.MeshBasicMaterial({ color: accentSoft });
        const star = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 20), starMaterial);
        group.add(star);

        const particleCount = isMobile ? 70 : 150;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 9;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
        }
        const pointsGeo = new THREE.BufferGeometry();
        pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const particles = new THREE.Points(
          pointsGeo,
          new THREE.PointsMaterial({
            color: 0xc9b6f2,
            size: isMobile ? 0.055 : 0.045,
            transparent: true,
            opacity: 0.62,
          })
        );
        scene.add(particles);

        const pointer = { x: 0, y: 0 };
        const onPointerMove = (event: PointerEvent) => {
          const rect = container.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        };
        container.addEventListener("pointermove", onPointerMove);

        let paused = false;
        const onVisibility = () => {
          paused = document.hidden;
        };
        document.addEventListener("visibilitychange", onVisibility);

        const onResize = () => {
          if (!container || !renderer) return;
          camera.aspect = container.clientWidth / Math.max(1, container.clientHeight);
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
        };
        window.addEventListener("resize", onResize);

        const clock = new THREE.Clock();
        const tick = () => {
          frame = requestAnimationFrame(tick);
          if (paused) return;
          const t = clock.getElapsedTime();

          group.rotation.y = Math.sin(t * 0.22) * 0.12 + pointer.x * 0.08;
          group.rotation.x = Math.sin(t * 0.32) * 0.12 + pointer.y * 0.1;
          group.rotation.z = -0.22 + Math.sin(t * 0.18) * 0.035;
          group.position.y = Math.sin(t * 0.7) * 0.12;
          orbit.rotation.z = -0.35 + t * 0.12;
          halo.rotation.z = t * 0.035;
          star.position.set(Math.cos(t * 0.62) * 1.7, Math.sin(t * 0.62) * 0.72, Math.sin(t * 0.62) * 0.6);
          particles.rotation.y = t * 0.035;

          camera.position.x += (pointer.x * 0.32 - camera.position.x) * 0.05;
          camera.position.y += (0.2 - pointer.y * 0.22 - camera.position.y) * 0.05;
          camera.lookAt(0, 0, 0);

          renderer?.render(scene, camera);
        };
        tick();
      })
      .catch(() => setUseFallback(true));

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      renderer?.dispose();
    };
  }, [armed, useFallback]);

  return (
    <div className={`relative ${className}`.trim()}>
      <div
        ref={mountRef}
        className="w-full h-full min-h-[240px]"
        aria-hidden="true"
        style={{ opacity: armed && !useFallback ? 1 : 0, transition: "opacity 0.6s ease" }}
      />
      {(!armed || useFallback) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 420 300" className="w-full h-full max-h-[320px]" role="img" aria-label="هلال ثلاثي الأبعاد" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ymMoonMetal" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="var(--yawmak-primary-soft)" />
                <stop offset=".48" stopColor="var(--yawmak-primary)" />
                <stop offset="1" stopColor="var(--yawmak-text-muted)" />
              </linearGradient>
              <filter id="ymMoonShadow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="9" />
              </filter>
            </defs>
            <ellipse cx="205" cy="253" rx="100" ry="13" fill="var(--yawmak-primary)" opacity=".14" filter="url(#ymMoonShadow)" />
            <g transform="translate(205 145) rotate(-18)">
              <path d="M38 -104C-36 -105 -94 -47 -94 25C-94 94 -34 143 31 132C-18 98 -34 49 -25 4C-16 -43 4 -79 38 -104Z" fill="url(#ymMoonMetal)" stroke="var(--yawmak-primary-soft)" strokeWidth="3" />
              <path d="M-53 -46C-69 -14 -66 29 -45 59" fill="none" stroke="white" strokeOpacity=".35" strokeWidth="7" strokeLinecap="round" />
              <circle cx="-48" cy="-12" r="8" fill="var(--yawmak-text)" opacity=".12" />
              <circle cx="-28" cy="69" r="11" fill="var(--yawmak-text)" opacity=".1" />
            </g>
            <ellipse cx="205" cy="145" rx="139" ry="48" fill="none" stroke="var(--yawmak-primary)" strokeWidth="2" opacity=".35" transform="rotate(-16 205 145)" />
            <circle cx="310" cy="72" r="4" fill="var(--yawmak-primary-soft)" />
            <circle cx="92" cy="102" r="3" fill="var(--yawmak-primary)" opacity=".65" />
          </svg>
        </div>
      )}
    </div>
  );
}
