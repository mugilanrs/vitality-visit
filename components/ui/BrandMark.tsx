"use client";

/**
 * PHASE 9 — top-left brand mark.
 *
 *   TCS Campus
 *
 * Kept quiet so it never competes with the architecture.
 */
export default function BrandMark() {
  return (
    <div className="pointer-events-none absolute left-6 top-6 md:left-10 md:top-10">
      <div className="text-[11px] font-semibold uppercase tracking-[0.36em] text-slate-800">
        TCS Campus
      </div>
    </div>
  );
}
