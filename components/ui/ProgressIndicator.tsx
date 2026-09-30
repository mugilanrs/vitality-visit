"use client";

import { CAMPUS_LOCATIONS, N_STOPS } from "@/data/campusLocations";

/**
 * PHASE 5 — refined horizontal journey indicator.
 *
 *   01 ── 02 ── 03 ── 04 ── 05 ── 06 ── 07
 *
 * Sits centered at the bottom of the screen, above the very-thin progress
 * hairline. Each pip highlights when it becomes the active stop. Kept
 * subtle — never dominates the composition.
 */
type Props = { active: number };

export default function ProgressIndicator({ active }: Props) {
  const progress = N_STOPS > 1 ? active / (N_STOPS - 1) : 0;

  return (
    <>
      {/* Thin hairline at the very bottom */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-slate-900/8">
        <div
          className="h-full bg-slate-900/50 transition-[width] duration-700 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Desktop-only horizontal step readout, just above the hairline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-3 hidden justify-center md:flex"
      >
        <div className="flex items-center gap-2 rounded-full border border-slate-900/8 bg-white/55 px-3 py-1.5 backdrop-blur-sm">
          {CAMPUS_LOCATIONS.map((l, i) => {
            const on = i === active;
            return (
              <div key={l.id} className="flex items-center gap-2">
                <div
                  className={
                    "flex items-center gap-1 text-[9.5px] font-mono uppercase tracking-[0.24em] transition-colors " +
                    (on ? "text-slate-900" : "text-slate-400")
                  }
                >
                  <span
                    className={
                      "block rounded-full transition-all duration-500 " +
                      (on ? "h-1.5 w-1.5 bg-slate-900" : "h-1 w-1 bg-slate-400")
                    }
                  />
                  <span>{String(i + 1).padStart(2, "0")}</span>
                </div>
                {i < N_STOPS - 1 && (
                  <span className="block h-px w-3 bg-slate-900/15" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
