"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { setWelcome, journey } from "@/lib/journey";

/**
 * PHASE 8 — cinematic cloud reveal.
 *
 * The previous cloud intro was too subtle to read as clouds. This one is
 * unmistakably a bank of clouds that DISPERSES:
 *
 *   - 9 large, soft, layered cloud shapes cover most of the viewport
 *   - The title and CTA sit inside the cloud mass, softly illuminated
 *   - On CTA click: a GSAP timeline drifts each cloud outward in a fanned
 *     direction, scales it up, blurs it, and fades it, while the underlying
 *     campus dissolves in
 *   - Behind the clouds is a soft daylight gradient sky
 *
 * Reduced motion: single fade with no drift.
 */
export default function WelcomeIntro() {
  const [dismissed, setDismissed] = useState(false);
  const [gone, setGone] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const cloudRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setCloud = (i: number) => (el: HTMLDivElement | null) => {
    cloudRefs.current[i] = el;
  };

  const dismiss = () => {
    if (dismissed) return;
    setDismissed(true);

    const reduce = journey.reducedMotion;
    const tl = gsap.timeline({
      onComplete: () => {
        setWelcome(false);
        setGone(true);
      },
    });

    if (reduce) {
      tl.to(rootRef.current, { opacity: 0, duration: 0.4, ease: "power1.out" });
      return;
    }

    // Title lifts and fades first — reads as the sky pulling the user in
    tl.to(
      titleRef.current,
      { y: -60, opacity: 0, scale: 0.94, duration: 0.65, ease: "power2.in" },
      0,
    );

    // Each cloud gets its own destination — the ensemble fans open.
    cloudRefs.current.forEach((el, i) => {
      if (!el) return;
      const dir = CLOUDS[i].fan; // {x,y} unit direction to fly out
      const dist = 600 + Math.random() * 200;
      tl.to(
        el,
        {
          x: `+=${dir.x * dist}`,
          y: `+=${dir.y * dist}`,
          scale: 1.6 + i * 0.05,
          opacity: 0,
          rotation: dir.x > 0 ? 6 : -6,
          filter: "blur(48px)",
          duration: 1.6,
          ease: "power2.inOut",
        },
        0.15 + i * 0.05,
      );
    });

    // Background sky fades to reveal the campus
    tl.to(
      rootRef.current,
      { opacity: 0, duration: 0.8, ease: "power1.out" },
      1.0,
    );
  };

  useEffect(() => {
    setWelcome(true);
  }, []);

  if (gone) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #c5d8ec 0%, #d6e2ef 35%, #e4ecf5 65%, #edf2f8 100%)",
      }}
    >
      {/* Cloud layers — arranged like a real bank of clouds in the foreground */}
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          ref={setCloud(i)}
          aria-hidden
          className="absolute"
          style={{
            top: c.top,
            left: c.left,
            right: c.right,
            bottom: c.bottom,
            zIndex: c.z,
            width: c.w,
            height: c.h,
            filter: `blur(${c.blur}px)`,
            willChange: "transform, opacity, filter",
            pointerEvents: "none",
          }}
        >
          <CloudShape opacity={c.opacity} tone={c.tone} />
        </div>
      ))}

      {/* Title / CTA — sits above the cloud layers */}
      <div
        ref={titleRef}
        className="relative z-30 flex flex-col items-center px-6 text-center"
        style={{ animation: "welcomeFloat 900ms cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        <div
          className="text-[10px] uppercase tracking-[0.44em] text-slate-600"
          style={{ textShadow: "0 2px 18px rgba(255,255,255,0.85)" }}
        >
          Tata Consultancy Services
        </div>
        <div
          className="mt-3 text-6xl font-extralight uppercase tracking-[0.18em] text-slate-900 md:text-7xl"
          style={{
            textShadow:
              "0 4px 30px rgba(255,255,255,0.9), 0 0 60px rgba(255,214,230,0.35)",
          }}
        >
          Welcome to TCS
        </div>
        <div
          className="mt-5 max-w-lg text-[13px] uppercase tracking-[0.32em] text-slate-700"
          style={{ textShadow: "0 2px 12px rgba(255,255,255,0.85)" }}
        >
          Enter the campus to know your agenda
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="pointer-events-auto mt-12 rounded-full border border-white/70 px-8 py-3.5 text-[11px] uppercase tracking-[0.34em] text-slate-900 transition-all hover:-translate-y-0.5 focus:outline-none"
          style={{
            background:
              "linear-gradient(140deg, rgba(255,255,255,0.85) 0%, rgba(255,232,240,0.75) 100%)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            boxShadow:
              "0 14px 40px -14px rgba(15,23,42,0.35), 0 0 30px rgba(255,182,203,0.4), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}
        >
          Enter Campus →
        </button>

        <div className="mt-6 text-[9.5px] uppercase tracking-[0.34em] text-slate-500">
          A digital architectural exhibition
        </div>
      </div>

      <style jsx global>{`
        @keyframes welcomeFloat {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes welcomeDrift {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(6px, -3px, 0);
          }
        }
      `}</style>
    </div>
  );
}

// ---------------- Cloud shape ----------------

/**
 * A single soft cloud, drawn as a stack of overlapping radial-gradient blobs
 * inside a container the size of the cloud. Reads as a real cloud silhouette
 * rather than a single blurred circle.
 */
function CloudShape({
  opacity,
  tone,
}: {
  opacity: number;
  tone: string;
}) {
  const blob = (
    left: string,
    top: string,
    w: string,
    h: string,
    o: number,
  ): React.CSSProperties => ({
    position: "absolute",
    left,
    top,
    width: w,
    height: h,
    background: `radial-gradient(closest-side, ${tone} 0%, ${tone} 45%, rgba(255,255,255,0) 78%)`,
    opacity: o,
    borderRadius: "50%",
  });
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", opacity }}>
      <div style={blob("10%", "20%", "70%", "80%", 1.0)} />
      <div style={blob("0%", "35%", "55%", "65%", 0.95)} />
      <div style={blob("40%", "10%", "60%", "70%", 0.9)} />
      <div style={blob("30%", "40%", "70%", "60%", 0.85)} />
      <div style={blob("55%", "25%", "45%", "65%", 0.95)} />
      <div style={blob("20%", "55%", "60%", "45%", 0.9)} />
    </div>
  );
}

// ---------------- Cloud layout ----------------

type CloudSpec = {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  w: string;
  h: string;
  opacity: number;
  blur: number;
  tone: string;
  z: number;
  /** direction the cloud fans away toward on dismiss */
  fan: { x: number; y: number };
};

const CLOUDS: CloudSpec[] = [
  // Far background — huge, softest, deepest blur
  { top: "-10%", left: "-15%", w: "80vw", h: "70vh", opacity: 0.85, blur: 30, tone: "#ffffff", z: 5, fan: { x: -1, y: -0.6 } },
  { top: "-8%", right: "-15%", w: "80vw", h: "70vh", opacity: 0.82, blur: 32, tone: "#f5f8fc", z: 6, fan: { x: 1, y: -0.5 } },

  // Mid — larger and denser, near screen edges
  { top: "10%", left: "-12%", w: "60vw", h: "55vh", opacity: 0.92, blur: 20, tone: "#ffffff", z: 10, fan: { x: -1, y: 0.2 } },
  { top: "18%", right: "-10%", w: "62vw", h: "58vh", opacity: 0.9, blur: 22, tone: "#fdfefd", z: 11, fan: { x: 1, y: 0.1 } },
  { bottom: "-5%", left: "5%", w: "60vw", h: "55vh", opacity: 0.88, blur: 24, tone: "#ffffff", z: 9, fan: { x: -0.6, y: 1 } },
  { bottom: "-8%", right: "0%", w: "60vw", h: "58vh", opacity: 0.9, blur: 24, tone: "#fbfcfe", z: 10, fan: { x: 0.6, y: 1 } },

  // Foreground — smaller, denser, sharper edges so they read as close clouds
  { top: "5%", left: "20%", w: "36vw", h: "35vh", opacity: 0.95, blur: 12, tone: "#ffffff", z: 20, fan: { x: -0.5, y: -1 } },
  { top: "8%", right: "18%", w: "36vw", h: "35vh", opacity: 0.95, blur: 12, tone: "#ffffff", z: 20, fan: { x: 0.5, y: -1 } },
  { bottom: "5%", left: "35%", w: "40vw", h: "35vh", opacity: 0.92, blur: 14, tone: "#ffffff", z: 22, fan: { x: 0, y: 1 } },

  // Pink accent cloud — sits behind the title, subtle
  { top: "28%", left: "30%", w: "42vw", h: "35vh", opacity: 0.4, blur: 30, tone: "#ffe0eb", z: 25, fan: { x: 0, y: -0.6 } },
];
