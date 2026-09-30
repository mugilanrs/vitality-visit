"use client";

import Lenis from "lenis";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { N_STOPS } from "@/data/campusLocations";
import { journey, emitJourneyChange } from "@/lib/journey";

/**
 * WINDOW-scroll journey. The whole page scrolls a tall invisible spacer;
 * the campus scene is fixed behind it. This lets the canvas receive
 * hover/click events natively (unblocked by any scroll container).
 *
 * Lenis smooths the window wheel/touch. GSAP tweens window.scrollY for
 * click jumps.
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
  const lastActive = useRef(0);
  const lenisRef = useRef<Lenis | null>(null);

  useImperativeHandle(ref, () => ({
    jumpTo(i: number) {
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const targetY = (i / (N_STOPS - 1)) * max;
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(targetY, { duration: 1.4 });
      } else {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    },
  }));

  // Lenis on the window
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;

    let raf = 0;
    function tick(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Window scroll → journey.progress
  useEffect(() => {
    const onScroll = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? (window.scrollY / max) * (N_STOPS - 1) : 0;
      journey.progress = p;
      journey.overview = p < 0.05;
      const idx = Math.max(0, Math.min(N_STOPS - 1, Math.round(p)));
      if (idx !== lastActive.current) {
        lastActive.current = idx;
        journey.activeIndex = idx;
        onActive(idx);
        emitJourneyChange();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [onActive]);

  // Hotspot clicks
  useEffect(() => {
    function handle(e: Event) {
      const detail = (e as CustomEvent).detail as { index: number } | undefined;
      if (!detail) return;
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const targetY = (detail.index / (N_STOPS - 1)) * max;
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(targetY, { duration: 1.4 });
      } else {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    }
    window.addEventListener("campus-focus", handle);
    return () => window.removeEventListener("campus-focus", handle);
  }, []);

  // Invisible scroll-spacer that gives the page its scrollable height.
  return (
    <div
      aria-hidden
      style={{ height: `${N_STOPS * 100}vh`, pointerEvents: "none" }}
    />
  );
});

export default CampusJourney;
