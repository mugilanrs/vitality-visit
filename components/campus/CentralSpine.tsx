"use client";

import { useMemo } from "react";
import * as THREE from "three";
import Tower from "./Tower";
import {
  M_WHITE_SHELL,
  M_ROOF_WHITE,
  M_ROOF_RIM,
  M_TEAL_GLASS,
  M_TEAL_GLASS_DEEP,
  M_CONCRETE_LIGHT,
  M_WATER,
  M_METAL_DARK,
  M_GRASS,
} from "@/lib/materials";
import { spineLeafShape } from "@/lib/geometry";
import { SPINE_LEN as SPINE_LEN_SHARED, TOWER_HEIGHT } from "@/data/buildings";

/**
 * The Central Spine — the dominant campus landmark.
 *
 * Massing goals (per the Phase 2 refinement brief):
 *   - long linear central axis
 *   - elongated glass atrium
 *   - large white aerodynamic roof structure
 *   - three-tier layered canopy geometry
 *   - visible internal landscaped corridor
 *   - strong symmetry, tapered ends
 *   - tower rising at the north end, visually connected
 *
 * Composition (ground → sky):
 *   1. Long tapered concrete plinth (leaf plan, very low)
 *   2. Landscape strip inside the plinth: grass + linear water channel
 *   3. Concourse walls: two thin white walls flanking the landscape
 *   4. Glass atrium mass: tall teal glass volume set between the walls
 *   5. Structural fins crossing the atrium at intervals (visible from above)
 *   6. Three-tier roof canopy:
 *        a. wide flat rim (widest, thin)
 *        b. main white shell (medium, aerodynamic sweep)
 *        c. upper white ridge (narrowest, thin)
 *   7. Tower at the north end
 */

// Kept in sync with the data-registry constants so tower positioning and
// marker anchoring agree with what CentralSpine actually renders.
const SPINE_LEN = SPINE_LEN_SHARED;
const SPINE_WID = 2.2;         // slightly wider so it reads as a real building
const WALL_HEIGHT = 1.9;       // atrium wall height
const ROOF_Y = 2.05;           // where the roof starts

export default function CentralSpine() {
  // Progressively narrower shapes for the three roof tiers + wall bands.
  const plinth = useMemo(() => spineLeafShape(SPINE_LEN, SPINE_WID, 0.5), []);
  const concourse = useMemo(() => spineLeafShape(SPINE_LEN * 0.94, SPINE_WID * 0.82, 0.55), []);
  const atrium = useMemo(() => spineLeafShape(SPINE_LEN * 0.86, SPINE_WID * 0.55, 0.6), []);
  const landscape = useMemo(() => spineLeafShape(SPINE_LEN * 0.82, SPINE_WID * 0.35, 0.55), []);
  const waterChannel = useMemo(() => spineLeafShape(SPINE_LEN * 0.72, SPINE_WID * 0.14, 0.65), []);
  const roofRim = useMemo(() => spineLeafShape(SPINE_LEN * 1.02, SPINE_WID * 1.02, 0.5), []);
  const roofMain = useMemo(() => spineLeafShape(SPINE_LEN * 0.94, SPINE_WID * 0.78, 0.55), []);
  const roofUpper = useMemo(() => spineLeafShape(SPINE_LEN * 0.7, SPINE_WID * 0.32, 0.6), []);
  const roofRidge = useMemo(() => spineLeafShape(SPINE_LEN * 0.55, SPINE_WID * 0.14, 0.65), []);

  return (
    <group>
      {/* 1. Concrete plinth */}
      <mesh
        castShadow
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, 0]}
        material={M_CONCRETE_LIGHT}
      >
        <extrudeGeometry
          args={[plinth, { depth: 0.1, bevelEnabled: false, steps: 1 }]}
        />
      </mesh>

      {/* 2a. Grass landscape strip inside the concourse */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.155, 0]}
        material={M_GRASS}
      >
        <extrudeGeometry
          args={[landscape, { depth: 0.02, bevelEnabled: false, steps: 1 }]}
        />
      </mesh>

      {/* 2b. Linear water channel running the full spine */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.176, 0]}
        material={M_WATER}
      >
        <extrudeGeometry
          args={[waterChannel, { depth: 0.02, bevelEnabled: false, steps: 1 }]}
        />
      </mesh>

      {/* 3. Two thin concourse "walls" flanking the landscape (the outer white
          rails you see running the length of the spine) */}
      <mesh
        castShadow
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.14, 0]}
        material={M_WHITE_SHELL}
      >
        <extrudeGeometry
          args={[concourse, { depth: 0.28, bevelEnabled: false, steps: 1 }]}
        />
      </mesh>
      {/* Cut the concourse hollow visually by placing a slightly narrower
          plinth on top (reads as inset atrium floor) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.14, 0]}
        material={M_CONCRETE_LIGHT}
      >
        <extrudeGeometry
          args={[atrium, { depth: 0.02, bevelEnabled: false, steps: 1 }]}
        />
      </mesh>

      {/* 4. Glass atrium mass — the tall teal glass volume */}
      <mesh
        castShadow
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.16, 0]}
        material={M_TEAL_GLASS}
      >
        <extrudeGeometry
          args={[atrium, { depth: WALL_HEIGHT, bevelEnabled: false, steps: 1 }]}
        />
      </mesh>

      {/* Thin deep-teal band at the top of the glass, just under the roof rim */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, WALL_HEIGHT + 0.16, 0]}
        material={M_TEAL_GLASS_DEEP}
      >
        <extrudeGeometry
          args={[atrium, { depth: 0.05, bevelEnabled: false, steps: 1 }]}
        />
      </mesh>

      {/* 5. Structural fins crossing the atrium (thin metal ribs at intervals) */}
      {Array.from({ length: 22 }).map((_, i) => {
        const t = i / 21;
        const zBase = -SPINE_LEN / 2 + t * SPINE_LEN * 0.92 + SPINE_LEN * 0.04;
        // Narrower toward ends (matches the atrium pinch)
        const pinch = 1 - 0.7 * Math.pow(Math.abs(t - 0.5) * 2, 2.6);
        const width = SPINE_WID * 0.55 * pinch;
        if (width < 0.08) return null;
        return (
          <mesh
            key={i}
            castShadow
            position={[0, WALL_HEIGHT + 0.02, zBase]}
            material={M_METAL_DARK}
          >
            <boxGeometry args={[width + 0.08, 0.05, 0.05]} />
          </mesh>
        );
      })}

      {/* 6a. Roof tier — wide flat RIM (thinnest tier, widest plan) */}
      <mesh
        castShadow
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, ROOF_Y, 0]}
        material={M_ROOF_RIM}
      >
        <extrudeGeometry
          args={[roofRim, { depth: 0.04, bevelEnabled: false, steps: 1 }]}
        />
      </mesh>

      {/* 6b. Roof tier — MAIN aerodynamic white shell (medium plan) */}
      <mesh
        castShadow
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, ROOF_Y + 0.06, 0]}
        material={M_ROOF_WHITE}
      >
        <extrudeGeometry
          args={[
            roofMain,
            {
              depth: 0.08,
              bevelEnabled: true,
              bevelSize: 0.02,
              bevelThickness: 0.02,
              bevelSegments: 1,
              steps: 1,
            },
          ]}
        />
      </mesh>

      {/* 6c. Roof tier — UPPER narrower shell (creates the layered look) */}
      <mesh
        castShadow
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, ROOF_Y + 0.18, 0]}
        material={M_ROOF_WHITE}
      >
        <extrudeGeometry
          args={[
            roofUpper,
            {
              depth: 0.06,
              bevelEnabled: true,
              bevelSize: 0.015,
              bevelThickness: 0.015,
              bevelSegments: 1,
              steps: 1,
            },
          ]}
        />
      </mesh>

      {/* 6d. Roof RIDGE — narrowest, sits highest */}
      <mesh
        castShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, ROOF_Y + 0.28, 0]}
        material={M_ROOF_WHITE}
      >
        <extrudeGeometry
          args={[roofRidge, { depth: 0.06, bevelEnabled: false, steps: 1 }]}
        />
      </mesh>

      {/* 7. Tower at the north end of the spine. Height is imported from the
             data registry so the tower marker (data/buildings.ts:markerPosition)
             sits exactly at the crown tip. */}
      <group position={[0, 0, -SPINE_LEN / 2 - 0.2]}>
        <Tower height={TOWER_HEIGHT} />
      </group>
    </group>
  );
}
