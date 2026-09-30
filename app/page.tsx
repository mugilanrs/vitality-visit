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
      <div className="fixed inset-0 z-0">
        <WebGLBoundary>
          <CampusScene />
        </WebGLBoundary>
      </div>

      <CampusJourney ref={journeyRef} onActive={() => {}} />

      <div className="pointer-events-none fixed inset-0 z-20">
        <BrandMark />
      </div>

      <AgendaOverlay />

      <div className="pointer-events-none fixed inset-0 z-40">
        <DebugOverlay />
      </div>

      <WelcomeIntro />
    </>
  );
}
