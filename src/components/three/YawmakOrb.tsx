"use client";

import React, { useEffect, useRef, useState } from "react";
import { HeroArt } from "@/components/svg/YawmakArt";

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

        const core = new THREE.Mesh(
          new THREE.IcosahedronGeometry(1.32, 4),
          new THREE.MeshStandardMaterial({
            color: 0x7956c8,
            roughness: 0.34,
            metalness: 0.22,
            emissive: 0x2c1a5e,
            emissiveIntensity: 0.32,
          })
        );
        group.add(core);

        const shell = new THREE.Mesh(
          new THREE.IcosahedronGeometry(1.72, 2),
          new THREE.MeshBasicMaterial({
            color: 0xa58add,
            wireframe: true,
            transparent: true,
            opacity: 0.18,
          })
        );
        group.add(shell);

        const ringA = new THREE.Mesh(
          new THREE.TorusGeometry(2.16, 0.035, 12, 128),
          new THREE.MeshStandardMaterial({
            color: 0xa58add,
            roughness: 0.3,
            metalness: 0.35,
            transparent: true,
            opacity: 0.85,
          })
        );
        ringA.rotation.x = Math.PI / 2.35;
        group.add(ringA);

        const ringB = new THREE.Mesh(
          new THREE.TorusGeometry(2.52, 0.022, 12, 128),
          new THREE.MeshStandardMaterial({
            color: 0xe4d9f7,
            roughness: 0.4,
            metalness: 0.2,
            transparent: true,
            opacity: 0.8,
          })
        );
        ringB.rotation.x = Math.PI / 1.85;
        ringB.rotation.y = Math.PI / 6;
        group.add(ringB);

        const satellite = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 24, 24),
          new THREE.MeshStandardMaterial({ color: 0xc9b6f2, roughness: 0.28, metalness: 0.3 })
        );
        group.add(satellite);

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

          group.rotation.y += 0.0022;
          group.rotation.x = Math.sin(t * 0.32) * 0.14 + pointer.y * 0.12;
          group.rotation.z = pointer.x * 0.08;
          group.position.y = Math.sin(t * 0.7) * 0.12;

          shell.rotation.y -= 0.0032;
          shell.rotation.x += 0.0014;
          ringA.rotation.z = t * 0.16;
          ringB.rotation.z = -t * 0.12;

          satellite.position.set(
            Math.cos(t * 0.72) * 2.16,
            Math.sin(t * 0.72) * 2.16 * 0.32,
            Math.sin(t * 0.72) * 1.35
          );

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
          <HeroArt className="w-full h-full max-h-[320px]" />
        </div>
      )}
    </div>
  );
}
