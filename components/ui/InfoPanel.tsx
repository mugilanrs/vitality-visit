"use client";

import { useEffect, useRef, useState } from "react";
import { CAMPUS_LOCATIONS, N_STOPS } from "@/data/campusLocations";
import { journey } from "@/lib/journey";

/**
 * PHASE 5 — location info panel.
 *
 * Compact, sits bottom-left, never covers the architecture. Entry:
 *   opacity 0 + translateY(8px) → opacity 1 + translateY(0)
 * Exit: reverse. Framer Motion / GSAP not required — CSS transitions with
 * `key` swap are sufficient.
 */
type Props = { index: number };

export default function InfoPanel({ index }: Props) {
  const loc = CAMPUS_LOCATIONS[index] ?? CAMPUS_LOCATIONS[0];
  const [visible, setVisible] = useState(false);
  const lastIndex = useRef<number | null>(null);

  // On stop change: fade out → swap → fade in.
  useEffect(() => {
    if (lastIndex.current === index) return;
    setVisible(false);
    const t = window.setTimeout(() => {
      lastIndex.current = index;
      setVisible(true);
    }, journey.reducedMotion ? 0 : 150);
    return () => window.clearTimeout(t);
  }, [index]);

  const a = loc.agenda;

  return (
    <div
      className="pointer-events-auto max-w-md"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition:
          "opacity 380ms cubic-bezier(0.4,0,0.2,1), transform 380ms cubic-bezier(0.4,0,0.2,1)",
        willChange: "opacity, transform",
      }}
    >
      <div className="rounded-2xl bg-white/78 p-5 backdrop-blur-md ring-1 ring-slate-900/10 shadow-[0_10px_40px_-16px_rgba(15,23,42,0.28)]">
        <div className="flex items-baseline justify-between gap-4">
          <div className="text-[10px] uppercase tracking-[0.34em] text-slate-500">
            Location
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-400">
            {String(index + 1).padStart(2, "0")} / {String(N_STOPS).padStart(2, "0")}
          </div>
        </div>

        <h1 className="mt-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-900">
          {loc.name}
        </h1>

        <div className="mt-3 text-[10px] uppercase tracking-[0.28em] text-slate-500">
          {a.time} · {a.host}
        </div>

        <h2 className="mt-1 font-light text-2xl leading-tight text-slate-900 md:text-[26px]">
          {a.title}
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {loc.description}
        </p>

        {loc.statistics && loc.statistics.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-900/10 pt-3">
            {loc.statistics.map((s) => (
              <div key={s.label}>
                <div className="text-[9px] uppercase tracking-[0.28em] text-slate-500">
                  {s.label}
                </div>
                <div className="mt-0.5 text-sm text-slate-900">{s.value}</div>
              </div>
            ))}
          </div>
        )}

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
    </div>
  );
}
