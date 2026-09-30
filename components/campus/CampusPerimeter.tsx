"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  M_WHITE_SHELL,
  M_ROOF_WHITE,
  M_METAL_DARK,
  M_CONCRETE_LIGHT,
  M_TEAL_GLASS,
} from "@/lib/materials";

/**
 * PHASE 9 — a subtle architectural campus boundary.
 *
 * A low white perimeter wall traces the campus disc. Between wall segments,
 * thin metal posts add rhythm. The south (front) portion opens for the
 * entrance plaza; that gap becomes the entrance gate below.
 *
 * The wall is DELIBERATELY LOW so the aerial camera still reads the campus
 * clearly. It frames the property without becoming a moat.
 */

const CAMPUS_RADIUS = 16.5;
const WALL_HEIGHT = 0.5;
const WALL_THICKNESS = 0.14;

// Angular gap along the south edge for the entrance (in radians)
// θ = π/2 is due south (+z), so the gap is centered there.
const GAP_HALF = 0.28; // ~16°

function isInsideGap(angle: number) {
  // Normalize the gap around θ = π/2 (south, +z)
  const diff = Math.atan2(Math.sin(angle - Math.PI / 2), Math.cos(angle - Math.PI / 2));
  return Math.abs(diff) < GAP_HALF;
}

export default function CampusPerimeter() {
  // Wall built from short arc segments — each segment is a thin rotated box,
  // so we get a smooth curve without curved geometry cost.
  const segments = useMemo(() => {
    const arr: {
      angle: number;
      length: number;
    }[] = [];
    const total = 96;
    for (let i = 0; i < total; i++) {
      const a = (i / total) * Math.PI * 2;
      if (isInsideGap(a)) continue;
      const arc = (Math.PI * 2) / total;
      const len = 2 * CAMPUS_RADIUS * Math.sin(arc / 2);
      arr.push({ angle: a, length: len });
    }
    return arr;
  }, []);

  return (
    <group>
      {/* Low kerb / plinth just inside the wall — reads as landscape edge */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <ringGeometry args={[CAMPUS_RADIUS - 0.05, CAMPUS_RADIUS + 0.02, 128]} />
        <meshStandardMaterial color={"#f4f0e6"} roughness={0.95} />
      </mesh>

      {/* Wall segments */}
      {segments.map((s, i) => (
        <mesh
          key={i}
          castShadow
          receiveShadow
          position={[Math.cos(s.angle) * CAMPUS_RADIUS, WALL_HEIGHT / 2, Math.sin(s.angle) * CAMPUS_RADIUS]}
          rotation={[0, -s.angle, 0]}
          material={M_WHITE_SHELL}
        >
          <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, s.length]} />
        </mesh>
      ))}

      {/* Corner posts along the wall — thin metal verticals every 8 segments
          adding architectural rhythm without noise */}
      {segments
        .filter((_, i) => i % 6 === 0)
        .map((s, i) => (
          <mesh
            key={`p${i}`}
            castShadow
            position={[
              Math.cos(s.angle) * CAMPUS_RADIUS,
              WALL_HEIGHT + 0.18,
              Math.sin(s.angle) * CAMPUS_RADIUS,
            ]}
            material={M_METAL_DARK}
          >
            <boxGeometry args={[0.05, 0.36, 0.05]} />
          </mesh>
        ))}

      {/* South entrance gate */}
      <EntranceGate />
    </group>
  );
}

/**
 * Architectural entrance gate at the south edge (facing +z).
 * Two piers + a light cantilevered canopy + a TCS mark on the entrance wall.
 */
function EntranceGate() {
  const gateZ = CAMPUS_RADIUS; // sits on the perimeter
  const pierGap = 3.2;
  const pierWidth = 0.42;
  const pierDepth = 0.9;
  const pierHeight = 1.6;

  return (
    <group position={[0, 0, gateZ]}>
      {/* Left pier */}
      <mesh
        castShadow
        receiveShadow
        position={[-pierGap / 2, pierHeight / 2, 0]}
        material={M_WHITE_SHELL}
      >
        <boxGeometry args={[pierWidth, pierHeight, pierDepth]} />
      </mesh>
      {/* Right pier */}
      <mesh
        castShadow
        receiveShadow
        position={[pierGap / 2, pierHeight / 2, 0]}
        material={M_WHITE_SHELL}
      >
        <boxGeometry args={[pierWidth, pierHeight, pierDepth]} />
      </mesh>

      {/* Pier caps */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          castShadow
          position={[(s * pierGap) / 2, pierHeight + 0.04, 0]}
          material={M_METAL_DARK}
        >
          <boxGeometry args={[pierWidth + 0.1, 0.08, pierDepth + 0.1]} />
        </mesh>
      ))}

      {/* Cantilevered canopy — a thin white slab spanning the gate opening */}
      <mesh
        castShadow
        receiveShadow
        position={[0, pierHeight + 0.28, 0]}
        material={M_ROOF_WHITE}
      >
        <boxGeometry args={[pierGap + pierWidth * 2 + 0.3, 0.08, pierDepth + 0.4]} />
      </mesh>
      {/* Thin metal rim under the canopy */}
      <mesh
        position={[0, pierHeight + 0.235, 0]}
        material={M_METAL_DARK}
      >
        <boxGeometry args={[pierGap + pierWidth * 2 + 0.35, 0.015, pierDepth + 0.45]} />
      </mesh>

      {/* Rear glass wall behind the gate — reads as a security kiosk pane */}
      <mesh
        position={[0, pierHeight * 0.55, -pierDepth / 2 - 0.02]}
        material={M_TEAL_GLASS}
      >
        <boxGeometry args={[pierGap - 0.1, pierHeight * 0.75, 0.04]} />
      </mesh>

      {/* TCS mark strip — thin pink accent line on the canopy edge */}
      <mesh position={[0, pierHeight + 0.32, pierDepth / 2 + 0.02]}>
        <boxGeometry args={[pierGap * 0.6, 0.03, 0.01]} />
        <meshStandardMaterial
          color={"#f4a3c1"}
          emissive={"#f4a3c1"}
          emissiveIntensity={0.65}
        />
      </mesh>

      {/* Entrance apron — concrete band at the ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0.2]}
        material={M_CONCRETE_LIGHT}
      >
        <planeGeometry args={[pierGap + pierWidth * 2 + 0.6, pierDepth + 0.8]} />
      </mesh>
    </group>
  );
}
