"use client";

/**
 * PHASE 7 — tiny top-left brand mark. Kept quiet so it never competes with
 * the pink glass agenda tiles or the architecture.
 */
export default function BrandMark() {
  return (
    <div className="pointer-events-none absolute left-6 top-6 md:left-10 md:top-10">
      <div className="text-[10px] font-semibold uppercase tracking-[0.42em] text-slate-800">
        TCS
      </div>
      <div className="mt-0.5 text-[9.5px] font-medium uppercase tracking-[0.36em] text-slate-500">
        Vitality · Campus
      </div>
    </div>
  );
}
