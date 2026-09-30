"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { COLORS } from "@/lib/materials";

/**
 * Vegetation: palms clustered around the plaza + residential lake, and a
 * dense outer ring of general trees around the campus perimeter.
 *
 * Uses simple <mesh> per plant with shared BufferGeometries + shared
 * Materials — cheap enough at ~150 items and it renders reliably without
 * the InstancedMesh matrix-timing gotcha we hit earlier.
 */

const PALM_LEAF_COUNT = 6;

function usePalmPieces() {
  return useMemo(() => {
    const trunk = new THREE.CylinderGeometry(0.06, 0.09, 0.9, 6);
    const leaf = new THREE.BoxGeometry(0.05, 0.02, 0.55);
    return { trunk, leaf };
  }, []);
}

function useTreePieces() {
  return useMemo(() => {
    const trunk = new THREE.CylinderGeometry(0.07, 0.11, 0.65, 6);
    const canopy = new THREE.IcosahedronGeometry(0.42, 0);
    const canopy2 = new THREE.IcosahedronGeometry(0.32, 0);
    return { trunk, canopy, canopy2 };
  }, []);
}

// Positions ------------------------------------------------------

function palmPositions() {
  const arr: [number, number, number, number][] = [];
  // Ring around the plaza (centre 0, 6.5), just OUTSIDE the plaza water
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const rx = 4.5;
    const rz = 3.8;
    arr.push([Math.cos(a) * rx, 0, 6.5 + Math.sin(a) * rz, a]);
  }
  // Ring around the residential lake
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const rx = 3.3;
    const rz = 2.5;
    arr.push([10 + Math.cos(a) * rx, 0, -4 + Math.sin(a) * rz, a]);
  }
  // Rows along the entrance boulevard, framing the auditorium
  for (let i = 0; i < 4; i++) {
    for (const side of [-1, 1]) {
      arr.push([side * 1.7, 0, 9.6 + i * 0.75, 0]);
    }
  }
  return arr;
}

function treePositions() {
  const arr: [number, number, number, number][] = [];
  // Outer perimeter ring
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * Math.PI * 2;
    const seed = (i * 91) % 100;
    const jitter = (seed / 100) * 0.9;
    const r = 14.2 + jitter;
    const rz = 12.1 + jitter * 0.8;
    arr.push([
      Math.cos(a) * r,
      0,
      Math.sin(a) * rz,
      (seed / 100) * Math.PI * 2,
    ]);
  }
  // Scattered inner clusters (grass islands)
  const spots: [number, number][] = [
    [-7.8, 3.8],
    [-7.2, -3.6],
    [-5.5, 8.6],
    [7.6, 4.4],
    [6.4, 7.3],
    [7.2, -1.2],
    [-3, 8.2],
    [3, 8.2],
    [0, -6.5],
  ];
  spots.forEach(([x, z], si) => {
    for (let k = 0; k < 3; k++) {
      const ang = (k / 3) * Math.PI * 2 + si * 0.7;
      const r = 0.55;
      arr.push([x + Math.cos(ang) * r, 0, z + Math.sin(ang) * r, ang]);
    }
  });
  return arr;
}

// Rendering ------------------------------------------------------

function Palm({ pos, scale }: { pos: [number, number, number]; scale: number }) {
  const { trunk, leaf } = usePalmPieces();
  const trunkMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COLORS.trunk, roughness: 0.95 }),
    [],
  );
  const leafMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COLORS.palmGreen, roughness: 0.75 }),
    [],
  );
  return (
    <group position={pos} scale={scale}>
      <mesh castShadow position={[0, 0.45, 0]} geometry={trunk} material={trunkMat} />
      {Array.from({ length: PALM_LEAF_COUNT }).map((_, i) => {
        const a = (i / PALM_LEAF_COUNT) * Math.PI * 2;
        return (
          <mesh
            key={i}
            castShadow
            position={[Math.cos(a) * 0.08, 0.95, Math.sin(a) * 0.08]}
            rotation={[-0.35, a, 0]}
            geometry={leaf}
            material={leafMat}
          />
        );
      })}
    </group>
  );
}

function Tree({ pos, scale }: { pos: [number, number, number]; scale: number }) {
  const { trunk, canopy, canopy2 } = useTreePieces();
  const trunkMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COLORS.trunk, roughness: 0.95 }),
    [],
  );
  const leafMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COLORS.leavesGreen, roughness: 0.85 }),
    [],
  );
  return (
    <group position={pos} scale={scale}>
      <mesh castShadow position={[0, 0.325, 0]} geometry={trunk} material={trunkMat} />
      <mesh castShadow position={[0, 0.85, 0]} geometry={canopy} material={leafMat} />
      <mesh castShadow position={[0.18, 1.05, -0.1]} geometry={canopy2} material={leafMat} />
    </group>
  );
}

export default function Vegetation() {
  const palms = useMemo(() => palmPositions(), []);
  const trees = useMemo(() => treePositions(), []);

  return (
    <group>
      {palms.map((p, i) => {
        const s = 0.9 + (((i * 17) % 5) / 5) * 0.35;
        return <Palm key={`p${i}`} pos={[p[0], p[1], p[2]]} scale={s} />;
      })}
      {trees.map((p, i) => {
        const s = 0.9 + (((i * 23) % 7) / 7) * 0.55;
        return <Tree key={`t${i}`} pos={[p[0], p[1], p[2]]} scale={s} />;
      })}
    </group>
  );
}
