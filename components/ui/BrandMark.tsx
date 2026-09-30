"use client";

/**
 * PHASE 9 — top-left brand mark.
 *
 *   TCS Campus
 *
 * Kept quiet so it never competes with the architecture.
 *
 * PHASE 10 (mobile correction):
 *   - Respects env(safe-area-inset-*) so the mark doesn't hide behind an iOS
 *     notch or an Android status area.
 *   - Tighter typography on small screens so it stops consuming a large
 *     portion of the viewport.
 */
export default function BrandMark() {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        top: "max(0.75rem, env(safe-area-inset-top))",
        left: "max(1rem, env(safe-area-inset-left))",
      }}
    >
      <div
        className="text-[10px] font-semibold uppercase text-slate-900 md:text-[11px]"
        style={{
          letterSpacing: "0.24em",
          textShadow: "0 1px 8px rgba(234,240,246,0.9)",
        }}
      >
        TCS Campus
      </div>
    </div>
  );
}
