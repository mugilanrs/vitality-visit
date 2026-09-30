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
 * Auditorium pavilion at the entrance.
 *
 * Phase 2 refined massing:
 *   - Broad low-slung body (much wider than tall)
 *   - Layered curved roof: three curved shells stacked and slightly staggered
 *   - Large glass entrance with vertical fins
 *   - Stepped concrete apron creating a strong entry
 *   - Clean elliptical footprint (no exposed extrude ends)
 */

type Props = {
  width?: number;
  depth?: number;
};

function makeCurvedRoofShape(halfDepth: number, height: number): THREE.Shape {
  // Roof profile in XY: base runs -halfDepth..+halfDepth on X, curves up in Y.
  const s = new THREE.Shape();
  s.moveTo(-halfDepth, 0);
  s.lineTo(halfDepth, 0);
  s.quadraticCurveTo(halfDepth * 1.05, height * 0.75, halfDepth * 0.75, height);
  s.quadraticCurveTo(0, height * 1.1, -halfDepth * 0.75, height);
  s.quadraticCurveTo(-halfDepth * 1.05, height * 0.75, -halfDepth, 0);
  s.closePath();
  return s;
}

export default function Auditorium({ width = 5.2, depth = 2.6 }: Props) {
  // The roof profile lies in XY; we extrude it along Z by the auditorium
  // width, then rotate 90° around Y so the barrel runs along X.
  const hd = depth / 2;
  const roofOuter = useMemo(() => makeCurvedRoofShape(hd, 1.35), [hd]);
  const roofMid = useMemo(() => makeCurvedRoofShape(hd * 0.94, 1.25), [hd]);
  const roofInner = useMemo(() => makeCurvedRoofShape(hd * 0.85, 1.12), [hd]);

  return (
    <group>
      {/* Concrete apron — wide platform in front */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, depth * 0.75]}
        material={M_CONCRETE_LIGHT}
        receiveShadow
      >
        <planeGeometry args={[width + 1.2, depth + 2.0]} />
      </mesh>

      {/* Three stepped platforms leading up to the glass wall */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={`step-${i}`}
          castShadow
          receiveShadow
          position={[0, 0.06 + i * 0.07, depth / 2 + 0.55 - i * 0.16]}
          material={M_CONCRETE_LIGHT}
        >
          <boxGeometry args={[width * 0.75, 0.07, 0.32]} />
        </mesh>
      ))}

      {/* Low white body (short — the roof is the star) */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0.35, 0]}
        material={M_WHITE_SHELL}
      >
        <boxGeometry args={[width * 0.96, 0.7, depth * 0.94]} />
      </mesh>

      {/* Glass entrance wall — takes most of the front (+z) facade */}
      <mesh
        position={[0, 0.42, (depth * 0.94) / 2 + 0.002]}
        material={M_TEAL_GLASS}
      >
        <boxGeometry args={[width * 0.82, 0.62, 0.04]} />
      </mesh>

      {/* Vertical fins over the glass */}
      {Array.from({ length: 13 }).map((_, i) => {
        const x = (i / 12) * (width * 0.82) - (width * 0.82) / 2;
        return (
          <mesh
            key={`fin-${i}`}
            castShadow
            position={[x, 0.42, (depth * 0.94) / 2 + 0.03]}
            material={M_WHITE_SHELL}
          >
            <boxGeometry args={[0.05, 0.7, 0.06]} />
          </mesh>
        );
      })}

      {/* Deep-teal transom band above the entrance */}
      <mesh
        position={[0, 0.78, (depth * 0.94) / 2 + 0.002]}
        material={M_TEAL_GLASS_DEEP}
      >
        <boxGeometry args={[width * 0.85, 0.12, 0.03]} />
      </mesh>

      {/* --- LAYERED CURVED ROOF ---
          Three progressively narrower barrel shells stacked. Each is an
          extruded arch profile rotated to run along X (the wide side). */}

      {/* Outer shell — widest, thinnest */}
      <mesh
        castShadow
        receiveShadow
        rotation={[0, Math.PI / 2, 0]}
        position={[-width / 2, 0.7, 0]}
        material={M_ROOF_RIM}
      >
        <extrudeGeometry
          args={[
            roofOuter,
            { depth: width, bevelEnabled: false, steps: 1 },
          ]}
        />
      </mesh>

      {/* Main white shell — slightly narrower */}
      <mesh
        castShadow
        receiveShadow
        rotation={[0, Math.PI / 2, 0]}
        position={[-width * 0.475, 0.78, 0]}
        material={M_ROOF_WHITE}
      >
        <extrudeGeometry
          args={[
            roofMid,
            { depth: width * 0.95, bevelEnabled: false, steps: 1 },
          ]}
        />
      </mesh>

      {/* Inner ridge shell — narrowest, sits highest */}
      <mesh
        castShadow
        rotation={[0, Math.PI / 2, 0]}
        position={[-width * 0.42, 0.88, 0]}
        material={M_ROOF_WHITE}
      >
        <extrudeGeometry
          args={[
            roofInner,
            { depth: width * 0.84, bevelEnabled: false, steps: 1 },
          ]}
        />
      </mesh>

      {/* Walkway on the apron toward the plaza */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.028, depth / 2 + 1.4]}
        material={M_CONCRETE_LIGHT}
      >
        <planeGeometry args={[2.0, 2.2]} />
      </mesh>
    </group>
  );
}
