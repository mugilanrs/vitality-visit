"use client";

import {
  M_WHITE_SHELL,
  M_TEAL_GLASS,
  M_TEAL_GLASS_DEEP,
  M_ROOF_WHITE,
  M_METAL_DARK,
} from "@/lib/materials";

/**
 * Slender vertically-tapered tower. The campus landmark.
 *
 * Massing (bottom → top):
 *   1. Base plinth (wider than the shell)
 *   2. Two thin white structural blades that taper toward the top
 *   3. Central glass core (also tapered)
 *   4. Floor slabs — thin white bands at intervals
 *   5. Circular observation crown — the identifying architectural gesture
 *   6. Crown roof cap
 *   7. Antenna spike
 */

type Props = {
  height?: number;
};

export default function Tower({ height = 8.0 }: Props) {
  const shellH = height * 0.8;
  const crownY = height * 0.87;

  // Taper: dimensions at base vs top
  const bx0 = 0.55;   // base blade x-offset
  const bx1 = 0.35;   // top blade x-offset
  const bd0 = 1.15;   // base blade depth
  const bd1 = 0.85;   // top blade depth
  const gw0 = 0.75;   // base glass core width
  const gw1 = 0.5;    // top glass core width
  const gd0 = 1.05;   // base glass core depth
  const gd1 = 0.75;   // top glass core depth

  // Number of tower "slabs" — thin white bands at each floor
  const floors = 12;

  return (
    <group>
      {/* 1. Base plinth */}
      <mesh castShadow receiveShadow position={[0, 0.14, 0]} material={M_WHITE_SHELL}>
        <boxGeometry args={[1.9, 0.28, 1.9]} />
      </mesh>

      {/* 2. Two tapered blades — one on each side of the glass core.
             Modelled as short stacked segments so the taper reads. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          {Array.from({ length: floors }).map((_, i) => {
            const t = i / (floors - 1);
            const y = 0.28 + t * shellH;
            const seg = shellH / floors;
            // Interpolate width/depth toward the top
            const bx = bx0 + (bx1 - bx0) * t;
            const bd = bd0 + (bd1 - bd0) * t;
            return (
              <mesh
                key={i}
                castShadow
                receiveShadow
                position={[side * bx, y + seg / 2, 0]}
                material={M_WHITE_SHELL}
              >
                <boxGeometry args={[0.32 * (1 - t * 0.3), seg + 0.01, bd]} />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* 3. Central glass core — stacked segments for the same taper */}
      {Array.from({ length: floors }).map((_, i) => {
        const t = i / (floors - 1);
        const y = 0.28 + t * shellH;
        const seg = shellH / floors;
        const gw = gw0 + (gw1 - gw0) * t;
        const gd = gd0 + (gd1 - gd0) * t;
        return (
          <mesh
            key={`g${i}`}
            castShadow
            position={[0, y + seg / 2, 0]}
            material={M_TEAL_GLASS}
          >
            <boxGeometry args={[gw, seg + 0.01, gd]} />
          </mesh>
        );
      })}

      {/* Deep-teal accent strip on the north face */}
      <mesh
        position={[0, shellH / 2 + 0.28, -gd0 / 2 - 0.001]}
        material={M_TEAL_GLASS_DEEP}
      >
        <boxGeometry args={[gw0 * 0.92, shellH * 0.98, 0.02]} />
      </mesh>

      {/* 4. Floor slabs — thin white horizontal strips at each intermediate level */}
      {Array.from({ length: floors + 1 }).map((_, i) => {
        const t = i / floors;
        const y = 0.28 + t * shellH;
        const bw = 1.5 + (bx1 * 2 - bx0 * 2) * t; // taper the slab too
        const bd = bd0 + (bd1 - bd0) * t;
        return (
          <mesh
            key={`s${i}`}
            castShadow
            position={[0, y, 0]}
            material={M_WHITE_SHELL}
          >
            <boxGeometry args={[1.55 - t * 0.35, 0.035, bd + 0.05]} />
          </mesh>
        );
      })}

      {/* 5. Observation crown — a wider disc that flares out */}
      <mesh castShadow receiveShadow position={[0, crownY, 0]} material={M_WHITE_SHELL}>
        <cylinderGeometry args={[1.1, 0.75, 0.55, 32]} />
      </mesh>
      {/* Glass ring on the crown */}
      <mesh position={[0, crownY, 0]} material={M_TEAL_GLASS}>
        <cylinderGeometry args={[1.0, 0.68, 0.45, 32]} />
      </mesh>

      {/* 6. Crown roof — a tapered cone/frustum on top of the observation disc */}
      <mesh castShadow position={[0, crownY + 0.36, 0]} material={M_ROOF_WHITE}>
        <cylinderGeometry args={[0.75, 1.1, 0.22, 32]} />
      </mesh>
      <mesh castShadow position={[0, crownY + 0.5, 0]} material={M_ROOF_WHITE}>
        <cylinderGeometry args={[0.32, 0.75, 0.12, 32]} />
      </mesh>
      <mesh position={[0, crownY + 0.6, 0]} material={M_ROOF_WHITE}>
        <cylinderGeometry args={[0.16, 0.32, 0.08, 32]} />
      </mesh>

      {/* 7. Antenna spike */}
      <mesh position={[0, crownY + 1.05, 0]} material={M_METAL_DARK}>
        <cylinderGeometry args={[0.02, 0.06, 0.95, 8]} />
      </mesh>
      <mesh position={[0, crownY + 1.7, 0]} material={M_METAL_DARK}>
        <cylinderGeometry args={[0.006, 0.02, 0.35, 6]} />
      </mesh>
    </group>
  );
}
