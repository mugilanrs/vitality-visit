"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { M_WATER } from "@/lib/materials";
import { journey } from "@/lib/journey";

/**
 * Campus water surfaces — refined so they read as intentionally designed
 * shapes framing the architecture:
 *   - Plaza water: a smooth ring that hugs the plaza + spine axis, punched
 *     out where the plaza and axis pass through
 *   - Residential lake: a soft kidney-bean rather than a plain ellipse
 */

/**
 * Very subtle water animation — barely-perceptible sine-driven wobble on
 * the material's envMapIntensity and a hair of colour drift. Reads as calm
 * moving water without any noisy ripples.
 */
function useWaterAnimation() {
  const ref = useRef({ t: 0 });
  useFrame((_state, dt) => {
    if (journey.reducedMotion) return;
    ref.current.t += dt;
    // Two combined sine waves — reads as slow drift rather than a pulse
    const t = ref.current.t;
    const wobble =
      0.88 + 0.14 * Math.sin(t * 0.35) + 0.05 * Math.sin(t * 0.19 + 1.7);
    (M_WATER as THREE.MeshStandardMaterial).envMapIntensity = wobble;
  });
}

export default function WaterBodies() {
  useWaterAnimation();

  // Plaza water ring — outer teardrop with an inner hole for the plaza,
  // plus notches carved along the N–S axis so the axis reads as unbroken land.
  const plazaWater = useMemo(() => {
    const s = new THREE.Shape();
    const steps = 128;
    const rx = 4.1;
    const rz = 3.4;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      // subtle north-warp so the ring pinches toward the spine
      const warp = 1 + 0.15 * Math.max(0, -Math.sin(a));
      const x = Math.cos(a) * rx;
      const z = Math.sin(a) * rz * warp;
      if (i === 0) s.moveTo(x, z);
      else s.lineTo(x, z);
    }
    // Central plaza cutout
    const hole = new THREE.Path();
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const r = 2.1;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (i === 0) hole.moveTo(x, z);
      else hole.lineTo(x, z);
    }
    s.holes.push(hole);

    // North-axis carve (spine walkway passes through)
    const northAxis = new THREE.Path();
    northAxis.moveTo(-0.85, -3.5);
    northAxis.lineTo(0.85, -3.5);
    northAxis.lineTo(0.85, -2.0);
    northAxis.lineTo(-0.85, -2.0);
    northAxis.closePath();
    s.holes.push(northAxis);

    // South-axis carve (walkway to auditorium)
    const southAxis = new THREE.Path();
    southAxis.moveTo(-0.85, 2.0);
    southAxis.lineTo(0.85, 2.0);
    southAxis.lineTo(0.85, 3.5);
    southAxis.lineTo(-0.85, 3.5);
    southAxis.closePath();
    s.holes.push(southAxis);

    return s;
  }, []);

  return (
    <group>
      {/* Entrance lake — the plaza ring, south of the spine */}
      <group position={[0, 0.02, 6.5]}>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          material={M_WATER}
          receiveShadow
        >
          <shapeGeometry args={[plazaWater]} />
        </mesh>
      </group>
    </group>
  );
}
