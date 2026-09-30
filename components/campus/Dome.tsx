"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  M_WHITE_SHELL,
  M_ROOF_WHITE,
  M_ROOF_RIM,
  M_TEAL_GLASS,
  M_CONCRETE_LIGHT,
} from "@/lib/materials";

/**
 * Panelized dome building — a distinct architectural landmark on the west
 * side of the plaza (per the reference image).
 *
 * Composition:
 *   1. Low circular concrete base
 *   2. Cylindrical entry ring with glass panels
 *   3. Panelized dome — icosahedron with FLAT shading so panels are visible
 *   4. Ring rim where the dome meets the base
 */

type Props = {
  radius?: number;
};

export default function Dome({ radius = 1.4 }: Props) {
  const domeGeom = useMemo(() => {
    // Icosahedron with detail 1 → 80 faces, low-poly but reads as panelised.
    const g = new THREE.IcosahedronGeometry(radius, 1);
    g.computeVertexNormals();
    // Flatten normals so each face reads distinctly.
    // (three's computeVertexNormals gives smooth normals; we want flat)
    const posAttr = g.getAttribute("position");
    const normAttr = g.getAttribute("normal");
    for (let i = 0; i < posAttr.count; i += 3) {
      const ax = posAttr.getX(i);
      const ay = posAttr.getY(i);
      const az = posAttr.getZ(i);
      const bx = posAttr.getX(i + 1);
      const by = posAttr.getY(i + 1);
      const bz = posAttr.getZ(i + 1);
      const cx = posAttr.getX(i + 2);
      const cy = posAttr.getY(i + 2);
      const cz = posAttr.getZ(i + 2);
      // Face normal (cross product of edges)
      const ux = bx - ax, uy = by - ay, uz = bz - az;
      const vx = cx - ax, vy = cy - ay, vz = cz - az;
      let nx = uy * vz - uz * vy;
      let ny = uz * vx - ux * vz;
      let nz = ux * vy - uy * vx;
      const l = Math.hypot(nx, ny, nz) || 1;
      nx /= l; ny /= l; nz /= l;
      normAttr.setXYZ(i, nx, ny, nz);
      normAttr.setXYZ(i + 1, nx, ny, nz);
      normAttr.setXYZ(i + 2, nx, ny, nz);
    }
    normAttr.needsUpdate = true;
    return g;
  }, [radius]);

  return (
    <group>
      {/* Low base plate */}
      <mesh receiveShadow position={[0, 0.03, 0]} material={M_CONCRETE_LIGHT}>
        <cylinderGeometry args={[radius * 1.5, radius * 1.6, 0.06, 40]} />
      </mesh>

      {/* Circular entry ring (glass-walled) */}
      <mesh castShadow receiveShadow position={[0, 0.28, 0]} material={M_WHITE_SHELL}>
        <cylinderGeometry args={[radius * 1.12, radius * 1.15, 0.48, 40, 1, true]} />
      </mesh>
      <mesh position={[0, 0.28, 0]} material={M_TEAL_GLASS}>
        <cylinderGeometry args={[radius * 1.08, radius * 1.1, 0.4, 40, 1, true]} />
      </mesh>

      {/* Rim where the dome meets the base */}
      <mesh position={[0, 0.53, 0]} material={M_ROOF_RIM}>
        <torusGeometry args={[radius * 1.02, 0.04, 8, 40]} />
      </mesh>

      {/* Panelized dome (upper half only) */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0.53, 0]}
        material={M_ROOF_WHITE}
        geometry={domeGeom}
      />

      {/* Flatten the bottom of the dome so we don't see through it */}
      <mesh position={[0, 0.53 - radius * 0.5, 0]}>
        <cylinderGeometry args={[radius, radius, 0.02, 40]} />
        <meshStandardMaterial visible={false} />
      </mesh>

      {/* Small skylight cap at the top */}
      <mesh position={[0, 0.55 + radius * 0.98, 0]} material={M_TEAL_GLASS}>
        <sphereGeometry args={[radius * 0.15, 12, 8]} />
      </mesh>
    </group>
  );
}
