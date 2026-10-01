import type { CameraState } from "@/lib/camera";
import type { BuildingId } from "@/lib/journey";

/**
 * PHASE 9 — buildings + their destinations.
 *
 * Six primary blocks around the central spine (three left, three right).
 * Two of them carry interactive markers on the main campus view:
 *   - EB3            (right-front, next to the lake) — 3 levels: ODC, AM, PM
 *   - Signature Tower (crown at the rear of the spine) — direct entry to
 *                     the Executive Rich Dining Room
 * The other four blocks are architecture only.
 */

const OFFSET: readonly [number, number, number] = [9, 11, 11];

function fromTarget(
  target: readonly [number, number, number],
  zoom: number,
): CameraState {
  return {
    position: [target[0] + OFFSET[0], target[1] + OFFSET[1], target[2] + OFFSET[2]],
    rotation: [0, 0, 0],
    target: [target[0], target[1], target[2]],
    zoom,
  };
}

export type BuildingRoom = {
  id: string;
  name: string;
  session: string;
  host: string;
  time: string;
  capacity: string;
  interior: CameraState;
};

export type BuildingFloor = {
  index: number;
  label: string;
  name: string;
  camera: CameraState;
  rooms: BuildingRoom[];
};

export type BuildingSide = "left" | "right";
export type BuildingRow = "rear" | "middle" | "front";

export type BuildingSpec = {
  id: BuildingId;
  name: string;
  subtitle: string;
  accent: string;
  side: BuildingSide;
  row: BuildingRow;
  camera: CameraState;
  markerPosition: readonly [number, number, number];
  basePosition: readonly [number, number, number];
  floors: BuildingFloor[];
  /**
   * When true the drill-down UI skips the floor-selection step and jumps
   * straight to the single room. Used for Signature Tower → dining.
   */
  directEntry?: boolean;
};

// ---------------- Layout constants shared with CampusArchitecture ----------------

export const BLOCK_X = 3.85;
export const BLOCK_ROWS: Record<BuildingRow, number> = {
  rear: -3.5,
  middle: 0.0,
  front: 3.5,
};
export const BLOCK_SIZE = {
  width: 3.6,
  depth: 1.9,
  floors: 5,
  floorHeight: 0.38,
};

export const SPINE_LEN = 12.4;
export const TOWER_X = 0;
export const TOWER_Z = -SPINE_LEN / 2 - 0.2;
export const TOWER_HEIGHT = 9.0;

// Interior scenes live off-campus so the shared camera can travel to them
// without colliding with the campus geometry.
export const INTERIOR_ORIGINS = {
  "eb3::0::odc": [80, 1.4, 0] as const,
  "eb3::1::board-am": [80, 1.4, 14] as const,
  "eb3::2::board-pm": [80, 1.4, 28] as const,
  "signature-tower::0::executive-dining": [140, 1.4, 0] as const,
} as const;

function interiorFrame(origin: readonly [number, number, number]): CameraState {
  // Preserve the original 3-quarter view direction that composes the room
  // through the transparent glass front wall; only widen the zoom so the
  // full 8-wide room fits on portrait phones (aspect ≈ 0.46 → responsive
  // frame ≈ 22 world units → 22 / 2.7 ≈ 8.1 world units of horizontal fit).
  return {
    position: [origin[0] + 4.5, origin[1] + 4.2, origin[2] + 4.8],
    rotation: [0, 0, 0],
    target: [origin[0], origin[1], origin[2]],
    zoom: 2.7,
  };
}

function makeBlock(
  id: BuildingId,
  name: string,
  subtitle: string,
  side: BuildingSide,
  row: BuildingRow,
  floors: BuildingFloor[],
  cameraOverride?: CameraState,
): BuildingSpec {
  const x = (side === "left" ? -1 : 1) * BLOCK_X;
  const z = BLOCK_ROWS[row];
  const buildingHeight = BLOCK_SIZE.floors * BLOCK_SIZE.floorHeight + 0.4;
  return {
    id,
    name,
    subtitle,
    accent: "#f4a3c1",
    side,
    row,
    camera: cameraOverride ?? fromTarget([x, 1.1, z], 2.0),
    markerPosition: [x, buildingHeight + 0.15, z],
    basePosition: [x, 0, z],
    floors,
  };
}

// ---------------- Non-interactive blocks (four of six) ----------------

export const BUILDING_A = makeBlock(
  "block-a",
  "Innovation Hub",
  "Discovery & Ideation",
  "left",
  "rear",
  [],
);
export const BUILDING_B = makeBlock(
  "block-b",
  "Engineering Studios",
  "Platform & Delivery",
  "left",
  "middle",
  [],
);
export const BUILDING_C = makeBlock(
  "block-c",
  "Design Lab",
  "Product & Design",
  "left",
  "front",
  [],
);
export const BUILDING_D = makeBlock(
  "block-d",
  "Research Wing",
  "Applied Research",
  "right",
  "rear",
  [],
);
export const BUILDING_E = makeBlock(
  "block-e",
  "Executive Lounge",
  "Team Hospitality",
  "right",
  "middle",
  [],
);

// ---------------- EB3 — right FRONT, closest to the lake, 3 levels ----------------

const EB3_FLOORS: BuildingFloor[] = [
    {
      index: 0,
      label: "Level 1",
      name: "ODC",
      camera: fromTarget([BLOCK_X, 0.35, BLOCK_ROWS.front], 2.6),
      rooms: [
        {
          id: "odc",
          name: "ODC",
          session: "Offshore Delivery Centre",
          host: "Delivery Team",
          time: "09:00 — 18:00",
          capacity: "48 desks",
          interior: interiorFrame(INTERIOR_ORIGINS["eb3::0::odc"]),
        },
      ],
    },
    {
      index: 1,
      label: "Level 2",
      name: "Board Room AM",
      camera: fromTarget([BLOCK_X, 0.75, BLOCK_ROWS.front], 2.6),
      rooms: [
        {
          id: "board-am",
          name: "Board Room AM",
          session: "Morning Leadership Board",
          host: "Executive Council",
          time: "09:30 — 12:30",
          capacity: "18 seats",
          interior: interiorFrame(INTERIOR_ORIGINS["eb3::1::board-am"]),
        },
      ],
    },
    {
      index: 2,
      label: "Level 3",
      name: "Board Room PM",
      camera: fromTarget([BLOCK_X, 1.15, BLOCK_ROWS.front], 2.6),
      rooms: [
        {
          id: "board-pm",
          name: "Board Room PM",
          session: "Afternoon Strategy Board",
          host: "Executive Council",
          time: "14:00 — 17:30",
          capacity: "18 seats",
          interior: interiorFrame(INTERIOR_ORIGINS["eb3::2::board-pm"]),
        },
      ],
    },
];

export const BUILDING_EB3: BuildingSpec = makeBlock(
  "eb3",
  "EB3",
  "Board Rooms & ODC",
  "right",
  "front",
  EB3_FLOORS,
  fromTarget([BLOCK_X, 1.75, BLOCK_ROWS.front], 1.6),
);

// ---------------- Signature Tower — direct entry to dining ----------------

export const BUILDING_SIGNATURE_TOWER: BuildingSpec = {
  id: "signature-tower",
  name: "Signature Tower",
  subtitle: "Executive Dining",
  accent: "#f4a3c1",
  side: "right",
  row: "rear",
  camera: fromTarget([TOWER_X, 4.5, TOWER_Z], 1.6),
  markerPosition: [TOWER_X, TOWER_HEIGHT + 0.4, TOWER_Z],
  basePosition: [TOWER_X, 0, TOWER_Z],
  directEntry: true,
  floors: [
    {
      index: 0,
      label: "Crown",
      name: "Executive Rich Dining Room",
      camera: fromTarget([TOWER_X, TOWER_HEIGHT * 0.82, TOWER_Z], 2.0),
      rooms: [
        {
          id: "executive-dining",
          name: "Executive Rich Dining Room",
          session: "Executive Lunch",
          host: "Office of the CEO",
          time: "13:00 — 14:15",
          capacity: "24 seats",
          interior: interiorFrame(
            INTERIOR_ORIGINS["signature-tower::0::executive-dining"],
          ),
        },
      ],
    },
  ],
};

// ---------------- Registry ----------------

export const BUILDINGS: Record<BuildingId, BuildingSpec> = {
  "block-a": BUILDING_A,
  "block-b": BUILDING_B,
  "block-c": BUILDING_C,
  "block-d": BUILDING_D,
  "block-e": BUILDING_E,
  eb3: BUILDING_EB3,
  "signature-tower": BUILDING_SIGNATURE_TOWER,
};

/** Reading order for the scroll tour (six primary blocks only). */
export const BUILDING_ORDER: BuildingId[] = [
  "block-a",
  "block-b",
  "block-c",
  "block-d",
  "block-e",
  "eb3",
];

/** Buildings that carry an interactive marker on the main campus view. */
export const MARKER_BUILDINGS: BuildingId[] = ["eb3", "signature-tower"];

export type InteriorKey = keyof typeof INTERIOR_ORIGINS;

export function interiorKey(
  building: BuildingId,
  floor: number,
  roomId: string,
): InteriorKey | null {
  const key = `${building}::${floor}::${roomId}`;
  return (key in INTERIOR_ORIGINS ? key : null) as InteriorKey | null;
}
