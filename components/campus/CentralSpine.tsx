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
} from "@/lib/materials";
import { spineLeafShape } from "@/lib/geometry";

/**
 * The Central Spine — the campus's most important architectural element.
 *
 * Composition, from ground up:
 *   1. Long leaf-shaped concrete plinth running N–S
 *   2. Glass atrium slab set into the plinth (teal, tall enough to read as a
 *      building, not a floor decal)
 *   3. Landscape / water strip running down the very centre of the atrium
 *   4. Symmetric tiered white roof canopy — two extruded leaf plans stacked
 *      with the upper one slightly narrower, so the roof reads as layered
 *   5. Structural ribs (thin metal) crossing the atrium at regular intervals,
 *      like a covered walkway
 *   6. Tower rising from the north end
 */

const SPINE_LEN = 9.2;
const SPINE_WID = 1.9;

export default function CentralSpine() {
  const outerLeaf = useMemo(() => spineLeafShape(SPINE_LEN, SPINE_WID), []);
  const innerLeaf = useMemo(() => spineLeafShape(SPINE_LEN * 0.94, SPINE_WID * 0.75), []);
  const glassLeaf = useMemo(() => spineLeafShape(SPINE_LEN * 0.86, SPINE_WID * 0.62), []);
  const waterLeaf = useMemo(() => spineLeafShape(SPINE_LEN * 0.7, SPINE_WID * 0.22), []);

  return (
    <group>
      {/* Concrete plinth (very low, just to visually seat the spine) */}
      <mesh
        castShadow
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.05, 0]}
        material={M_CONCRETE_LIGHT}
      >
        <extrudeGeometry
          args={[outerLeaf, { depth: 0.1, bevelEnabled: false, steps: 1 }]}
        />
      </mesh>

      {/* Glass atrium — tall enough to read as a real building */}
      <mesh
        castShadow
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.16, 0]}
        material={M_TEAL_GLASS}
      >
        <extrudeGeometry
          args={[glassLeaf, { depth: 1.3, bevelEnabled: false, steps: 1 }]}
        />
      </mesh>

      {/* Central water/landscape strip in the atrium floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.19, 0]}
        material={M_WATER}
      >
        <extrudeGeometry
          args={[waterLeaf, { depth: 0.02, bevelEnabled: false, steps: 1 }]}
        />
      </mesh>

      {/* Deep-teal glass wall band along the sides — a strong architectural line */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.18, 0]}
        material={M_TEAL_GLASS_DEEP}
      >
        <extrudeGeometry
          args={[
            new THREE.Shape().setFromPoints(glassLeaf.getPoints()),
            { depth: 0.08, bevelEnabled: false, steps: 1 },
          ]}
        />
      </mesh>

      {/* Structural ribs — one every ~0.6u along the spine, forming a covered walkway */}
      {Array.from({ length: 14 }).map((_, i) => {
        const zRatio = i / 13;
        const z = -SPINE_LEN / 2 + zRatio * SPINE_LEN * 0.94 + SPINE_LEN * 0.03;
        // Ribs are narrower toward the ends (matches the leaf pinch)
        const pinch = 1 - 0.55 * Math.pow(Math.abs(zRatio - 0.5) * 2, 2);
        const width = (SPINE_WID * 0.62 + 0.1) * pinch;
        return (
          <mesh
            key={i}
            castShadow
            position={[0, 1.45, z]}
            material={M_METAL_DARK}
          >
            <boxGeometry args={[width, 0.05, 0.05]} />
          </mesh>
        );
      })}

      {/* Roof canopy — lower tier (wider) */}
      <mesh
        castShadow
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 1.55, 0]}
        material={M_ROOF_RIM}
      >
        <extrudeGeometry
          args={[outerLeaf, { depth: 0.05, bevelEnabled: false, steps: 1 }]}
        />
      </mesh>

      {/* Roof canopy — upper tier (narrower, sits ~0.1 above), white shell */}
      <mesh
        castShadow
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 1.68, 0]}
        material={M_ROOF_WHITE}
      >
        <extrudeGeometry
          args={[
            innerLeaf,
            {
              depth: 0.14,
              bevelEnabled: true,
              bevelSize: 0.02,
              bevelThickness: 0.02,
              bevelSegments: 1,
              steps: 1,
            },
          ]}
        />
      </mesh>

      {/* Roof spine ridge — a thin raised line down the centre of the canopy */}
      <mesh position={[0, 1.88, 0]} castShadow material={M_ROOF_WHITE}>
        <boxGeometry args={[0.14, 0.08, SPINE_LEN * 0.9]} />
      </mesh>

      {/* Tower rising from the north end */}
      <group position={[0, 0, -SPINE_LEN / 2 - 0.4]}>
        <Tower height={7.2} />
      </group>
    </group>
  );
}
