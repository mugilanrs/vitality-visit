"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { N_STOPS } from "@/data/campusLocations";
import { journey } from "@/lib/journey";

/**
 * Full-viewport transparent scroll container. Inner div is N * 100vh tall;
 * scroll position maps to `journey.progress` in [0..N-1], which CampusCamera
 * reads inside useFrame. React state is only updated when the active stop
 * index changes, so scrolling stays 60fps.
 *
 * Exposes a `jumpTo(i)` method via forwarded ref so the overlay stepper can
 * scroll to a specific stop through the same source of truth.
 */

type Props = {
  onActive: (index: number) => void;
};

export type JourneyHandle = {
  jumpTo: (index: number) => void;
};

const CampusJourney = forwardRef<JourneyHandle, Props>(function CampusJourney(
  { onActive },
  ref,
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastActive = useRef(0);

  useImperativeHandle(ref, () => ({
    jumpTo(i: number) {
      const el = scrollRef.current;
      if (!el) return;
      const max = el.scrollHeight - el.clientHeight;
      el.scrollTo({
        top: (i / (N_STOPS - 1)) * max,
        behavior: "smooth",
      });
    },
  }));

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? (el.scrollTop / max) * (N_STOPS - 1) : 0;
      journey.progress = p;
      journey.overview = false;
      const idx = Math.max(0, Math.min(N_STOPS - 1, Math.round(p)));
      if (idx !== lastActive.current) {
        lastActive.current = idx;
        journey.activeIndex = idx;
        onActive(idx);
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onActive]);

  return (
    <div
      ref={scrollRef}
      className="absolute inset-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div style={{ height: `${N_STOPS * 100}vh` }} />
    </div>
  );
});

export default CampusJourney;
