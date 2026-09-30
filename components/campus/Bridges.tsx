"use client";

import {
  M_WHITE_SHELL,
  M_TEAL_GLASS,
  M_METAL_DARK,
} from "@/lib/materials";

/**
 * Elevated glass walkways connecting each wing building to the central spine.
 * Very small architectural detail — but it's the difference between a
 * "collection of buildings" and "a designed campus."
 */

type Props = {
  /** Where to place each bridge — its endpoints on X (spine side = 0). */
  wings: readonly {
    z: number;
    xFrom: number;
    xTo: number;
  }[];
};

export default function Bridges({ wings }: Props) {
  return (
    <group>
      {wings.map((w, i) => {
        const minX = Math.min(w.xFrom, w.xTo);
        const maxX = Math.max(w.xFrom, w.xTo);
        const midX = (minX + maxX) / 2;
        const span = maxX - minX;
        const bridgeY = 0.75;
        return (
          <group key={i} position={[midX, bridgeY, w.z]}>
            {/* Deck */}
            <mesh castShadow material={M_WHITE_SHELL}>
              <boxGeometry args={[span, 0.05, 0.4]} />
            </mesh>
            {/* Glass side rail (short) */}
            <mesh position={[0, 0.11, 0.18]} material={M_TEAL_GLASS}>
              <boxGeometry args={[span * 0.94, 0.18, 0.015]} />
            </mesh>
            <mesh position={[0, 0.11, -0.18]} material={M_TEAL_GLASS}>
              <boxGeometry args={[span * 0.94, 0.18, 0.015]} />
            </mesh>
            {/* Thin roof */}
            <mesh position={[0, 0.24, 0]} castShadow material={M_WHITE_SHELL}>
              <boxGeometry args={[span * 0.9, 0.03, 0.44]} />
            </mesh>
            {/* Two thin posts down to ground */}
            {[-span / 2 + 0.1, span / 2 - 0.1].map((x, j) => (
              <mesh key={j} position={[x, -0.38, 0]} castShadow material={M_METAL_DARK}>
                <cylinderGeometry args={[0.025, 0.025, 0.75, 6]} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}
