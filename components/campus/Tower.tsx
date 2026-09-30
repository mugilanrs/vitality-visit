"use client";

import {
  M_WHITE_SHELL,
  M_TEAL_GLASS,
  M_TEAL_GLASS_DEEP,
  M_ROOF_WHITE,
  M_METAL_DARK,
} from "@/lib/materials";

/**
 * PHASE 9 — Signature Tower.
 *
 * The tower is the campus landmark. The distinguishing gesture is its LARGE
 * CROWN — a wide, cantilevered, saucer-like disc that flares out well beyond
 * the shaft, with a smaller spire above it. The crown is the first thing
 * that visually identifies the tower from the aerial camera.
 *
 * Massing (bottom → top):
 *   1. Base plinth
 *   2. Slender tapering shaft (dark blue-grey glass + two structural fins)
 *   3. Thin white floor slabs at intervals
 *   4. Neck / transition ring below the crown
 *   5. LARGE CROWN — wide flying-saucer disc, substantially wider than shaft
 *   6. Crown glass belt (dark blue-grey glazing around the crown)
 *   7. Upper crown cap (slight second tier)
 *   8. Central spire above the crown
 */

type Props = {
  height?: number;
};

export default function Tower({ height = 9.0 }: Props) {
  const shaftH = height * 0.78;
  const crownY = height * 0.82;

  // Shaft dimensions — narrow, elegant, tapered
  const fx0 = 0.42;   // base fin x-offset
  const fx1 = 0.28;   // top fin x-offset
  const fd0 = 1.05;   // base shaft depth
  const fd1 = 0.72;   // top shaft depth
  const gw0 = 0.68;   // base glass core width
  const gw1 = 0.44;   // top glass core width
  const gd0 = 0.95;   // base glass core depth
  const gd1 = 0.66;   // top glass core depth

  const floors = 14;

  // CROWN — the identifying gesture
  const CROWN_RADIUS = 1.7;   // wide disc: > 2× the shaft width
  const CROWN_THICK = 0.34;
  const NECK_R = 0.6;

  return (
    <group>
      {/* 1. Base plinth */}
      <mesh castShadow receiveShadow position={[0, 0.14, 0]} material={M_WHITE_SHELL}>
        <boxGeometry args={[1.75, 0.28, 1.75]} />
      </mesh>

      {/* 2a. Two tapered structural fins flanking the glass core */}
      {[-1, 1].map((side) => (
        <group key={side}>
          {Array.from({ length: floors }).map((_, i) => {
            const t = i / (floors - 1);
            const y = 0.28 + t * shaftH;
            const seg = shaftH / floors;
            const fx = fx0 + (fx1 - fx0) * t;
            const fd = fd0 + (fd1 - fd0) * t;
            return (
              <mesh
                key={i}
                castShadow
                receiveShadow
                position={[side * fx, y + seg / 2, 0]}
                material={M_WHITE_SHELL}
              >
                <boxGeometry args={[0.24 * (1 - t * 0.35), seg + 0.01, fd]} />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* 2b. Central glass core — dark blue-grey */}
      {Array.from({ length: floors }).map((_, i) => {
        const t = i / (floors - 1);
        const y = 0.28 + t * shaftH;
        const seg = shaftH / floors;
        const gw = gw0 + (gw1 - gw0) * t;
        const gd = gd0 + (gd1 - gd0) * t;
        return (
          <mesh
            key={`g${i}`}
            castShadow
            position={[0, y + seg / 2, 0]}
            material={M_TEAL_GLASS_DEEP}
          >
            <boxGeometry args={[gw, seg + 0.01, gd]} />
          </mesh>
        );
      })}

      {/* Vertical mullion strip on the front face */}
      <mesh
        position={[0, shaftH / 2 + 0.28, gd0 / 2 + 0.002]}
        material={M_TEAL_GLASS}
      >
        <boxGeometry args={[gw0 * 0.85, shaftH * 0.96, 0.02]} />
      </mesh>

      {/* 3. Thin white floor slabs at each level */}
      {Array.from({ length: floors + 1 }).map((_, i) => {
        const t = i / floors;
        const y = 0.28 + t * shaftH;
        const bd = fd0 + (fd1 - fd0) * t;
        return (
          <mesh
            key={`s${i}`}
            castShadow
            position={[0, y, 0]}
            material={M_WHITE_SHELL}
          >
            <boxGeometry args={[1.35 - t * 0.4, 0.032, bd + 0.05]} />
          </mesh>
        );
      })}

      {/* 4. Neck ring — visually connects shaft to crown */}
      <mesh castShadow position={[0, crownY - 0.08, 0]} material={M_METAL_DARK}>
        <cylinderGeometry args={[NECK_R, NECK_R * 1.05, 0.12, 24]} />
      </mesh>

      {/* 5. LARGE CROWN — wide flying saucer disc, cantilevered outward.
             This is the tower's identifying silhouette. */}
      <mesh castShadow receiveShadow position={[0, crownY + 0.1, 0]} material={M_WHITE_SHELL}>
        <cylinderGeometry
          args={[CROWN_RADIUS, CROWN_RADIUS * 0.72, CROWN_THICK, 48]}
        />
      </mesh>

      {/* 5b. Underside taper — softens the disc so it reads as aerodynamic */}
      <mesh castShadow position={[0, crownY - 0.05, 0]} material={M_WHITE_SHELL}>
        <cylinderGeometry
          args={[CROWN_RADIUS * 0.72, NECK_R * 1.1, 0.2, 48]}
        />
      </mesh>

      {/* 6. Crown glass belt — a continuous glazed band around the widest point */}
      <mesh position={[0, crownY + 0.1, 0]} material={M_TEAL_GLASS_DEEP}>
        <cylinderGeometry
          args={[CROWN_RADIUS + 0.01, CROWN_RADIUS + 0.01, CROWN_THICK * 0.55, 48, 1, true]}
        />
      </mesh>

      {/* 6b. Thin crown rim highlight */}
      <mesh position={[0, crownY + 0.1 + CROWN_THICK / 2 - 0.01, 0]} material={M_ROOF_WHITE}>
        <torusGeometry args={[CROWN_RADIUS - 0.01, 0.03, 8, 48]} />
      </mesh>
      <mesh position={[0, crownY + 0.1 - CROWN_THICK / 2 + 0.01, 0]} material={M_ROOF_WHITE}>
        <torusGeometry args={[CROWN_RADIUS - 0.01, 0.03, 8, 48]} />
      </mesh>

      {/* 7. Upper crown tier — a slightly smaller cap sitting on the disc */}
      <mesh castShadow position={[0, crownY + 0.42, 0]} material={M_ROOF_WHITE}>
        <cylinderGeometry args={[CROWN_RADIUS * 0.55, CROWN_RADIUS * 0.78, 0.24, 40]} />
      </mesh>
      <mesh position={[0, crownY + 0.55, 0]} material={M_TEAL_GLASS}>
        <cylinderGeometry
          args={[CROWN_RADIUS * 0.5, CROWN_RADIUS * 0.55, 0.08, 40, 1, true]}
        />
      </mesh>
      <mesh castShadow position={[0, crownY + 0.68, 0]} material={M_ROOF_WHITE}>
        <cylinderGeometry args={[CROWN_RADIUS * 0.3, CROWN_RADIUS * 0.5, 0.14, 32]} />
      </mesh>

      {/* 8. Central spire — small vertical element above the crown */}
      <mesh castShadow position={[0, crownY + 0.9, 0]} material={M_WHITE_SHELL}>
        <cylinderGeometry args={[0.1, 0.2, 0.4, 16]} />
      </mesh>
      <mesh position={[0, crownY + 1.35, 0]} material={M_METAL_DARK}>
        <cylinderGeometry args={[0.03, 0.06, 0.7, 8]} />
      </mesh>
      <mesh position={[0, crownY + 1.85, 0]} material={M_METAL_DARK}>
        <cylinderGeometry args={[0.008, 0.02, 0.32, 6]} />
      </mesh>
    </group>
  );
}
