/**
 * PHASE 5–7 — the single source of truth for the journey.
 *
 * The controller now has TWO axes:
 *
 *   1. `progress` — scroll-driven position along the campus overview journey
 *      (kept intact from Phase 5, so the camera and hotspots keep working).
 *
 *   2. `focus`   — a drill-down stack that the new agenda UI drives:
 *
 *        campus  →  building  →  floor  →  room  →  inside
 *
 *      Each level takes over what the camera is looking at, and the pink-
 *      glass agenda tiles read from this stack to decide which card to show.
 *
 * Held in a plain mutable object so scroll + camera + hotspots + UI can
 * read/write at 60fps without React re-renders.
 */

import { CAMPUS_LOCATIONS, N_STOPS } from "@/data/campusLocations";

export type NavigationMode =
  | "idle"
  | "scroll"
  | "click"
  | "keyboard"
  | "touch";

// ---------------- Focus stack ----------------

/** String slug: one of the ids registered in data/buildings.ts. */
export type BuildingId = string;

export type FocusLevel = "campus" | "building" | "floor" | "room" | "inside";

export type FocusState = {
  level: FocusLevel;
  building?: BuildingId;
  /** Floor index (0 = ground). */
  floor?: number;
  /** Room identifier within the floor. */
  roomId?: string;
};

// ---------------- Journey state ----------------

export type JourneyState = {
  progress: number;
  activeIndex: number;
  hoverIndex: number | null;
  visited: Set<number>;
  overview: boolean;
  mode: NavigationMode;
  transitioning: boolean;
  opening: boolean;
  lastInteraction: number;
  reducedMotion: boolean;
  /** True while the welcome intro is on-screen. Suppresses camera parallax etc. */
  welcome: boolean;
  /** Focus stack — drives the pink-glass agenda + camera drill-down. */
  focus: FocusState;
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
  welcome: true,
  focus: { level: "campus" },
};

// ---------------- Event bus ----------------

type JourneyEvent =
  | "change"
  | "active"
  | "hover"
  | "mode"
  | "focus"
  | "overview"
  | "welcome";

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

export function emitJourneyChange() {
  emit("change");
}

// ---------------- Mutators ----------------

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

export function setWelcome(v: boolean) {
  if (journey.welcome === v) return;
  journey.welcome = v;
  emit("welcome");
}

// ---------------- Focus stack mutators ----------------

export function setFocus(next: FocusState) {
  journey.focus = next;
  markInteracted();
  emit("focus");
}

export function openBuilding(id: BuildingId) {
  setFocus({ level: "building", building: id });
}

export function openFloor(floor: number) {
  const b = journey.focus.building;
  if (!b) return;
  setFocus({ level: "floor", building: b, floor });
}

export function openRoom(roomId: string) {
  const f = journey.focus;
  if (f.building == null || f.floor == null) return;
  setFocus({ level: "room", building: f.building, floor: f.floor, roomId });
}

export function enterRoom() {
  const f = journey.focus;
  if (f.building == null || f.floor == null || f.roomId == null) return;
  setFocus({ level: "inside", building: f.building, floor: f.floor, roomId: f.roomId });
}

export function focusBack() {
  const f = journey.focus;
  if (f.level === "inside") {
    setFocus({ level: "room", building: f.building, floor: f.floor, roomId: f.roomId });
    return;
  }
  if (f.level === "room") {
    setFocus({ level: "floor", building: f.building, floor: f.floor });
    return;
  }
  if (f.level === "floor") {
    setFocus({ level: "building", building: f.building });
    return;
  }
  if (f.level === "building") {
    setFocus({ level: "campus" });
    return;
  }
}

export function currentLocation() {
  return CAMPUS_LOCATIONS[journey.activeIndex] ?? CAMPUS_LOCATIONS[0];
}
