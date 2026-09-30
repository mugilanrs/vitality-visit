"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  M_WHITE_SHELL,
  M_ROOF_WHITE,
  M_ROOF_RIM,
  M_TEAL_GLASS,
  M_TEAL_GLASS_DEEP,
  M_CONCRETE_LIGHT,
  M_METAL_DARK,
} from "@/lib/materials";
import { curvedFloorPlan, canopyRoofPlan } from "@/lib/geometry";

/**
 * Reusable wing building. Configured via props.
 *
 * Composition (from ground up):
 *   1. Plinth        — narrow concrete slab, ~0.15u tall
 *   2. Floor slabs   — alternating white shells + teal glass bands per floor;
 *                       each glass band is inset a hair so slabs cast a shadow line
 *   3. Vertical fins — thin white strips running the full building height,
 *                       spaced across the long facade for structural rhythm
 *   4. Roof canopy   — extruded curved-plan slab that overhangs the top floor
 *                       (front sweep visible from above per the reference)
 *   5. Rim           — thin darker line just under the canopy
 */

type Props = {
  width?: number;
  depth?: number;
  floors?: number;
  floorHeight?: number;
  /** 'curved' extrudes a curved-plan footprint; 'rect' uses a box. */
  plan?: "curved" | "rect";
  /** How far the canopy overhangs. */
  canopyOverhang?: number;
  /** Fin count across the long (width) side. */
  fins?: number;
};

export default function CampusBuilding({
  width = 3.0,
  depth = 1.6,
  floors = 4,
  floorHeight = 0.42,
  plan = "curved",
  canopyOverhang = 0.28,
  fins = 8,
}: Props) {
  const bodyShape = useMemo(
    () => (plan === "curved" ? curvedFloorPlan(width, depth, 0.32) : null),
    [plan, width, depth],
  );
  const canopyShape = useMemo(
    () => canopyRoofPlan(width, depth, canopyOverhang),
    [width, depth, canopyOverhang],
  );

  const bodyHeight = floors * floorHeight;

  return (
    <group>
      {/* Plinth */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0.08, depth / 2]}
        material={M_CONCRETE_LIGHT}
      >
        <boxGeometry args={[width + 0.25, 0.16, depth + 0.3]} />
      </mesh>

      {/* Body — either extruded curved plan or plain box */}
      {plan === "curved" && bodyShape ? (
        <mesh
          castShadow
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.16, 0]}
          material={M_WHITE_SHELL}
        >
          <extrudeGeometry
            args={[
              bodyShape,
              { depth: bodyHeight, bevelEnabled: false, steps: 1 },
            ]}
          />
        </mesh>
      ) : (
        <mesh
          castShadow
          receiveShadow
          position={[0, bodyHeight / 2 + 0.16, depth / 2]}
          material={M_WHITE_SHELL}
        >
          <boxGeometry args={[width, bodyHeight, depth]} />
        </mesh>
      )}

      {/* Glass floor bands — one per floor, inset slightly */}
      {Array.from({ length: floors }).map((_, i) => {
        const y = 0.16 + i * floorHeight + floorHeight * 0.55;
        const glassMat = i === 0 ? M_TEAL_GLASS_DEEP : M_TEAL_GLASS;
        // Along the long facade (front, +z)
        return (
          <group key={i}>
            <mesh
              castShadow
              position={[0, y, depth + 0.001]}
              material={glassMat}
            >
              <boxGeometry
                args={[width * 0.92, floorHeight * 0.55, 0.03]}
              />
            </mesh>
            {/* Rear-facing glass band (much shorter reveal, cheaper look) */}
            <mesh position={[0, y, -0.001]} material={glassMat}>
              <boxGeometry args={[width * 0.9, floorHeight * 0.5, 0.02]} />
            </mesh>
            {/* Side glass reveals */}
            <mesh
              position={[width / 2 + 0.001, y, depth * 0.5]}
              material={glassMat}
            >
              <boxGeometry args={[0.02, floorHeight * 0.55, depth * 0.65]} />
            </mesh>
            <mesh
              position={[-(width / 2) - 0.001, y, depth * 0.5]}
              material={glassMat}
            >
              <boxGeometry args={[0.02, floorHeight * 0.55, depth * 0.65]} />
            </mesh>
          </group>
        );
      })}

      {/* Structural fins — thin verticals across the front facade */}
      {Array.from({ length: fins }).map((_, i) => {
        const x = (i / (fins - 1)) * width - width / 2;
        return (
          <mesh
            key={i}
            castShadow
            position={[x, 0.16 + bodyHeight / 2, depth + 0.02]}
            material={M_WHITE_SHELL}
          >
            <boxGeometry args={[0.06, bodyHeight, 0.05]} />
          </mesh>
        );
      })}

      {/* Roof rim (thin dark line just under the canopy) */}
      <mesh
        position={[0, 0.16 + bodyHeight + 0.005, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={M_ROOF_RIM}
      >
        <extrudeGeometry
          args={[
            canopyShape,
            { depth: 0.03, bevelEnabled: false, steps: 1 },
          ]}
        />
      </mesh>

      {/* Curved white roof canopy */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0.16 + bodyHeight + 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={M_ROOF_WHITE}
      >
        <extrudeGeometry
          args={[
            canopyShape,
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

      {/* Under-canopy metal support struts (visible from the side) */}
      {[
        [-width / 2 + 0.2, depth + canopyOverhang - 0.15],
        [width / 2 - 0.2, depth + canopyOverhang - 0.15],
      ].map((p, i) => (
        <mesh
          key={i}
          position={[p[0], 0.16 + bodyHeight + 0.02, p[1] as number]}
          material={M_METAL_DARK}
        >
          <cylinderGeometry args={[0.02, 0.02, 0.14, 6]} />
        </mesh>
      ))}
    </group>
  );
}
