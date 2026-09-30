import type { CameraState } from "@/lib/camera";

/**
 * PHASE 5 — the single source of truth for every "place" in the campus.
 *
 * Each stop describes both the CAMERA and the HOTSPOT for that place. Nothing
 * else in the app hardcodes location info: components pull from here.
 *
 * Camera rig: shared isometric-ish offset from `target` (dx=+9, dy=+11, dz=+11).
 * `zoom` controls how tight the overhead/orthographic frame is (1 ≈ overview).
 *
 * `hotspotPosition` may differ from `cameraTarget` — the marker can sit on the
 * roof of a building even while the camera looks at the ground below it.
 */

export type AgendaMeta = {
  step: string;
  title: string;
  time: string;
  host: string;
  tags: readonly string[];
  desc: string;
};

export type LocationStat = {
  label: string;
  value: string;
};

export type LocationCategory = "gateway" | "public" | "core" | "wing" | "civic" | "landscape";

export type CampusLocation = {
  id: string;
  name: string;
  shortName: string;
  index: number;
  description: string;
  camera: CameraState;
  /** World-space anchor for the hotspot marker (may differ from cameraTarget). */
  hotspotPosition: readonly [number, number, number];
  category: LocationCategory;
  /** Accent colour swatch used for the active building highlight + UI tint. */
  accent: string;
  agenda: AgendaMeta;
  statistics?: LocationStat[];
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
    id: "entrance",
    name: "Campus Entrance",
    shortName: "Entrance",
    index: 0,
    description:
      "Approach the campus through the tree-lined entry road. Collect your pass at reception and take in the full campus from the overview.",
    camera: from([0, 2.0, 2], 0.78),
    hotspotPosition: [0, 0.05, 13.5],
    category: "gateway",
    accent: "#f4a3c1",
    agenda: {
      step: "01",
      title: "Arrival & Welcome",
      time: "09:00 — 09:45",
      host: "Guest Relations",
      tags: ["Check-in", "Welcome"],
      desc: "Approach the campus through the tree-lined entry road. Collect your pass at reception and take in the full campus from the overview.",
    },
    statistics: [
      { label: "Site area", value: "42 ha" },
      { label: "Access", value: "Tree-lined boulevard" },
    ],
  },
  {
    id: "main-plaza",
    name: "Main Plaza",
    shortName: "Plaza",
    index: 1,
    description:
      "The circular plaza at the heart of campus, wrapped by the lake and lined with palms. Coffee, croissants, and the first hellos.",
    camera: from([0, 0.3, 6.5], 1.55),
    hotspotPosition: [0, 0.05, 6.5],
    category: "public",
    accent: "#7cc4c4",
    agenda: {
      step: "02",
      title: "Opening & Breakfast",
      time: "09:45 — 10:15",
      host: "Campus Team",
      tags: ["Welcome", "Networking"],
      desc: "The circular plaza at the heart of campus, wrapped by the lake and lined with palms. Coffee, croissants, and the first hellos.",
    },
    statistics: [
      { label: "Diameter", value: "42 m" },
      { label: "Water body", value: "Palm ring" },
    ],
  },
  {
    id: "central-spine",
    name: "Central Spine",
    shortName: "Spine",
    index: 2,
    description:
      "The architectural heart of the campus — the glass atrium and tiered roof canopy connect the whole site, with the crowned tower rising behind. Where the strategy for the next twelve months gets set.",
    camera: from([0, 1.6, -1.2], 1.3),
    hotspotPosition: [0, 2.4, -1.2],
    category: "core",
    accent: "#3f8a94",
    agenda: {
      step: "03",
      title: "Leadership Keynote",
      time: "10:30 — 11:45",
      host: "Executive Leadership",
      tags: ["Keynote", "Vision"],
      desc: "The architectural heart of the campus — the glass atrium and tiered roof canopy connect the whole site, with the crowned tower rising behind. Where the strategy for the next twelve months gets set.",
    },
    statistics: [
      { label: "Length", value: "124 m" },
      { label: "Tower", value: "8 storeys" },
    ],
  },
  {
    id: "innovation-hub",
    name: "Innovation Hub",
    shortName: "Innovation",
    index: 3,
    description:
      "The east wing — where the next products take shape. Live demos, hands-on prototypes, and an open floor for questions.",
    camera: from([4.4, 0.9, 0], 1.65),
    hotspotPosition: [4.4, 1.6, 0],
    category: "wing",
    accent: "#7cc4c4",
    agenda: {
      step: "04",
      title: "Innovation & Demos",
      time: "12:00 — 13:15",
      host: "Product & Growth",
      tags: ["Demos", "Innovation"],
      desc: "The east wing — where the next products take shape. Live demos, hands-on prototypes, and an open floor for questions.",
    },
    statistics: [
      { label: "Wings", value: "4 buildings" },
      { label: "Labs", value: "12 spaces" },
    ],
  },
  {
    id: "academic-blocks",
    name: "Academic Blocks",
    shortName: "Academic",
    index: 4,
    description:
      "The west wing — studios, labs, and classrooms fanning out from the spine. How the platform is built, shipped, and kept reliable.",
    camera: from([-4.4, 0.9, 0], 1.65),
    hotspotPosition: [-4.4, 1.6, 0],
    category: "wing",
    accent: "#7cc4c4",
    agenda: {
      step: "05",
      title: "Engineering at Scale",
      time: "14:15 — 15:45",
      host: "Engineering",
      tags: ["Engineering", "Platform"],
      desc: "The west wing — studios, labs, and classrooms fanning out from the spine. How the platform is built, shipped, and kept reliable.",
    },
    statistics: [
      { label: "Wings", value: "4 buildings" },
      { label: "Studios", value: "18 rooms" },
    ],
  },
  {
    id: "residential-zone",
    name: "Residential Zone",
    shortName: "Residential",
    index: 5,
    description:
      "A quiet crescent by its own lake — where residents live, gather, and unwind. The rituals and traditions that make the campus feel like home.",
    camera: from([10, 0.8, -4], 1.5),
    hotspotPosition: [10, 1.2, -4],
    category: "landscape",
    accent: "#f4a3c1",
    agenda: {
      step: "06",
      title: "Culture & Community",
      time: "16:00 — 17:00",
      host: "People Team",
      tags: ["Culture", "Community"],
      desc: "A quiet crescent by its own lake — where residents live, gather, and unwind. The rituals and traditions that make the campus feel like home.",
    },
    statistics: [
      { label: "Residences", value: "5 crescents" },
      { label: "Lake", value: "Private kidney" },
    ],
  },
  {
    id: "auditorium",
    name: "Auditorium",
    shortName: "Auditorium",
    index: 6,
    description:
      "Everyone gathers under the arched roof. A last thank-you, one big photograph, and the walk back into the plaza as the campus lights come on.",
    camera: from([0, 0.7, 10.2], 1.75),
    hotspotPosition: [0, 1.3, 11],
    category: "civic",
    accent: "#3f8a94",
    agenda: {
      step: "07",
      title: "Closing Address",
      time: "17:30 — 18:30",
      host: "Executive Leadership",
      tags: ["Closing", "Together"],
      desc: "Everyone gathers under the arched roof. A last thank-you, one big photograph, and the walk back into the plaza as the campus lights come on.",
    },
    statistics: [
      { label: "Capacity", value: "620 seats" },
      { label: "Roof", value: "Arched shell" },
    ],
  },
];

export const N_STOPS = CAMPUS_LOCATIONS.length;

export function locationById(id: string): CampusLocation | undefined {
  return CAMPUS_LOCATIONS.find((l) => l.id === id);
}
