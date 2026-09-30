import type { CameraState } from "@/lib/camera";
import type { BuildingId } from "@/lib/journey";

/**
 * PHASE 7 — building drill-down data.
 *
 * Two buildings are surfaced as agenda tiles. Each carries its own camera
 * frame for the building view AND a frame per floor for the drill-down.
 * A room references a name, a session card, and an interior scene camera.
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
  /** Ortho camera frame when the camera is "inside" this room. */
  interior: CameraState;
};

export type BuildingFloor = {
  index: number;
  label: string;
  name: string;
  /** Camera frame focused on this floor of the building shell. */
  camera: CameraState;
  rooms: BuildingRoom[];
};

export type BuildingSpec = {
  id: BuildingId;
  name: string;
  subtitle: string;
  accent: string;
  /** Camera frame for the whole building. */
  camera: CameraState;
  /** World-space anchor for the pink glass tile / hotspot marker. */
  markerPosition: readonly [number, number, number];
  floors: BuildingFloor[];
};

// Interior scenes live off-campus in world space so the shared camera can
// travel to them without colliding with the campus geometry. Each interior
// gets its own X slot.
const INTERIOR_ORIGIN_EB3_F1: readonly [number, number, number] = [80, 1.4, 0];
const INTERIOR_ORIGIN_EB3_F2: readonly [number, number, number] = [80, 1.4, 12];
const INTERIOR_ORIGIN_SIGTOWER: readonly [number, number, number] = [100, 1.4, 0];

export const INTERIOR_ORIGINS = {
  "eb3::0::board-am": INTERIOR_ORIGIN_EB3_F1,
  "eb3::1::board-pm": INTERIOR_ORIGIN_EB3_F2,
  "signature-tower::0::executive-lunch": INTERIOR_ORIGIN_SIGTOWER,
} as const;

// Interior camera — closer, more head-on framing.
function interiorFrame(origin: readonly [number, number, number]): CameraState {
  return {
    position: [origin[0] + 4.5, origin[1] + 4.2, origin[2] + 4.8],
    rotation: [0, 0, 0],
    target: [origin[0], origin[1], origin[2]],
    zoom: 4.8,
  };
}

// ---------------- EB3 — last east wing block, position (3.75, _, 3.6) ----------------

const EB3_X = 3.75;
const EB3_Z = 3.6;

export const BUILDING_EB3: BuildingSpec = {
  id: "eb3",
  name: "EB3",
  subtitle: "Board Rooms",
  accent: "#f4a3c1",
  camera: fromTarget([EB3_X, 1.1, EB3_Z], 2.05),
  markerPosition: [EB3_X, 1.8, EB3_Z],
  floors: [
    {
      index: 0,
      label: "Floor 1",
      name: "Board Room AM",
      camera: fromTarget([EB3_X, 0.35, EB3_Z], 2.4),
      rooms: [
        {
          id: "board-am",
          name: "Board Room AM",
          session: "Morning Leadership Board",
          host: "Executive Council",
          time: "09:30 — 12:30",
          capacity: "18 seats",
          interior: interiorFrame(INTERIOR_ORIGIN_EB3_F1),
        },
      ],
    },
    {
      index: 1,
      label: "Floor 2",
      name: "Board Room PM",
      camera: fromTarget([EB3_X, 0.73, EB3_Z], 2.4),
      rooms: [
        {
          id: "board-pm",
          name: "Board Room PM",
          session: "Afternoon Strategy Board",
          host: "Executive Council",
          time: "14:00 — 17:30",
          capacity: "18 seats",
          interior: interiorFrame(INTERIOR_ORIGIN_EB3_F2),
        },
      ],
    },
  ],
};

// ---------------- Signature Tower — the crowned tower on the Central Spine ----------------

const SPINE_LEN = 12.4;
const TOWER_X = 0;
const TOWER_Z = -SPINE_LEN / 2 - 0.2; // matches Tower placement in CentralSpine

export const BUILDING_SIGNATURE_TOWER: BuildingSpec = {
  id: "signature-tower",
  name: "Signature Tower",
  subtitle: "Executive Lunch",
  accent: "#f4a3c1",
  camera: fromTarget([TOWER_X, 4.0, TOWER_Z], 1.55),
  markerPosition: [TOWER_X, 8.4, TOWER_Z],
  floors: [
    {
      index: 0,
      label: "Crown",
      name: "Executive Lounge",
      camera: fromTarget([TOWER_X, 6.0, TOWER_Z], 1.85),
      rooms: [
        {
          id: "executive-lunch",
          name: "Executive Lounge",
          session: "Executive Lunch",
          host: "Office of the CEO",
          time: "13:00 — 14:15",
          capacity: "24 seats",
          interior: interiorFrame(INTERIOR_ORIGIN_SIGTOWER),
        },
      ],
    },
  ],
};

// ---------------- Registry ----------------

export const BUILDINGS: Record<BuildingId, BuildingSpec> = {
  eb3: BUILDING_EB3,
  "signature-tower": BUILDING_SIGNATURE_TOWER,
};

export const BUILDING_ORDER: BuildingId[] = ["eb3", "signature-tower"];

export type InteriorKey = keyof typeof INTERIOR_ORIGINS;

export function interiorKey(
  building: BuildingId,
  floor: number,
  roomId: string,
): InteriorKey | null {
  const key = `${building}::${floor}::${roomId}`;
  return (key in INTERIOR_ORIGINS ? key : null) as InteriorKey | null;
}
