"use client";

import { useCallback, useRef, useState } from "react";
import CampusScene from "@/components/campus/CampusScene";
import CampusJourney, {
  type JourneyHandle,
} from "@/components/campus/CampusJourney";
import Navigation from "@/components/ui/Navigation";

/**
 * Layered composition (window-scroll mode):
 *   fixed z0  <CampusScene>   — R3F canvas, receives pointer events natively
 *   in-flow   <CampusJourney> — invisible spacer that gives the page scroll height
 *   fixed z20 <Navigation>    — overlay UI (pointer-events off by default)
 */
export default function Home() {
  const [active, setActive] = useState(0);
  const journeyRef = useRef<JourneyHandle | null>(null);

  const jumpTo = useCallback((i: number) => {
    journeyRef.current?.jumpTo(i);
  }, []);

  return (
    <>
      {/* Fixed background scene — receives clicks/hovers via the canvas */}
      <div className="fixed inset-0 z-0">
        <CampusScene />
      </div>

      {/* Scroll spacer — drives journey.progress via window scroll */}
      <CampusJourney ref={journeyRef} onActive={setActive} />

      {/* Overlay UI */}
      <div className="fixed inset-0 z-20 pointer-events-none">
        <Navigation active={active} onJump={jumpTo} />
      </div>
    </>
  );
}
