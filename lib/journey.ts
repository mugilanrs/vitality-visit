/**
 * PHASE 5 — the single source of truth for the journey.
 *
 * Every input — scroll, click, hotspot tap, keyboard, touch — writes into
 * this controller. The camera, hotspots, UI, and effects all *read* from it.
 * There is no other camera/click/hotspot state competing with it.
 *
 * Held in a plain mutable object so scroll + camera + hotspots can read/write
 * at 60fps without React re-renders. React components subscribe to a tiny
 * event emitter for the events they care about (active/hover/mode).
 */

import { CAMPUS_LOCATIONS, N_STOPS } from "@/data/campusLocations";

export type NavigationMode =
  | "idle"      // no interaction for a while — allow subtle breathing
  | "scroll"    // user is actively scrolling
  | "click"     // camera flying to a click target
  | "keyboard"  // arrow-key nav
  | "touch";    // swipe

export type JourneyState = {
  /** Continuous progress in [0..N-1]; the camera reads this directly. */
  progress: number;
  /** Nearest discrete stop (used for UI panel + active pill). */
  activeIndex: number;
  /** Currently hovered hotspot, or null. */
  hoverIndex: number | null;
  /** Locations the user has visited at least once (for VISITED marker state). */
  visited: Set<number>;
  /** True when the user hasn't scrolled yet. */
  overview: boolean;
  /** Which subsystem last drove the camera. */
  mode: NavigationMode;
  /** True during a scripted GSAP-style transition; camera should smooth-redirect. */
  transitioning: boolean;
  /** Cinematic opening — true while the initial reveal is in progress. */
  opening: boolean;
  /** Timestamp of last user interaction (perf.now()). */
  lastInteraction: number;
  /** Respect prefers-reduced-motion. */
  reducedMotion: boolean;
};

export const journey: JourneyState = {
  progress: 0,
  activeIndex: 0,
  hoverIndex: null,
  visited: new Set<number>([0]),
  overview: true,
  mode: "idle",
  transitioning: false,
  opening: true,
  lastInteraction:
    typeof performance !== "undefined" ? performance.now() : 0,
  reducedMotion: false,
};

// ---------------- Event bus ----------------

type JourneyEvent =
  | "change"
  | "active"
  | "hover"
  | "mode"
  | "focus"
  | "overview";

type Listener = () => void;
const listeners = new Map<JourneyEvent, Set<Listener>>();

export function subscribeJourney(fn: Listener, event: JourneyEvent = "change") {
  let set = listeners.get(event);
  if (!set) {
    set = new Set<Listener>();
    listeners.set(event, set);
  }
  set.add(fn);
  return () => {
    set!.delete(fn);
  };
}

function emit(event: JourneyEvent) {
  listeners.get(event)?.forEach((fn) => fn());
  if (event !== "change") listeners.get("change")?.forEach((fn) => fn());
}

// Back-compat named export (old code uses this).
export function emitJourneyChange() {
  emit("change");
}

// ---------------- Mutators (call these instead of touching journey directly) ----------------

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function setProgress(next: number, mode: NavigationMode = "scroll") {
  const p = clamp(next, 0, N_STOPS - 1);
  journey.progress = p;
  journey.overview = p < 0.05;
  journey.mode = mode;
  journey.lastInteraction =
    typeof performance !== "undefined" ? performance.now() : 0;
  const idx = clamp(Math.round(p), 0, N_STOPS - 1);
  if (idx !== journey.activeIndex) {
    journey.activeIndex = idx;
    journey.visited.add(idx);
    emit("active");
  }
  emit("overview");
}

export function setActiveIndex(index: number, mode: NavigationMode = "click") {
  const idx = clamp(index, 0, N_STOPS - 1);
  journey.mode = mode;
  journey.lastInteraction =
    typeof performance !== "undefined" ? performance.now() : 0;
  journey.transitioning = true;
  if (idx !== journey.activeIndex) {
    journey.activeIndex = idx;
    journey.visited.add(idx);
    emit("active");
  }
  emit("focus");
}

export function endTransition() {
  journey.transitioning = false;
  emit("mode");
}

export function setHoverIndex(next: number | null) {
  if (journey.hoverIndex === next) return;
  journey.hoverIndex = next;
  emit("hover");
}

export function markInteracted() {
  journey.lastInteraction =
    typeof performance !== "undefined" ? performance.now() : 0;
}

export function setOpening(v: boolean) {
  if (journey.opening === v) return;
  journey.opening = v;
  emit("mode");
}

export function setReducedMotion(v: boolean) {
  journey.reducedMotion = v;
}

// ---------------- Derived helpers ----------------

export function currentLocation() {
  return CAMPUS_LOCATIONS[journey.activeIndex] ?? CAMPUS_LOCATIONS[0];
}
