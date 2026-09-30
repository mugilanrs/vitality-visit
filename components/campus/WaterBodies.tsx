"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { M_WATER } from "@/lib/materials";
import { ringShape } from "@/lib/geometry";

/**
 * Campus water surfaces. Rendered as flat filled shapes just above the grass
 * layer so they read cleanly from the ortho camera.
 */

export default function WaterBodies() {
  // Plaza teardrop lake — outer teardrop with the plaza circle punched out.
  const plazaRing = useMemo(() => {
    const outer = new THREE.Shape();
    const steps = 96;
    const rx = 3.8;
    const rz = 3.2;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      // Slight teardrop taper toward +z
      const warp = 1 + Math.max(0, Math.sin(a)) * 0.15;
      const x = Math.cos(a) * rx;
      const z = Math.sin(a) * rz * warp;
      if (i === 0) outer.moveTo(x, z);
      else outer.lineTo(x, z);
    }
    // Punch a circular hole where the plaza sits
    const hole = new THREE.Path();
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const r = 2.0;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (i === 0) hole.moveTo(x, z);
      else hole.lineTo(x, z);
    }
    outer.holes.push(hole);
    return outer;
  }, []);

  // Residential lake — larger free-form ellipse (no hole)
  const residentialLake = useMemo(() => {
    const s = new THREE.Shape();
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const rx = 2.6;
      const rz = 1.9;
      const x = Math.cos(a) * rx;
      const z = Math.sin(a) * rz;
      if (i === 0) s.moveTo(x, z);
      else s.lineTo(x, z);
    }
    return s;
  }, []);

  return (
    <group>
      {/* Plaza lake — sits above the grass */}
      <group position={[0, 0.02, 6.5]}>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          material={M_WATER}
          receiveShadow
        >
          <shapeGeometry args={[plazaRing]} />
        </mesh>
      </group>

      {/* Residential lake */}
      <group position={[10, 0.02, -4]}>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          material={M_WATER}
          receiveShadow
        >
          <shapeGeometry args={[residentialLake]} />
        </mesh>
      </group>
    </group>
  );
}
