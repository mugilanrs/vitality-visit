import type { CameraState } from "@/lib/camera";
import type { BuildingId } from "@/lib/journey";

/**
 * PHASE 8 — the six primary campus blocks.
 *
 * The reference campus is bilateral: three blocks on the left of the
 * central spine, three on the right. This data file is the SINGLE source
 * of truth for their positions, camera frames, spatial tile anchors, and
 * agenda content. Nothing else in the app hardcodes a block position.
 *
 * Layout (world XZ):
 *
 *                    (tower / crown)
 *                          |
 *   [ Block A ]  |  spine  |  [ Block D ]         z ≈ -3.5   REAR
 *   [ Block B ]  |  spine  |  [ Block E ]         z ≈  0.0   MIDDLE
 *   [ Block C ]  |  spine  |  [ Block F / EB3 ]   z ≈ +3.5   FRONT
 *                          |
 *                     entrance lake
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
  /** Camera frame for the whole building. */
  camera: CameraState;
  /** World-space anchor for the pink glass tile / hotspot marker. */
  markerPosition: readonly [number, number, number];
  /** World-space position of the building base (used for the highlight ring). */
  basePosition: readonly [number, number, number];
  floors: BuildingFloor[];
};

// ---------------- Layout constants shared with CampusArchitecture ----------------

/** Distance from spine centre to each row of blocks. */
export const BLOCK_X = 3.85;
/** Z position of each row (rear → front). */
export const BLOCK_ROWS: Record<BuildingRow, number> = {
  rear: -3.5,
  middle: 0.0,
  front: 3.5,
};
/** Uniform block size — enforced by the composition, not per-building. */
export const BLOCK_SIZE = {
  width: 3.6,
  depth: 1.9,
  floors: 5,
  floorHeight: 0.38,
};

// Interior scenes live off-campus in world space so the shared camera can
// travel to them without colliding with the campus geometry.
export const INTERIOR_ORIGINS = {
  "block-a::0::lounge": [80, 1.4, 0] as const,
  "block-b::0::lounge": [80, 1.4, 12] as const,
  "block-c::0::lounge": [80, 1.4, 24] as const,
  "block-d::0::lounge": [80, 1.4, 36] as const,
  "block-e::0::lounge": [80, 1.4, 48] as const,
  "eb3::0::board-am": [100, 1.4, 0] as const,
  "eb3::1::board-pm": [100, 1.4, 12] as const,
} as const;

function interiorFrame(origin: readonly [number, number, number]): CameraState {
  return {
    position: [origin[0] + 4.5, origin[1] + 4.2, origin[2] + 4.8],
    rotation: [0, 0, 0],
    target: [origin[0], origin[1], origin[2]],
    zoom: 4.8,
  };
}

// ---------------- Helpers ----------------

function makeBuilding(
  id: BuildingId,
  name: string,
  subtitle: string,
  side: BuildingSide,
  row: BuildingRow,
  floors: BuildingFloor[],
): BuildingSpec {
  const x = (side === "left" ? -1 : 1) * BLOCK_X;
  const z = BLOCK_ROWS[row];
  const baseY = 0;
  const buildingHeight = BLOCK_SIZE.floors * BLOCK_SIZE.floorHeight + 0.4;
  return {
    id,
    name,
    subtitle,
    accent: "#f4a3c1",
    side,
    row,
    camera: fromTarget([x, 1.1, z], 2.0),
    markerPosition: [x, buildingHeight + 0.15, z],
    basePosition: [x, baseY, z],
    floors,
  };
}

// ---------------- The six blocks ----------------

// Block A — LEFT REAR
export const BUILDING_A: BuildingSpec = makeBuilding(
  "block-a",
  "Innovation Hub",
  "Discovery & Ideation",
  "left",
  "rear",
  [
    {
      index: 0,
      label: "Ground",
      name: "Ideation Studio",
      camera: fromTarget([-BLOCK_X, 0.5, BLOCK_ROWS.rear], 2.2),
      rooms: [
        {
          id: "lounge",
          name: "Ideation Studio",
          session: "Product Discovery",
          host: "Innovation Team",
          time: "10:00 — 11:30",
          capacity: "20 seats",
          interior: interiorFrame(INTERIOR_ORIGINS["block-a::0::lounge"]),
        },
      ],
    },
  ],
);

// Block B — LEFT MIDDLE
export const BUILDING_B: BuildingSpec = makeBuilding(
  "block-b",
  "Engineering Studios",
  "Platform & Delivery",
  "left",
  "middle",
  [
    {
      index: 0,
      label: "Ground",
      name: "Engineering Commons",
      camera: fromTarget([-BLOCK_X, 0.5, BLOCK_ROWS.middle], 2.2),
      rooms: [
        {
          id: "lounge",
          name: "Engineering Commons",
          session: "Engineering At Scale",
          host: "Platform Team",
          time: "11:45 — 13:00",
          capacity: "24 seats",
          interior: interiorFrame(INTERIOR_ORIGINS["block-b::0::lounge"]),
        },
      ],
    },
  ],
);

// Block C — LEFT FRONT
export const BUILDING_C: BuildingSpec = makeBuilding(
  "block-c",
  "Design Lab",
  "Product & Design",
  "left",
  "front",
  [
    {
      index: 0,
      label: "Ground",
      name: "Design Studio",
      camera: fromTarget([-BLOCK_X, 0.5, BLOCK_ROWS.front], 2.2),
      rooms: [
        {
          id: "lounge",
          name: "Design Studio",
          session: "Design Review",
          host: "Product Design",
          time: "14:15 — 15:15",
          capacity: "18 seats",
          interior: interiorFrame(INTERIOR_ORIGINS["block-c::0::lounge"]),
        },
      ],
    },
  ],
);

// Block D — RIGHT REAR
export const BUILDING_D: BuildingSpec = makeBuilding(
  "block-d",
  "Research Wing",
  "Applied Research",
  "right",
  "rear",
  [
    {
      index: 0,
      label: "Ground",
      name: "Research Lab",
      camera: fromTarget([BLOCK_X, 0.5, BLOCK_ROWS.rear], 2.2),
      rooms: [
        {
          id: "lounge",
          name: "Research Lab",
          session: "Applied Research",
          host: "R&D",
          time: "10:00 — 11:30",
          capacity: "16 seats",
          interior: interiorFrame(INTERIOR_ORIGINS["block-d::0::lounge"]),
        },
      ],
    },
  ],
);

// Block E — RIGHT MIDDLE  — Executive Lounge (was Signature Tower content)
export const BUILDING_E: BuildingSpec = makeBuilding(
  "block-e",
  "Executive Lounge",
  "Executive Lunch",
  "right",
  "middle",
  [
    {
      index: 0,
      label: "Ground",
      name: "Executive Lounge",
      camera: fromTarget([BLOCK_X, 0.5, BLOCK_ROWS.middle], 2.2),
      rooms: [
        {
          id: "lounge",
          name: "Executive Lounge",
          session: "Executive Lunch",
          host: "Office of the CEO",
          time: "13:00 — 14:15",
          capacity: "24 seats",
          interior: interiorFrame(INTERIOR_ORIGINS["block-e::0::lounge"]),
        },
      ],
    },
  ],
);

// EB3 — RIGHT FRONT  — Board Rooms (kept from the previous phase)
export const BUILDING_EB3: BuildingSpec = makeBuilding(
  "eb3",
  "EB3",
  "Board Rooms",
  "right",
  "front",
  [
    {
      index: 0,
      label: "Floor 1",
      name: "Board Room AM",
      camera: fromTarget([BLOCK_X, 0.35, BLOCK_ROWS.front], 2.4),
      rooms: [
        {
          id: "board-am",
          name: "Board Room AM",
          session: "Morning Leadership Board",
          host: "Executive Council",
          time: "09:30 — 12:30",
          capacity: "18 seats",
          interior: interiorFrame(INTERIOR_ORIGINS["eb3::0::board-am"]),
        },
      ],
    },
    {
      index: 1,
      label: "Floor 2",
      name: "Board Room PM",
      camera: fromTarget([BLOCK_X, 0.73, BLOCK_ROWS.front], 2.4),
      rooms: [
        {
          id: "board-pm",
          name: "Board Room PM",
          session: "Afternoon Strategy Board",
          host: "Executive Council",
          time: "14:00 — 17:30",
          capacity: "18 seats",
          interior: interiorFrame(INTERIOR_ORIGINS["eb3::1::board-pm"]),
        },
      ],
    },
  ],
);

// ---------------- Registry ----------------

export const BUILDINGS: Record<BuildingId, BuildingSpec> = {
  "block-a": BUILDING_A,
  "block-b": BUILDING_B,
  "block-c": BUILDING_C,
  "block-d": BUILDING_D,
  "block-e": BUILDING_E,
  eb3: BUILDING_EB3,
};

/** Reading order used by the overlay tiles (left→right, rear→front). */
export const BUILDING_ORDER: BuildingId[] = [
  "block-a",
  "block-b",
  "block-c",
  "block-d",
  "block-e",
  "eb3",
];

export type InteriorKey = keyof typeof INTERIOR_ORIGINS;

export function interiorKey(
  building: BuildingId,
  floor: number,
  roomId: string,
): InteriorKey | null {
  const key = `${building}::${floor}::${roomId}`;
  return (key in INTERIOR_ORIGINS ? key : null) as InteriorKey | null;
}
