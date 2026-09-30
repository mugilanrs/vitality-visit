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
 * Reusable wing building — Phase 2 refined massing.
 *
 * Key massing moves:
 *   - Real floor separation: each floor is a wide white slab (structural band)
 *     with a RECESSED teal-glass storey between slabs. The slabs project
 *     slightly beyond the glass so shadows read as horizontal bands.
 *   - Thin roof: a single elongated cantilever slab, not a chunky mesh, that
 *     visually floats above the top floor.
 *   - Vertical fins on the long facade for facade rhythm.
 *   - Curved plan footprint on the front (+z) facade.
 */

type Props = {
  width?: number;
  depth?: number;
  floors?: number;
  floorHeight?: number;
  /** 'curved' extrudes a curved-plan footprint; 'rect' uses a box. */
  plan?: "curved" | "rect";
  /** How far the canopy overhangs beyond the base. */
  canopyOverhang?: number;
  /** Fin count across the long (width) side. */
  fins?: number;
  /** Variant: 'default' (glass front) or 'stacked' (alternating deep-teal). */
  variant?: "default" | "stacked";
};

export default function CampusBuilding({
  width = 3.2,
  depth = 1.7,
  floors = 5,
  floorHeight = 0.38,
  plan = "curved",
  canopyOverhang = 0.45,
  fins = 9,
  variant = "default",
}: Props) {
  const bodyShape = useMemo(
    () => (plan === "curved" ? curvedFloorPlan(width, depth, 0.28) : null),
    [plan, width, depth],
  );
  // Slightly inset shape for the recessed glass mass
  const glassShape = useMemo(
    () => (plan === "curved" ? curvedFloorPlan(width - 0.18, depth - 0.16, 0.26) : null),
    [plan, width, depth],
  );
  const canopyShape = useMemo(
    () => canopyRoofPlan(width, depth, canopyOverhang),
    [width, depth, canopyOverhang],
  );

  const bodyHeight = floors * floorHeight;
  const slabThickness = 0.06;
  const glassInset = 0.09; // how far the glass is recessed from the outer wall

  return (
    <group>
      {/* Plinth */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0.08, depth / 2]}
        material={M_CONCRETE_LIGHT}
      >
        <boxGeometry args={[width + 0.35, 0.16, depth + 0.35]} />
      </mesh>

      {/* Recessed GLASS MASS — sits inside the outer wall envelope.
          One tall extrude, so glass is visible between the horizontal slabs. */}
      {plan === "curved" && glassShape ? (
        <mesh
          castShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.16, 0.02]}
          material={variant === "stacked" ? M_TEAL_GLASS_DEEP : M_TEAL_GLASS}
        >
          <extrudeGeometry
            args={[
              glassShape,
              { depth: bodyHeight, bevelEnabled: false, steps: 1 },
            ]}
          />
        </mesh>
      ) : (
        <mesh
          castShadow
          position={[0, bodyHeight / 2 + 0.16, depth / 2 - 0.09]}
          material={M_TEAL_GLASS}
        >
          <boxGeometry args={[width - 0.18, bodyHeight, depth - 0.18]} />
        </mesh>
      )}

      {/* WHITE FLOOR SLABS — one per floor, projecting slightly beyond the
          glass to catch shadow */}
      {plan === "curved" && bodyShape ? (
        Array.from({ length: floors + 1 }).map((_, i) => {
          const y = 0.16 + i * floorHeight;
          const isCap = i === 0 || i === floors;
          return (
            <mesh
              key={`slab-${i}`}
              castShadow
              receiveShadow
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, y, 0]}
              material={M_WHITE_SHELL}
            >
              <extrudeGeometry
                args={[
                  bodyShape,
                  { depth: isCap ? slabThickness * 1.5 : slabThickness, bevelEnabled: false, steps: 1 },
                ]}
              />
            </mesh>
          );
        })
      ) : null}

      {/* Deep-teal accent band on every other floor when variant="stacked" */}
      {variant === "stacked" &&
        Array.from({ length: floors }).map((_, i) => {
          if (i % 2 !== 0) return null;
          const y = 0.16 + i * floorHeight + floorHeight * 0.4;
          return (
            <mesh
              key={`accent-${i}`}
              position={[0, y, depth + 0.001]}
              material={M_TEAL_GLASS_DEEP}
            >
              <boxGeometry args={[width * 0.86, floorHeight * 0.2, 0.03]} />
            </mesh>
          );
        })}

      {/* VERTICAL FINS across the front facade — thin white verticals from
          plinth to top slab, sitting slightly outside the glass */}
      {Array.from({ length: fins }).map((_, i) => {
        const x = (i / (fins - 1)) * width - width / 2;
        return (
          <mesh
            key={`fin-${i}`}
            castShadow
            position={[x, 0.16 + bodyHeight / 2, depth - glassInset + 0.02]}
            material={M_WHITE_SHELL}
          >
            <boxGeometry args={[0.05, bodyHeight, 0.05]} />
          </mesh>
        );
      })}

      {/* THIN cantilever roof canopy — single thin slab that floats above */}
      <mesh
        castShadow
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.16 + bodyHeight + 0.09, 0]}
        material={M_ROOF_WHITE}
      >
        <extrudeGeometry
          args={[
            canopyShape,
            {
              depth: 0.04,
              bevelEnabled: true,
              bevelSize: 0.01,
              bevelThickness: 0.01,
              bevelSegments: 1,
              steps: 1,
            },
          ]}
        />
      </mesh>

      {/* Roof rim — a thin darker line right under the canopy edge */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.16 + bodyHeight + 0.08, 0]}
        material={M_ROOF_RIM}
      >
        <extrudeGeometry
          args={[
            canopyShape,
            { depth: 0.015, bevelEnabled: false, steps: 1 },
          ]}
        />
      </mesh>

      {/* Under-canopy support struts */}
      {[
        [-width / 2 + 0.3, depth + canopyOverhang - 0.2],
        [0, depth + canopyOverhang - 0.15],
        [width / 2 - 0.3, depth + canopyOverhang - 0.2],
      ].map((p, i) => (
        <mesh
          key={`strut-${i}`}
          position={[p[0], 0.16 + bodyHeight + 0.05, p[1] as number]}
          material={M_METAL_DARK}
        >
          <cylinderGeometry args={[0.018, 0.018, 0.1, 6]} />
        </mesh>
      ))}
    </group>
  );
}
