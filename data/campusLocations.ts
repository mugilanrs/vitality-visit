import type { CameraState } from "@/lib/camera";

/**
 * The 7-stop journey through the Vitality campus, tuned for the ORTHOGRAPHIC
 * camera.
 *
 * All positions share a consistent isometric-ish angle: the camera sits above
 * and to the south-east of its target so we always see the same "printed
 * masterplan" three-quarter angle. Only `target` (what it points at) and
 * `zoom` (how tight) change between stops. This keeps transitions cinematic —
 * the camera glides across the site instead of jumping angles.
 *
 * Camera offset from target (world units): dx=+9, dy=+11, dz=+11.
 * Zoom: 1 = overview, ~1.9 = tight per-building.
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

// Camera rig: from target `t`, place camera at t + OFFSET.
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
    camera: from([0, 0.5, 2], 0.95),
    agenda: {
      step: "01",
      title: "Arrival & Welcome",
      time: "09:00 — 09:45",
      host: "Guest Relations",
      tags: ["Check-in", "Welcome"],
      desc: "Approach the campus through the tree-lined entry road. Collect your pass at reception and take in the full campus from the overview.",
    },
  },
  {
    id: "main-plaza",
    name: "Main Plaza",
    camera: from([0, 0.3, 6.5], 1.55),
    agenda: {
      step: "02",
      title: "Opening & Breakfast",
      time: "09:45 — 10:15",
      host: "Campus Team",
      tags: ["Welcome", "Networking"],
      desc: "The circular plaza at the heart of campus, wrapped by the lake and lined with palms. Coffee, croissants, and the first hellos.",
    },
  },
  {
    id: "central-spine",
    name: "Central Spine",
    camera: from([0, 1.6, -1.2], 1.3),
    agenda: {
      step: "03",
      title: "Leadership Keynote",
      time: "10:30 — 11:45",
      host: "Executive Leadership",
      tags: ["Keynote", "Vision"],
      desc: "The architectural heart of the campus — the glass atrium and tiered roof canopy connect the whole site, with the crowned tower rising behind. Where the strategy for the next twelve months gets set.",
    },
  },
  {
    id: "innovation-hub",
    name: "Innovation Hub",
    camera: from([4.4, 0.9, 0], 1.65),
    agenda: {
      step: "04",
      title: "Innovation & Demos",
      time: "12:00 — 13:15",
      host: "Product & Growth",
      tags: ["Demos", "Innovation"],
      desc: "The east wing — where the next products take shape. Live demos, hands-on prototypes, and an open floor for questions.",
    },
  },
  {
    id: "academic-blocks",
    name: "Academic Blocks",
    camera: from([-4.4, 0.9, 0], 1.65),
    agenda: {
      step: "05",
      title: "Engineering at Scale",
      time: "14:15 — 15:45",
      host: "Engineering",
      tags: ["Engineering", "Platform"],
      desc: "The west wing — studios, labs, and classrooms fanning out from the spine. How the platform is built, shipped, and kept reliable.",
    },
  },
  {
    id: "residential-zone",
    name: "Residential Zone",
    camera: from([10, 0.8, -4], 1.5),
    agenda: {
      step: "06",
      title: "Culture & Community",
      time: "16:00 — 17:00",
      host: "People Team",
      tags: ["Culture", "Community"],
      desc: "A quiet crescent by its own lake — where residents live, gather, and unwind. The rituals and traditions that make the campus feel like home.",
    },
  },
  {
    id: "auditorium",
    name: "Auditorium",
    camera: from([0, 0.7, 10.2], 1.75),
    agenda: {
      step: "07",
      title: "Closing Address",
      time: "17:30 — 18:30",
      host: "Executive Leadership",
      tags: ["Closing", "Together"],
      desc: "Everyone gathers under the arched roof. A last thank-you, one big photograph, and the walk back into the plaza as the campus lights come on.",
    },
  },
];

export const N_STOPS = CAMPUS_LOCATIONS.length;
