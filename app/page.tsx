"use client";

import { useCallback, useRef, useState } from "react";
import CampusScene from "@/components/campus/CampusScene";
import CampusJourney, { type JourneyHandle } from "@/components/campus/CampusJourney";
import Navigation from "@/components/ui/Navigation";

/**
 * Layered composition:
 *   z0  <CampusScene>   — fixed R3F canvas, non-interactive
 *   z10 <CampusJourney> — transparent scroll container (captures wheel/touch)
 *   z20 <Navigation>    — overlay UI; individual regions opt into pointer-events
 */
export default function Home() {
  const [active, setActive] = useState(0);
  const journeyRef = useRef<JourneyHandle | null>(null);

  const jumpTo = useCallback((i: number) => {
    journeyRef.current?.jumpTo(i);
  }, []);

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#eaf0f6] text-slate-900">
      <div className="absolute inset-0 z-0">
        <CampusScene />
      </div>

      <div className="absolute inset-0 z-10">
        <CampusJourney ref={journeyRef} onActive={setActive} />
      </div>

      <div className="absolute inset-0 z-20 pointer-events-none">
        <Navigation active={active} onJump={jumpTo} />
      </div>
    </main>
  );
}
