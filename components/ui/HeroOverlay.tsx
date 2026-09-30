"use client";

import { useEffect, useState } from "react";
import { subscribeJourney, journey } from "@/lib/journey";

/**
 * PHASE 6 — hero title overlay for the overview state.
 *
 *       VITALITY
 *
 *   Explore the campus ↓
 *
 * Visible only when the user is in overview mode. Once they start scrolling,
 * it fades out and the InfoPanel takes over.
 */
export default function HeroOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const apply = () => setVisible(journey.overview);
    apply();
    return subscribeJourney(apply, "overview");
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-8px)",
        transition:
          "opacity 620ms cubic-bezier(0.4,0,0.2,1), transform 620ms cubic-bezier(0.4,0,0.2,1)",
      }}
      aria-hidden={!visible}
    >
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-[0.42em] text-slate-500">
          A digital architectural exhibition
        </div>
        <div className="mt-3 text-5xl font-extralight uppercase tracking-[0.18em] text-slate-900 md:text-6xl">
          Vitality
        </div>
        <div className="mt-2 text-[11px] uppercase tracking-[0.38em] text-slate-600">
          Campus · 07 stops
        </div>

        <div className="mt-10 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.34em] text-slate-600">
          <span>Explore the campus</span>
          <span className="inline-flex items-center gap-1">
            <span
              className="inline-block h-3 w-px bg-slate-500"
              style={{ animation: "arrowPulse 1600ms ease-in-out infinite" }}
            />
            <span>↓</span>
          </span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes arrowPulse {
          0%,
          100% {
            opacity: 0.35;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(2px);
          }
        }
      `}</style>
    </div>
  );
}
