/**
 * Shared journey state — kept in a plain mutable object so scroll and
 * camera updates run at 60fps without triggering React re-renders.
 *
 * The scroller updates `progress` (0..N-1). CampusCamera reads it inside
 * useFrame and interpolates between CampusLocation camera states.
 */

export type JourneyState = {
  progress: number;   // 0..N-1
  activeIndex: number;
  overview: boolean;
};

export const journey: JourneyState = {
  progress: 0,
  activeIndex: 0,
  overview: false,
};
