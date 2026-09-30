"use client";

import * as THREE from "three";
import {
  M_WHITE_SHELL,
  M_TEAL_GLASS,
  M_TEAL_GLASS_DEEP,
  M_ROOF_WHITE,
  M_METAL_DARK,
} from "@/lib/materials";

/**
 * Slender white-shell tower with a glass core and a circular observation
 * crown. Reads as the campus landmark from the overview camera.
 *
 * Layout (bottom → top):
 *   base plinth
 *   two white structural "blades" flanking a slim glass core
 *   floor slabs stepping down in width slightly toward the top
 *   observation disc (crown)
 *   crown roof cap
 *   antenna spike
 */

type Props = {
  height?: number;
};

export default function Tower({ height = 6.4 }: Props) {
  const shellHeight = height * 0.78;
  const crownY = height * 0.85;

  return (
    <group>
      {/* Base plinth */}
      <mesh castShadow receiveShadow position={[0, 0.12, 0]} material={M_WHITE_SHELL}>
        <boxGeometry args={[1.6, 0.24, 1.6]} />
      </mesh>

      {/* Two white structural blades on ±x, thin front-to-back */}
      {[-0.5, 0.5].map((x) => (
        <mesh
          key={x}
          castShadow
          receiveShadow
          position={[x, shellHeight / 2 + 0.24, 0]}
          material={M_WHITE_SHELL}
        >
          <boxGeometry args={[0.3, shellHeight, 1.05]} />
        </mesh>
      ))}

      {/* Central glass core (between the blades) */}
      <mesh
        castShadow
        position={[0, shellHeight / 2 + 0.24, 0]}
        material={M_TEAL_GLASS}
      >
        <boxGeometry args={[0.7, shellHeight, 0.95]} />
      </mesh>

      {/* Deeper glass on the north face (adds visual weight) */}
      <mesh
        position={[0, shellHeight / 2 + 0.24, -0.485]}
        material={M_TEAL_GLASS_DEEP}
      >
        <boxGeometry args={[0.68, shellHeight * 0.98, 0.02]} />
      </mesh>

      {/* Floor slabs — thin white strips at intervals */}
      {Array.from({ length: 8 }).map((_, i) => {
        const y = 0.6 + i * (shellHeight / 9);
        return (
          <mesh
            key={i}
            castShadow
            position={[0, y, 0]}
            material={M_WHITE_SHELL}
          >
            <boxGeometry args={[1.35, 0.04, 1.15]} />
          </mesh>
        );
      })}

      {/* Circular observation crown */}
      <mesh castShadow receiveShadow position={[0, crownY, 0]} material={M_WHITE_SHELL}>
        <cylinderGeometry args={[1.05, 0.9, 0.45, 32]} />
      </mesh>
      <mesh position={[0, crownY, 0]} material={M_TEAL_GLASS}>
        <cylinderGeometry args={[0.95, 0.82, 0.38, 32]} />
      </mesh>
      {/* Crown roof cap */}
      <mesh castShadow position={[0, crownY + 0.28, 0]} material={M_ROOF_WHITE}>
        <cylinderGeometry args={[0.75, 1.05, 0.18, 32]} />
      </mesh>
      <mesh position={[0, crownY + 0.42, 0]} material={M_ROOF_WHITE}>
        <cylinderGeometry args={[0.25, 0.75, 0.12, 32]} />
      </mesh>

      {/* Antenna spike */}
      <mesh position={[0, crownY + 0.9, 0]} material={M_METAL_DARK}>
        <cylinderGeometry args={[0.02, 0.06, 0.9, 8]} />
      </mesh>
      <mesh position={[0, crownY + 1.4, 0]} material={M_METAL_DARK}>
        <cylinderGeometry args={[0.005, 0.02, 0.3, 6]} />
      </mesh>
    </group>
  );
}
