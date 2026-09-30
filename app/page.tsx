"use client";

import { useCallback, useRef, useState } from "react";
import CampusScene from "@/components/campus/CampusScene";
import CampusJourney, {
  type JourneyHandle,
} from "@/components/campus/CampusJourney";
import Navigation from "@/components/ui/Navigation";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import HeroOverlay from "@/components/ui/HeroOverlay";
import DebugOverlay from "@/components/ui/DebugOverlay";
import WebGLBoundary from "@/components/ui/WebGLBoundary";

/**
 * Layered composition (window-scroll mode):
 *   fixed z0  <CampusScene>    — R3F canvas, receives pointer events natively
 *   in-flow   <CampusJourney>  — invisible spacer that gives the page scroll height
 *   fixed z10 <HeroOverlay>    — hero title over overview only
 *   fixed z20 <Navigation>     — overlay UI (info panel + journey ladder)
 *   fixed z40 <DebugOverlay>   — dev only, Shift+D
 *   fixed z50 <LoadingOverlay> — cinematic entry, fades after ~1s
 */
export default function Home() {
  const [active, setActive] = useState(0);
  const journeyRef = useRef<JourneyHandle | null>(null);

  const jumpTo = useCallback((i: number) => {
    journeyRef.current?.jumpTo(i, "click");
  }, []);

  return (
    <>
      {/* Fixed background scene — receives clicks/hovers via the canvas */}
      <div className="fixed inset-0 z-0">
        <WebGLBoundary>
          <CampusScene />
        </WebGLBoundary>
      </div>

      {/* Scroll spacer — drives journey.progress via window scroll */}
      <CampusJourney ref={journeyRef} onActive={setActive} />

      {/* Hero title over overview */}
      <div className="pointer-events-none fixed inset-0 z-10">
        <HeroOverlay />
      </div>

      {/* Overlay UI */}
      <div className="pointer-events-none fixed inset-0 z-20">
        <Navigation active={active} onJump={jumpTo} />
      </div>

      {/* Dev-only debug */}
      <div className="pointer-events-none fixed inset-0 z-40">
        <DebugOverlay />
      </div>

      {/* Cinematic loading overlay */}
      <LoadingOverlay />
    </>
  );
}
