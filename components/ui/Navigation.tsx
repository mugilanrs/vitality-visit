"use client";

import { CAMPUS_LOCATIONS, N_STOPS } from "@/data/campusLocations";

type Props = {
  active: number;
  onJump: (index: number) => void;
};

/**
 * Light-theme cinematic overlay for the daytime architectural view.
 * Individual regions opt into pointer-events; the underlying scroll container
 * still receives wheel/touch scroll.
 */
export default function Navigation({ active, onJump }: Props) {
  const loc = CAMPUS_LOCATIONS[active] ?? CAMPUS_LOCATIONS[0];
  if (!loc) return null;
  const a = loc.agenda;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 md:p-10">
      {/* Top row: brand + section counter */}
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

      {/* Bottom row: agenda card + stepper */}
      <div className="flex items-end justify-between gap-6">
        <div className="pointer-events-auto max-w-md rounded-2xl bg-white/75 p-5 backdrop-blur-md ring-1 ring-slate-900/10 shadow-[0_10px_40px_-16px_rgba(15,23,42,0.25)]">
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

        {/* Stepper on the right */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {CAMPUS_LOCATIONS.map((l, i) => {
            const on = i === active;
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
                      : "h-1.5 w-1.5 bg-slate-400 group-hover:bg-slate-700")
                  }
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.32em] text-slate-500 md:hidden">
        ↓ Scroll
      </div>
    </div>
  );
}
