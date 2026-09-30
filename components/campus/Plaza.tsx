"use client";

import * as THREE from "three";
import {
  M_CONCRETE_LIGHT,
  M_ROOF_RIM,
  M_ROOF_WHITE,
  M_TEAL_GLASS,
  M_METAL_DARK,
  M_WATER,
  COLORS,
} from "@/lib/materials";

/**
 * Main plaza with a strong central AXIS:
 *   spine → wide walkway → circular plaza → walkway → auditorium
 *
 * Phase 2 refined geometry:
 *   - The plaza sits on a raised disc with two concentric ring accents
 *   - The north–south axis is a wide, clearly readable concrete strip
 *   - The fountain has a stepped base
 *   - Water and radial paving frame the axis rather than compete with it
 */

export default function Plaza() {
  return (
    <group>
      {/* Wide N–S pedestrian axis strip — clearly visible from the ortho camera */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.028, -3]}
        material={M_CONCRETE_LIGHT}
      >
        <planeGeometry args={[1.6, 3.4]} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.028, 3]}
        material={M_CONCRETE_LIGHT}
      >
        <planeGeometry args={[1.6, 3.4]} />
      </mesh>

      {/* Plaza disc — raised concrete pad, wider than v1 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.045, 0]}
        material={M_CONCRETE_LIGHT}
        receiveShadow
      >
        <circleGeometry args={[2.0, 64]} />
      </mesh>

      {/* Concentric ring accents (subtle darker paving) */}
      {[0.7, 1.35, 1.85].map((r, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.055, 0]}
          material={M_ROOF_RIM}
        >
          <ringGeometry args={[r, r + 0.05, 64]} />
        </mesh>
      ))}

      {/* Radial paving — thin dark strips from centre to plaza edge */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={i}
            rotation={[-Math.PI / 2, 0, a]}
            position={[0, 0.052, 0]}
            material={M_ROOF_RIM}
          >
            <planeGeometry args={[0.04, 1.9]} />
          </mesh>
        );
      })}

      {/* Fountain — stepped white base */}
      <mesh castShadow receiveShadow position={[0, 0.11, 0]} material={M_ROOF_WHITE}>
        <cylinderGeometry args={[0.6, 0.68, 0.12, 40]} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.19, 0]} material={M_ROOF_WHITE}>
        <cylinderGeometry args={[0.42, 0.58, 0.1, 40]} />
      </mesh>
      {/* Water inside basin */}
      <mesh position={[0, 0.25, 0]} material={M_WATER}>
        <cylinderGeometry args={[0.36, 0.36, 0.02, 40]} />
      </mesh>

      {/* Fountain jet — solid white plume */}
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.05, 0.09, 0.85, 12]} />
        <meshStandardMaterial color={COLORS.whiteShellCool} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.13, 12, 8]} />
        <meshStandardMaterial color={COLORS.whiteShellCool} roughness={0.6} />
      </mesh>

      {/* Lamp bollards ringing the plaza edge */}
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2 + Math.PI / 20;
        return (
          <group key={i} position={[Math.cos(a) * 1.85, 0, Math.sin(a) * 1.85]}>
            <mesh material={M_METAL_DARK} position={[0, 0.19, 0]}>
              <cylinderGeometry args={[0.03, 0.05, 0.38, 6]} />
            </mesh>
            <mesh position={[0, 0.42, 0]}>
              <sphereGeometry args={[0.06, 8, 6]} />
              <meshStandardMaterial
                color={COLORS.whiteShellCool}
                emissive={COLORS.whiteShellCool}
                emissiveIntensity={0.25}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
