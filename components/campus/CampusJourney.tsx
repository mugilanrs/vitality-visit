"use client";

import Lenis from "lenis";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import gsap from "gsap";
import { N_STOPS } from "@/data/campusLocations";
import {
  journey,
  setProgress,
  setActiveIndex,
  setOpening,
  markInteracted,
  endTransition,
  setReducedMotion,
} from "@/lib/journey";

/**
 * PHASE 5 — the single input surface driving `journey.progress`.
 *
 * Inputs handled here:
 *   - Window scroll (Lenis-smoothed) → `setProgress`
 *   - Programmatic jumps (click / keyboard) → GSAP-tweened window scroll, so
 *     everything still ends up as a single scroll-driven progress. This is
 *     the key to interrupt-safe transitions: a new jump just kills the old
 *     tween and starts a new one against the current scroll position.
 *   - Global `campus-focus` events (from hotspots) → jumpTo
 *   - Keyboard: ArrowUp / ArrowDown / Home / End / Escape
 *
 * The invisible spacer at the bottom gives the page its scrollable height.
 */

type Props = {
  onActive: (index: number) => void;
};

export type JourneyHandle = {
  jumpTo: (index: number, mode?: "click" | "keyboard" | "touch") => void;
};

const CampusJourney = forwardRef<JourneyHandle, Props>(function CampusJourney(
  { onActive },
  ref,
) {
  const lastActive = useRef(0);
  const lenisRef = useRef<Lenis | null>(null);
  const scrollTween = useRef<gsap.core.Tween | null>(null);

  // ---------------- Public jumpTo (shared with hotspots + nav + keyboard) ----------------
  const doJump = (i: number, mode: "click" | "keyboard" | "touch" = "click") => {
    const idx = Math.max(0, Math.min(N_STOPS - 1, Math.round(i)));
    if (typeof window === "undefined") return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = (idx / (N_STOPS - 1)) * max;

    // Cancel any in-flight scroll tween so we redirect instead of queue.
    scrollTween.current?.kill();
    scrollTween.current = null;

    setActiveIndex(idx, mode);
    markInteracted();

    // Tween window.scrollY. The scroll listener below feeds the change into
    // journey.progress — one source of truth for the camera.
    const startY = window.scrollY;
    if (Math.abs(startY - targetY) < 1) {
      endTransition();
      return;
    }

    const proxy = { y: startY };
    const dur = journey.reducedMotion ? 0.35 : 1.25;
    scrollTween.current = gsap.to(proxy, {
      y: targetY,
      duration: dur,
      ease: "power2.inOut",
      onUpdate: () => {
        window.scrollTo({ top: proxy.y });
      },
      onComplete: () => {
        endTransition();
        scrollTween.current = null;
      },
    });
  };

  useImperativeHandle(ref, () => ({ jumpTo: doJump }));

  // ---------------- Reduced motion detection ----------------
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // ---------------- Lenis on the window ----------------
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

  // ---------------- Kick off the opening reveal ----------------
  useEffect(() => {
    setOpening(true);
    const t = setTimeout(() => setOpening(false), 1750);
    return () => clearTimeout(t);
  }, []);

  // ---------------- Window scroll → journey.progress ----------------
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? (window.scrollY / max) * (N_STOPS - 1) : 0;
      // Preserve mode when a click/keyboard tween is running.
      const mode: "scroll" | "click" | "keyboard" | "touch" =
        scrollTween.current
          ? journey.mode === "keyboard" || journey.mode === "touch"
            ? journey.mode
            : "click"
          : "scroll";
      setProgress(p, mode);
      const idx = Math.max(0, Math.min(N_STOPS - 1, Math.round(p)));
      if (idx !== lastActive.current) {
        lastActive.current = idx;
        onActive(idx);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [onActive]);

  // ---------------- Hotspot clicks (event bus) ----------------
  useEffect(() => {
    function handle(e: Event) {
      const detail = (e as CustomEvent).detail as { index: number } | undefined;
      if (!detail) return;
      doJump(detail.index, "click");
    }
    window.addEventListener("campus-focus", handle);
    return () => window.removeEventListener("campus-focus", handle);
  }, []);

  // ---------------- Keyboard navigation ----------------
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore keys while typing inside form controls.
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (t?.isContentEditable) return;

      const active = journey.activeIndex;
      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
        case "PageDown":
          e.preventDefault();
          doJump(Math.min(N_STOPS - 1, active + 1), "keyboard");
          break;
        case "ArrowUp":
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          doJump(Math.max(0, active - 1), "keyboard");
          break;
        case "Home":
          e.preventDefault();
          doJump(0, "keyboard");
          break;
        case "End":
          e.preventDefault();
          doJump(N_STOPS - 1, "keyboard");
          break;
        case "Escape":
          e.preventDefault();
          doJump(0, "keyboard");
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ---------------- Touch swipe (vertical) ----------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isCoarse = window.matchMedia?.("(pointer: coarse)").matches;
    if (!isCoarse) return;

    let startY = 0;
    let startX = 0;
    let startTime = 0;
    let armed = false;

    function onStart(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      startTime = performance.now();
      armed = true;
    }
    function onEnd(e: TouchEvent) {
      if (!armed) return;
      armed = false;
      const t = e.changedTouches[0];
      const dy = t.clientY - startY;
      const dx = t.clientX - startX;
      const dt = performance.now() - startTime;
      // Vertical swipe: fast + long enough, more vertical than horizontal
      if (dt < 550 && Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.4) {
        const dir = dy < 0 ? 1 : -1;
        const next = Math.max(
          0,
          Math.min(N_STOPS - 1, journey.activeIndex + dir),
        );
        doJump(next, "touch");
      }
    }
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
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
