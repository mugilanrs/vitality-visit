"use client";

import { useEffect, useState } from "react";

/**
 * PHASE 6 — cinematic loading overlay.
 *
 *   VITALITY
 *   CAMPUS
 *
 *   LOADING EXPERIENCE   ─── (small progress underline)
 *
 * Fades out after the initial reveal window. Deliberately short —
 * about 1200ms — the campus itself carries the reveal after that.
 */
export default function LoadingOverlay() {
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start fade shortly after mount so the canvas has a moment to warm up.
    const startFade = window.setTimeout(() => setFading(true), 900);
    const removeAfter = window.setTimeout(() => setGone(true), 1600);
    return () => {
      window.clearTimeout(startFade);
      window.clearTimeout(removeAfter);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background:
          "linear-gradient(180deg, #f3f5f8 0%, #eaf0f6 55%, #e2e8ee 100%)",
        opacity: fading ? 0 : 1,
        transition: "opacity 680ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div className="flex flex-col items-center">
        <div className="text-[10px] uppercase tracking-[0.42em] text-slate-500">
          Vitality
        </div>
        <div className="mt-1 text-3xl font-light uppercase tracking-[0.18em] text-slate-900">
          Campus
        </div>

        <div className="mt-8 flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.34em] text-slate-500">
            Loading Experience
          </span>
          <span
            className="block h-px w-16 overflow-hidden bg-slate-900/12"
          >
            <span
              className="block h-full bg-slate-900/60"
              style={{
                width: "40%",
                animation: "loadBar 1200ms ease-in-out infinite",
              }}
            />
          </span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes loadBar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(280%);
          }
        }
      `}</style>
    </div>
  );
}
