/**
 * Shared journey state — a single source of truth for scroll position,
 * hover state, and focused stop. Held in a plain mutable object so
 * scroll + camera + hotspots can read/write at 60fps without React
 * re-renders. React components subscribe to `activeIndex` / `hoverIndex`
 * changes via a tiny event emitter.
 */

export type JourneyState = {
  /** Continuous scroll-driven progress in [0..N-1]. */
  progress: number;
  /** Nearest discrete stop (used for UI panel + active pill). */
  activeIndex: number;
  /** Currently hovered hotspot, or null. */
  hoverIndex: number | null;
  /** True when the user hasn't scrolled yet. */
  overview: boolean;
};

export const journey: JourneyState = {
  progress: 0,
  activeIndex: 0,
  hoverIndex: null,
  overview: true,
};

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeJourney(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Broadcast — call after mutating journey.activeIndex or journey.hoverIndex. */
export function emitJourneyChange() {
  listeners.forEach((fn) => fn());
}
