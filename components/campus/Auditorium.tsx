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
} from "@/lib/materials";

/**
 * Auditorium pavilion at the front of the campus.
 *
 * Roof approach: an arch profile in XY, extruded along Z so we get a
 * continuous curved barrel with visible end-caps — no half-cylinder rotation
 * math to go wrong.
 */

type Props = {
  width?: number;
  depth?: number;
};

// Arch profile: half-ellipse-ish curve, closed at ±hw base.
function makeArchProfile(width: number, height: number): THREE.Shape {
  const s = new THREE.Shape();
  const hw = width / 2;
  s.moveTo(-hw, 0);
  s.lineTo(hw, 0);
  // Cubic-ish arc via quadratic segments
  s.quadraticCurveTo(hw, height * 0.9, hw * 0.7, height);
  s.quadraticCurveTo(0, height * 1.1, -hw * 0.7, height);
  s.quadraticCurveTo(-hw, height * 0.9, -hw, 0);
  s.closePath();
  return s;
}

export default function Auditorium({ width = 4.4, depth = 2.2 }: Props) {
  const archOuter = useMemo(() => makeArchProfile(width, 1.35), [width]);
  const archInner = useMemo(() => makeArchProfile(width * 0.95, 1.28), [width]);

  return (
    <group>
      {/* Concrete apron */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, depth * 0.4]}
        material={M_CONCRETE_LIGHT}
        receiveShadow
      >
        <planeGeometry args={[width + 1.2, depth + 1.4]} />
      </mesh>

      {/* Stepped entrance */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          castShadow
          receiveShadow
          position={[0, 0.05 + i * 0.06, depth / 2 + 0.35 - i * 0.12]}
          material={M_CONCRETE_LIGHT}
        >
          <boxGeometry args={[width * 0.7, 0.06, 0.24]} />
        </mesh>
      ))}

      {/* Main white body (short — the roof does most of the work) */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0.35, 0]}
        material={M_WHITE_SHELL}
      >
        <boxGeometry args={[width * 0.98, 0.7, depth * 0.9]} />
      </mesh>

      {/* Glass entrance wall on +z */}
      <mesh
        position={[0, 0.42, (depth * 0.9) / 2 + 0.001]}
        material={M_TEAL_GLASS}
      >
        <boxGeometry args={[width * 0.85, 0.62, 0.04]} />
      </mesh>

      {/* Vertical fins over the entrance glass */}
      {Array.from({ length: 11 }).map((_, i) => {
        const x = (i / 10) * (width * 0.85) - (width * 0.85) / 2;
        return (
          <mesh
            key={i}
            position={[x, 0.42, (depth * 0.9) / 2 + 0.03]}
            material={M_WHITE_SHELL}
          >
            <boxGeometry args={[0.05, 0.7, 0.06]} />
          </mesh>
        );
      })}

      {/* Deep-teal transom band above the entrance */}
      <mesh
        position={[0, 0.78, (depth * 0.9) / 2 + 0.002]}
        material={M_TEAL_GLASS_DEEP}
      >
        <boxGeometry args={[width * 0.88, 0.12, 0.03]} />
      </mesh>

      {/* Arched barrel roof — extruded arch profile along z */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0.7, -depth / 2]}
        material={M_ROOF_WHITE}
      >
        <extrudeGeometry
          args={[
            archOuter,
            { depth: depth, bevelEnabled: false, steps: 1 },
          ]}
        />
      </mesh>

      {/* Rim — a thin darker outline of the arch on the +z (front) face */}
      <mesh
        position={[0, 0.7, depth / 2 + 0.005]}
        material={M_ROOF_RIM}
      >
        <extrudeGeometry
          args={[
            archOuter,
            { depth: 0.02, bevelEnabled: false, steps: 1 },
          ]}
        />
      </mesh>

      {/* Under-roof recess (inner arch, deep-teal — reads as skylight) */}
      <mesh
        position={[0, 0.7, -depth / 2 - 0.03]}
        material={M_TEAL_GLASS_DEEP}
      >
        <extrudeGeometry
          args={[
            archInner,
            { depth: 0.05, bevelEnabled: false, steps: 1 },
          ]}
        />
      </mesh>

      {/* Central walkway lane on the apron leading toward plaza */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.028, depth / 2 + 0.9]}
        material={M_CONCRETE_LIGHT}
      >
        <planeGeometry args={[1.4, 1.6]} />
      </mesh>
    </group>
  );
}
