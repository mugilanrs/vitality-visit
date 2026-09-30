"use client";

import {
  M_WHITE_SHELL,
  M_ROOF_WHITE,
  M_ROOF_RIM,
  M_TEAL_GLASS,
  M_CONCRETE_LIGHT,
} from "@/lib/materials";

/**
 * Smooth low-profile dome pavilion (west of the plaza).
 *
 * Phase 2 refined massing:
 *   - Broad low circular architectural base (not just a plate)
 *   - Cylindrical entry ring with glass walls and a small entry portal
 *   - Smooth SphereGeometry half — no more panelised faceted look
 *   - Central skylight cap
 *
 * The dome is low-profile: wider than tall, so it reads as an architectural
 * pavilion, not an oversized ball.
 */

type Props = {
  radius?: number;
};

export default function Dome({ radius = 1.6 }: Props) {
  const baseR = radius * 1.3;

  return (
    <group>
      {/* Broad low base plate */}
      <mesh receiveShadow castShadow position={[0, 0.04, 0]} material={M_CONCRETE_LIGHT}>
        <cylinderGeometry args={[baseR + 0.15, baseR + 0.3, 0.08, 40]} />
      </mesh>

      {/* Architectural base ring — taller, slightly narrower than base plate */}
      <mesh castShadow receiveShadow position={[0, 0.24, 0]} material={M_WHITE_SHELL}>
        <cylinderGeometry args={[baseR, baseR, 0.32, 40]} />
      </mesh>

      {/* Glass entry ring — set INSIDE the base ring so glass reads recessed */}
      <mesh position={[0, 0.24, 0]} material={M_TEAL_GLASS}>
        <cylinderGeometry args={[baseR * 0.98, baseR * 0.98, 0.24, 40, 1, true]} />
      </mesh>

      {/* Small entry portal — a low box breaking the ring on +z */}
      <mesh castShadow receiveShadow position={[0, 0.24, baseR + 0.05]} material={M_WHITE_SHELL}>
        <boxGeometry args={[0.9, 0.36, 0.4]} />
      </mesh>
      <mesh position={[0, 0.22, baseR + 0.25]} material={M_TEAL_GLASS}>
        <boxGeometry args={[0.7, 0.28, 0.02]} />
      </mesh>

      {/* Rim ring where the dome meets the base (thin darker torus) */}
      <mesh position={[0, 0.42, 0]} material={M_ROOF_RIM}>
        <torusGeometry args={[baseR, 0.035, 8, 48]} />
      </mesh>

      {/* SMOOTH low-profile dome — sphere scaled down in Y so it's flatter */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0.42, 0]}
        scale={[baseR / radius, (baseR * 0.55) / radius, baseR / radius]}
        material={M_ROOF_WHITE}
      >
        <sphereGeometry args={[radius, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>

      {/* Skylight cap — small glass sphere at the apex */}
      <mesh position={[0, 0.42 + baseR * 0.55, 0]} material={M_TEAL_GLASS}>
        <sphereGeometry args={[radius * 0.14, 20, 14]} />
      </mesh>

      {/* Thin white cap ring around the skylight */}
      <mesh position={[0, 0.42 + baseR * 0.53, 0]} material={M_ROOF_WHITE}>
        <torusGeometry args={[radius * 0.16, 0.02, 8, 32]} />
      </mesh>
    </group>
  );
}
