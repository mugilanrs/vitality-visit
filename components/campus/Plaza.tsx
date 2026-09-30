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
 * Circular Main Plaza with a central fountain and radial paving. Water is
 * handled by <WaterBodies/>; Plaza itself is the hardscape + fountain.
 */

export default function Plaza() {
  return (
    <group>
      {/* Outer plaza pad — a wide concrete disc */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.035, 0]}
        material={M_CONCRETE_LIGHT}
        receiveShadow
      >
        <circleGeometry args={[1.9, 64]} />
      </mesh>

      {/* Inner ring accent (a subtle darker ring paving) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, 0]}
        material={M_ROOF_RIM}
      >
        <ringGeometry args={[1.05, 1.15, 64]} />
      </mesh>

      {/* Radial paving lines — 8 thin dark strips extending from centre */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            rotation={[-Math.PI / 2, 0, a]}
            position={[0, 0.041, 0]}
            material={M_ROOF_RIM}
          >
            <planeGeometry args={[0.06, 1.8]} />
          </mesh>
        );
      })}

      {/* Fountain basin — a shallow cylinder rim */}
      <mesh castShadow receiveShadow position={[0, 0.08, 0]} material={M_ROOF_WHITE}>
        <cylinderGeometry args={[0.5, 0.55, 0.12, 32]} />
      </mesh>
      {/* Water inside basin */}
      <mesh position={[0, 0.145, 0]} material={M_WATER}>
        <cylinderGeometry args={[0.42, 0.42, 0.02, 32]} />
      </mesh>

      {/* Fountain jet — solid white plume so it reads against sky/ground */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.05, 0.09, 0.85, 12]} />
        <meshStandardMaterial color={COLORS.whiteShellCool} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.13, 12, 8]} />
        <meshStandardMaterial color={COLORS.whiteShellCool} roughness={0.6} />
      </mesh>

      {/* Small lamp bollards around the plaza edge */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 16;
        return (
          <group key={i} position={[Math.cos(a) * 1.72, 0, Math.sin(a) * 1.72]}>
            <mesh material={M_METAL_DARK} position={[0, 0.18, 0]}>
              <cylinderGeometry args={[0.03, 0.05, 0.35, 6]} />
            </mesh>
            <mesh position={[0, 0.4, 0]}>
              <sphereGeometry args={[0.06, 8, 6]} />
              <meshStandardMaterial color={COLORS.whiteShellCool} emissive={COLORS.whiteShellCool} emissiveIntensity={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* Pedestrian path from plaza south toward auditorium */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.033, 2.3]}
        material={M_CONCRETE_LIGHT}
      >
        <planeGeometry args={[1.4, 2.6]} />
      </mesh>

      {/* Path north to spine */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.033, -2.1]}
        material={M_CONCRETE_LIGHT}
      >
        <planeGeometry args={[1.2, 2.0]} />
      </mesh>
    </group>
  );
}
