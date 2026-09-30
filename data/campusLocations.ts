import type { CameraState } from "@/lib/camera";
import { BUILDINGS, BUILDING_ORDER, BLOCK_X, BLOCK_ROWS } from "@/data/buildings";

/**
 * PHASE 8 — the scroll journey now mirrors the six primary blocks.
 *
 * The pink glass tiles are the primary interaction path; scrolling is a
 * secondary "guided tour" that visits the overview and each of the six
 * blocks in reading order.
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

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  {
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
  },
  // The scroll tour then visits each of the six primary blocks.
  ...BUILDING_ORDER.map((id, i) => {
    const b = BUILDINGS[id];
    const target: [number, number, number] = [
      b.side === "left" ? -BLOCK_X : BLOCK_X,
      1.1,
      BLOCK_ROWS[b.row],
    ];
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
