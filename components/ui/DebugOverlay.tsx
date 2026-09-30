"use client";

import { useEffect, useRef, useState } from "react";
import { CAMPUS_LOCATIONS } from "@/data/campusLocations";
import { journey, subscribeJourney } from "@/lib/journey";
import { detectQuality } from "@/lib/quality";

/**
 * PHASE 6 — dev-only debug overlay.
 *
 * Renders only when `process.env.NODE_ENV !== "production"`. Toggle with
 * Shift + D so it doesn't clutter the composition unless we want it.
 *
 * Shows: active stop, progress, mode, hover, camera target, FPS.
 */
export default function DebugOverlay() {
  const [visible, setVisible] = useState(false);
  const [fps, setFps] = useState(0);
  const [snap, setSnap] = useState({
    activeIndex: 0,
    progress: 0,
    mode: "idle" as string,
    hover: null as number | null,
  });
  const rafRef = useRef<number | null>(null);
  const framesRef = useRef({ count: 0, last: 0 });

  // Only mount in dev
  const isDev =
    typeof process !== "undefined" &&
    process.env?.NODE_ENV !== "production";

  useEffect(() => {
    if (!isDev) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "D" && e.shiftKey) setVisible((v) => !v);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDev]);

  useEffect(() => {
    if (!isDev || !visible) return;
    const unsub = subscribeJourney(() => {
      setSnap({
        activeIndex: journey.activeIndex,
        progress: journey.progress,
        mode: journey.mode,
        hover: journey.hoverIndex,
      });
    }, "change");

    function tick(t: number) {
      const f = framesRef.current;
      f.count++;
      if (f.last === 0) f.last = t;
      if (t - f.last >= 500) {
        setFps(Math.round((f.count * 1000) / (t - f.last)));
        f.count = 0;
        f.last = t;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      unsub();
    };
  }, [isDev, visible]);

  if (!isDev || !visible) return null;

  const loc = CAMPUS_LOCATIONS[snap.activeIndex];
  const q = detectQuality();

  return (
    <div
      className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 rounded-lg bg-slate-900/80 px-3 py-2 font-mono text-[10px] leading-tight text-slate-100 shadow-xl"
      style={{ zIndex: 60 }}
    >
      <div className="mb-1 text-slate-400">DEBUG · Shift+D to toggle</div>
      <div>FPS: {fps}</div>
      <div>Quality: {q.tier}</div>
      <div>Mode: {snap.mode}</div>
      <div>
        Active: {snap.activeIndex} — {loc?.name}
      </div>
      <div>Hover: {snap.hover ?? "—"}</div>
      <div>Progress: {snap.progress.toFixed(3)}</div>
      <div className="mt-1 text-slate-400">Target</div>
      <div>
        [{loc?.camera.target?.[0].toFixed(2)},{" "}
        {loc?.camera.target?.[1].toFixed(2)},{" "}
        {loc?.camera.target?.[2].toFixed(2)}]
      </div>
      <div className="mt-1 text-slate-400">Zoom</div>
      <div>{loc?.camera.zoom?.toFixed(3)}</div>
    </div>
  );
}
