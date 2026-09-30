"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { M_ROAD, M_ROAD_STRIPE } from "@/lib/materials";

/**
 * Phase 1 road network: an oval ring road around the campus + a central
 * boulevard running north–south. Lane stripes are thin rectangles positioned
 * along the ring. Enough to prove the "architectural masterplan" reading
 * without going into full paving detail (Phase 3).
 */

const RING_RX = 13.6;
const RING_RZ = 11.6;
const RING_HALF_WIDTH = 0.5;

// Build ring-road geometry from an elliptical shape with an inner hole.
function useRingRoadGeometry() {
  return useMemo(() => {
    const outer = new THREE.Shape();
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const x = Math.cos(a) * (RING_RX + RING_HALF_WIDTH);
      const z = Math.sin(a) * (RING_RZ + RING_HALF_WIDTH);
      if (i === 0) outer.moveTo(x, z);
      else outer.lineTo(x, z);
    }
    const hole = new THREE.Path();
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const x = Math.cos(a) * (RING_RX - RING_HALF_WIDTH);
      const z = Math.sin(a) * (RING_RZ - RING_HALF_WIDTH);
      if (i === 0) hole.moveTo(x, z);
      else hole.lineTo(x, z);
    }
    outer.holes.push(hole);
    return new THREE.ShapeGeometry(outer, 96);
  }, []);
}

function CentreStripes() {
  const stripes = useMemo(() => {
    const arr: { pos: [number, number, number]; rot: number }[] = [];
    const steps = 60;
    for (let i = 0; i < steps; i++) {
      if (i % 2 !== 0) continue;
      const a = (i / steps) * Math.PI * 2;
      arr.push({
        pos: [Math.cos(a) * RING_RX, 0.011, Math.sin(a) * RING_RZ],
        rot: a + Math.PI / 2,
      });
    }
    return arr;
  }, []);
  return (
    <group>
      {stripes.map((s, i) => (
        <mesh
          key={i}
          position={s.pos}
          rotation={[-Math.PI / 2, 0, s.rot]}
          material={M_ROAD_STRIPE}
        >
          <planeGeometry args={[0.55, 0.08]} />
        </mesh>
      ))}
    </group>
  );
}

export default function Roads() {
  const ringGeom = useRingRoadGeometry();
  return (
    <group>
      {/* Ring road */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.008, 0]}
        material={M_ROAD}
        receiveShadow
        geometry={ringGeom}
      />
      <CentreStripes />

      {/* Central boulevard, south from the auditorium to the entrance */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.009, 12.2]}
        material={M_ROAD}
        receiveShadow
      >
        <planeGeometry args={[1.6, 4.4]} />
      </mesh>
      {/* Dashed centre line on the boulevard */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh
          key={`b-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.012, 10.5 + i * 0.55]}
          material={M_ROAD_STRIPE}
        >
          <planeGeometry args={[0.08, 0.24]} />
        </mesh>
      ))}
    </group>
  );
}
