"use client";

import { useEffect, useState } from "react";
import { CAMPUS_LOCATIONS, N_STOPS } from "@/data/campusLocations";
import { journey, subscribeJourney } from "@/lib/journey";

type Props = {
  active: number;
  onJump: (index: number) => void;
};

/**
 * Minimal architectural-exhibition style overlay:
 *   - Brand mark (top-left)
 *   - Stop counter + location name (top-right)
 *   - Info panel for the current or hovered stop (bottom-left, glass card)
 *   - Vertical stepper (bottom-right)
 *   - Thin progress bar at the very bottom
 *
 * The panel prefers the hovered location if the user is hovering a hotspot,
 * otherwise shows the scroll-driven active stop.
 */
export default function Navigation({ active, onJump }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const unsub = subscribeJourney(() => setHover(journey.hoverIndex));
    return unsub;
  }, []);

  const shownIdx = hover ?? active;
  const loc = CAMPUS_LOCATIONS[shownIdx] ?? CAMPUS_LOCATIONS[0];
  if (!loc) return null;
  const a = loc.agenda;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 md:p-10">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-800">
            Vitality
          </div>
          <div className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.32em] text-slate-500">
            Campus · Visit
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.32em] text-slate-500">
            Stop {a.step} / 0{N_STOPS}
          </div>
          <div className="mt-0.5 text-[11px] uppercase tracking-[0.28em] text-slate-800">
            {loc.name}
          </div>
        </div>
      </div>

      {/* Info panel + stepper */}
      <div className="flex items-end justify-between gap-6">
        <div
          key={loc.id}
          className="pointer-events-auto max-w-md rounded-2xl bg-white/78 p-5 backdrop-blur-md ring-1 ring-slate-900/10 shadow-[0_10px_40px_-16px_rgba(15,23,42,0.28)] animate-[fadeUp_320ms_cubic-bezier(0.4,0,0.2,1)]"
        >
          <div className="text-[10px] uppercase tracking-[0.32em] text-slate-500">
            {a.time} · {a.host}
          </div>
          <h1 className="mt-2 font-light text-2xl leading-tight text-slate-900 md:text-3xl">
            {a.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{a.desc}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {a.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-slate-900/15 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-600"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {CAMPUS_LOCATIONS.map((l, i) => {
            const on = i === active;
            const hov = i === hover;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => onJump(i)}
                className="group flex items-center gap-2 text-right"
              >
                <span
                  className={
                    "text-[10px] uppercase tracking-[0.24em] transition-colors " +
                    (on
                      ? "text-slate-900"
                      : hov
                        ? "text-slate-800"
                        : "text-slate-400 group-hover:text-slate-700")
                  }
                >
                  {l.name}
                </span>
                <span
                  className={
                    "block rounded-full transition-all " +
                    (on
                      ? "h-2.5 w-2.5 bg-slate-900 ring-2 ring-slate-900/20"
                      : hov
                        ? "h-2 w-2 bg-slate-700"
                        : "h-1.5 w-1.5 bg-slate-400 group-hover:bg-slate-700")
                  }
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress bar at the very bottom */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-slate-900/10">
        <div
          className="h-full bg-slate-900/50 transition-[width] duration-500 ease-out"
          style={{
            width: `${((active + 0.001) / (N_STOPS - 1)) * 100}%`,
          }}
        />
      </div>

      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.32em] text-slate-500 md:hidden">
        ↓ Scroll
      </div>

      {/* Local keyframes — kept inline so no extra CSS file */}
      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(6px);
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
