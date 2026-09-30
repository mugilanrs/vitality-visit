"use client";

import { useEffect, useState } from "react";
import { CAMPUS_LOCATIONS, N_STOPS } from "@/data/campusLocations";
import { journey, subscribeJourney } from "@/lib/journey";
import InfoPanel from "./InfoPanel";
import ProgressIndicator from "./ProgressIndicator";
import LocationLabel from "./LocationLabel";

type Props = {
  active: number;
  onJump: (index: number) => void;
};

/**
 * PHASE 5/6 — architectural-exhibition overlay.
 *
 *   Top-left      Brand mark
 *   Top-right     Stop counter + current location name (LocationLabel)
 *   Bottom-left   InfoPanel — the descriptive card, animated on stop change
 *   Bottom-right  Journey ladder — vertical dot stepper, keyboard-accessible
 *   Bottom-center ProgressIndicator — horizontal 01 ── 02 ── … ── 07 with
 *                 the current stop highlighted
 *
 * All UI stays around the edges so the architecture is never covered.
 */
export default function Navigation({ active, onJump }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    return subscribeJourney(() => {
      setHover(journey.hoverIndex);
      // clone so React sees a new reference
      setVisited(new Set(journey.visited));
    }, "change");
  }, []);

  const shownIdx = hover ?? active;
  const loc = CAMPUS_LOCATIONS[shownIdx] ?? CAMPUS_LOCATIONS[0];
  if (!loc) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 md:p-10">
      {/* Top row — brand + location label */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-800">
            Vitality
          </div>
          <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.36em] text-slate-500">
            Campus · Visit
          </div>
        </div>
        <LocationLabel index={shownIdx} />
      </div>

      {/* Middle-bottom — info panel + journey ladder */}
      <div className="flex items-end justify-between gap-6">
        <InfoPanel index={shownIdx} />

        <nav
          aria-label="Campus locations"
          className="pointer-events-auto flex flex-col items-end gap-2"
        >
          {CAMPUS_LOCATIONS.map((l, i) => {
            const on = i === active;
            const hov = i === hover;
            const been = visited.has(i);
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => onJump(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover((v) => (v === i ? null : v))}
                aria-current={on ? "true" : undefined}
                aria-label={`Go to ${l.name}`}
                className="group flex items-center gap-3 text-right focus:outline-none"
              >
                <span
                  className={
                    "text-[10px] uppercase tracking-[0.28em] transition-colors " +
                    (on
                      ? "text-slate-900"
                      : hov
                        ? "text-slate-800"
                        : been
                          ? "text-slate-500 group-hover:text-slate-700"
                          : "text-slate-400 group-hover:text-slate-700")
                  }
                >
                  <span
                    className="mr-2 text-slate-400"
                    style={{ opacity: on ? 0.9 : 0.55 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {l.shortName}
                </span>
                <span
                  className={
                    "block rounded-full transition-all duration-300 " +
                    (on
                      ? "h-2.5 w-2.5 bg-slate-900 ring-2 ring-slate-900/15"
                      : hov
                        ? "h-2 w-2 bg-slate-800"
                        : been
                          ? "h-1.5 w-1.5 bg-slate-500 group-hover:bg-slate-800"
                          : "h-1 w-1 bg-slate-400 group-hover:bg-slate-800")
                  }
                />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Refined horizontal progress + step readout */}
      <ProgressIndicator active={active} />

      {/* Mobile-only nudge */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.32em] text-slate-500 md:hidden">
        Swipe ↕ · Tap markers
      </div>
    </div>
  );
}

// Local usage — export for type reference elsewhere.
export type { Props as NavigationProps };
export const NAV_TOTAL = N_STOPS;
