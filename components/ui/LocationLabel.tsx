"use client";

import { useEffect, useRef, useState } from "react";
import { CAMPUS_LOCATIONS, N_STOPS } from "@/data/campusLocations";
import { journey } from "@/lib/journey";

/**
 * PHASE 5 — the tiny stop counter + location name in the top-right corner.
 * Fades out → swaps → fades in on stop change so it stays visually connected
 * to the camera transition.
 */
type Props = { index: number };

export default function LocationLabel({ index }: Props) {
  const loc = CAMPUS_LOCATIONS[index] ?? CAMPUS_LOCATIONS[0];
  const [visible, setVisible] = useState(true);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (last.current === index) return;
    setVisible(false);
    const t = window.setTimeout(() => {
      last.current = index;
      setVisible(true);
    }, journey.reducedMotion ? 0 : 120);
    return () => window.clearTimeout(t);
  }, [index]);

  return (
    <div
      className="text-right"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-4px)",
        transition:
          "opacity 300ms cubic-bezier(0.4,0,0.2,1), transform 300ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div className="text-[10px] uppercase tracking-[0.34em] text-slate-500">
        Stop{" "}
        <span className="text-slate-800">
          {String(index + 1).padStart(2, "0")}
        </span>{" "}
        / {String(N_STOPS).padStart(2, "0")}
      </div>
      <div className="mt-0.5 text-[11px] uppercase tracking-[0.3em] text-slate-800">
        {loc.name}
      </div>
    </div>
  );
}
