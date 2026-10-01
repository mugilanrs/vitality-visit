import type { CameraState } from "@/lib/camera";
import { BUILDINGS, MARKER_BUILDINGS } from "@/data/buildings";

/**
 * PHASE 10 — the scroll journey is now narrow: overview → EB3 → Signature
 * Tower. The other four primary blocks stay in the frame as architecture,
 * but the scroll tour and the agenda no longer stop at them — only the two
 * interactive destinations are represented.
 *
 * The pink glass markers remain the primary interaction path; scrolling is
 * a secondary "guided tour" that visits only the interactive destinations.
 */

export type AgendaMeta = {
  step: string;
  title: string;
  time: string;
  host: string;
  tags: readonly string[];
  desc: string;
};

export type CampusLocation = {
  id: string;
  name: string;
  camera: CameraState;
  agenda: AgendaMeta;
};

const OFFSET: readonly [number, number, number] = [9, 11, 11];
function from(target: readonly [number, number, number], zoom: number): CameraState {
  return {
    position: [target[0] + OFFSET[0], target[1] + OFFSET[1], target[2] + OFFSET[2]],
    rotation: [0, 0, 0],
    target: [target[0], target[1], target[2]],
    zoom,
  };
}

const OVERVIEW: CampusLocation = {
  id: "overview",
  name: "Campus Overview",
  camera: from([0, 1.4, 1.5], 0.82),
  agenda: {
    step: "00",
    title: "Campus Overview",
    time: "",
    host: "",
    tags: ["Overview"],
    desc: "The full architectural masterplan — six primary blocks arranged bilaterally around the central spine, framed by the entrance lake.",
  },
};

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  OVERVIEW,
  // The scroll tour then visits only the two interactive destinations.
  ...MARKER_BUILDINGS.map((id, i) => {
    const b = BUILDINGS[id];
    const [tx, , tz] = b.basePosition;
    const target: [number, number, number] = [tx, 1.1, tz];
    return {
      id: b.id,
      name: b.name,
      camera: from(target, 1.55),
      agenda: {
        step: String(i + 1).padStart(2, "0"),
        title: b.name,
        time: b.floors[0]?.rooms[0]?.time ?? "",
        host: b.floors[0]?.rooms[0]?.host ?? "",
        tags: [b.subtitle],
        desc: `${b.name} — ${b.subtitle}.`,
      },
    } satisfies CampusLocation;
  }),
];

export const N_STOPS = CAMPUS_LOCATIONS.length;

export function locationById(id: string): CampusLocation | undefined {
  return CAMPUS_LOCATIONS.find((l) => l.id === id);
}
