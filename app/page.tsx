"use client";

import { useRef } from "react";
import CampusScene from "@/components/campus/CampusScene";
import CampusJourney, {
  type JourneyHandle,
} from "@/components/campus/CampusJourney";
import WelcomeIntro from "@/components/ui/WelcomeIntro";
import AgendaOverlay from "@/components/ui/AgendaOverlay";
import BrandMark from "@/components/ui/BrandMark";
import DebugOverlay from "@/components/ui/DebugOverlay";
import WebGLBoundary from "@/components/ui/WebGLBoundary";

/**
 * Composition:
 *   fixed z0    <CampusScene>    — R3F canvas; campus + interior rooms
 *   in-flow     <CampusJourney>  — invisible scroll spacer (kept intact from
 *                                  Phase 5; still lets the user scroll through
 *                                  the campus while on the 'campus' focus)
 *   fixed z20   <BrandMark>      — small TCS · Vitality brand mark
 *   fixed z30   <AgendaOverlay>  — pink glass tiles + drill-down
 *   fixed z40   <DebugOverlay>   — Shift+D, dev only
 *   fixed z60   <WelcomeIntro>   — cloud opening, dismisses on click
 */
export default function Home() {
  const journeyRef = useRef<JourneyHandle | null>(null);

  return (
    <>
      {/* The canvas fills the DYNAMIC viewport (100dvh) rather than 100vh so
          iOS Safari's collapsing URL bar can't reintroduce a letterbox on the
          bottom. Width uses 100vw + safe-area insets so home-bar padding on
          landscape iPhones doesn't crop the campus. */}
      <div
        className="fixed left-0 top-0 z-0"
        style={{
          width: "100vw",
          height: "100dvh",
          // 100dvh is unsupported on old Safari — fall back cleanly.
          minHeight: "100vh",
        }}
      >
        <WebGLBoundary>
          <CampusScene />
        </WebGLBoundary>
      </div>

      <CampusJourney ref={journeyRef} onActive={() => {}} />

      <div
        className="pointer-events-none fixed left-0 top-0 z-20"
        style={{ width: "100vw", height: "100dvh" }}
      >
        <BrandMark />
      </div>

      <AgendaOverlay />

      <div
        className="pointer-events-none fixed left-0 top-0 z-40"
        style={{ width: "100vw", height: "100dvh" }}
      >
        <DebugOverlay />
      </div>

      <WelcomeIntro />
    </>
  );
}
