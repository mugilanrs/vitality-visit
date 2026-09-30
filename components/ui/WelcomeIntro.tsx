"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { setWelcome, journey } from "@/lib/journey";

/**
 * PHASE 7 — cloud welcome opening.
 *
 *   WELCOME TO TCS
 *   Enter the campus to know your agenda
 *   [ Enter Campus ]
 *
 * On click, GSAP timeline: title fades up, the four cloud layers drift
 * outward and dissolve, the whole overlay unmounts. Underneath, the
 * cinematic camera opening (already running) finishes settling into the
 * overview frame.
 *
 * If prefers-reduced-motion is set the exit is a straight cross-fade.
 */
export default function WelcomeIntro() {
  const [dismissed, setDismissed] = useState(false);
  const [gone, setGone] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const cloudRefs = useRef<HTMLDivElement[]>([]);

  const setCloud = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cloudRefs.current[i] = el;
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
      tl.to(rootRef.current, { opacity: 0, duration: 0.3, ease: "power1.out" });
      return;
    }

    tl.to(
      titleRef.current,
      { y: -30, opacity: 0, duration: 0.5, ease: "power2.in" },
      0,
    );

    cloudRefs.current.forEach((el, i) => {
      const dir = i % 2 === 0 ? -1 : 1;
      const dz = i % 3 === 0 ? -220 : 220;
      tl.to(
        el,
        {
          x: `+=${dir * 320 + dz}`,
          y: `+=${(i - 2) * 40 - 80}`,
          scale: 1.35 + i * 0.1,
          opacity: 0,
          filter: "blur(30px)",
          duration: 1.1,
          ease: "power2.inOut",
        },
        0.05 + i * 0.06,
      );
    });

    tl.to(
      rootRef.current,
      { opacity: 0, duration: 0.55, ease: "power1.out" },
      0.55,
    );
  };

  useEffect(() => {
    // Ensure welcome flag is set on mount so the camera keeps still
    setWelcome(true);
  }, []);

  if (gone) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #cfe0f1 0%, #d9e4f0 40%, #e3ebf4 70%, #ecf1f7 100%)",
      }}
    >
      {/* Cloud layers */}
      <div
        ref={setCloud(0)}
        aria-hidden
        className="absolute"
        style={{ ...cloudStyle(720, 260, "#ffffff", 0.85), top: "18%", left: "-6%" }}
      />
      <div
        ref={setCloud(1)}
        aria-hidden
        className="absolute"
        style={{ ...cloudStyle(560, 200, "#f2f7fc", 0.9), top: "44%", right: "-8%" }}
      />
      <div
        ref={setCloud(2)}
        aria-hidden
        className="absolute"
        style={{ ...cloudStyle(880, 300, "#ffffff", 0.7), bottom: "-8%", left: "10%" }}
      />
      <div
        ref={setCloud(3)}
        aria-hidden
        className="absolute"
        style={{ ...cloudStyle(420, 160, "#eef4fa", 0.85), top: "8%", right: "12%" }}
      />
      <div
        ref={setCloud(4)}
        aria-hidden
        className="absolute"
        style={{ ...cloudStyle(340, 130, "#ffffff", 0.75), bottom: "22%", right: "-2%" }}
      />

      {/* Title */}
      <div
        ref={titleRef}
        className="relative flex flex-col items-center px-6 text-center"
        style={{ animation: "floatIn 1000ms cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        <div className="text-[10px] uppercase tracking-[0.42em] text-slate-500">
          Tata Consultancy Services
        </div>
        <div
          className="mt-3 text-6xl font-extralight uppercase tracking-[0.18em] text-slate-900 md:text-7xl"
          style={{ textShadow: "0 3px 24px rgba(255,255,255,0.7)" }}
        >
          Welcome to TCS
        </div>
        <div className="mt-4 max-w-lg text-[13px] uppercase tracking-[0.28em] text-slate-600">
          Enter the campus to know your agenda
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="pointer-events-auto mt-10 rounded-full border border-slate-900/25 bg-white/80 px-7 py-3 text-[11px] uppercase tracking-[0.32em] text-slate-900 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.35)] backdrop-blur-md transition-all hover:bg-white hover:shadow-[0_18px_50px_-14px_rgba(15,23,42,0.45)] hover:-translate-y-0.5 focus:outline-none"
        >
          Enter Campus  →
        </button>

        <div className="mt-6 text-[9.5px] uppercase tracking-[0.34em] text-slate-500">
          A digital architectural exhibition
        </div>
      </div>

      <style jsx global>{`
        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// A soft blurred blob that reads as a cloud shape.
function cloudStyle(
  w: number,
  h: number,
  color: string,
  opacity: number,
): React.CSSProperties {
  return {
    width: `${w}px`,
    height: `${h}px`,
    borderRadius: "50%",
    background: `radial-gradient(closest-side, ${color} 0%, ${color} 40%, rgba(255,255,255,0) 75%)`,
    filter: "blur(24px)",
    opacity,
    pointerEvents: "none",
    willChange: "transform, opacity, filter",
  };
}
