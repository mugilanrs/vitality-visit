"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { BUILDINGS, BUILDING_ORDER } from "@/data/buildings";
import { journey } from "@/lib/journey";

/**
 * PHASE 8 — soft accent halo under the currently HOVERED building block.
 *
 * Highlights only when a spatial tile is hovered. No highlight when the
 * user is drilled into a building (the drill-down card carries focus).
 * Very low opacity so it never dominates.
 */

const currentTarget = new THREE.Vector3();
const targetPos = new THREE.Vector3();
const currentColor = new THREE.Color(0xf4a3c1);
const targetColor = new THREE.Color(0xf4a3c1);

export default function SpatialFocus() {
  const markRef = useRef<THREE.Mesh>(null);
  const markMat = useRef<THREE.MeshBasicMaterial | null>(null);
  const vignetteMat = useRef<THREE.MeshBasicMaterial | null>(null);

  useFrame((_, dt) => {
    const mark = markRef.current;
    if (!mark) return;
    const k = Math.min(1, dt * 4.5);

    const hoverIdx = journey.hoverIndex;
    const isCampus = journey.focus.level === "campus";

    if (isCampus && hoverIdx != null) {
      const id = BUILDING_ORDER[hoverIdx];
      const b = BUILDINGS[id];
      if (b) {
        targetPos.set(b.basePosition[0], 0.02, b.basePosition[2]);
        targetColor.set(b.accent);
      }
    }

    currentTarget.lerp(targetPos, k);
    currentColor.lerp(targetColor, k);
    mark.position.copy(currentTarget);

    // Opacity: fade in when hovering, else fade out
    const targetOpacity = isCampus && hoverIdx != null ? 0.22 : 0;
    if (markMat.current) {
      markMat.current.opacity += (targetOpacity - markMat.current.opacity) * k;
      markMat.current.color.copy(currentColor);
    }
    // Vignette — barely-there darker ring outside the site, only when hovering.
    if (vignetteMat.current) {
      const vt = isCampus && hoverIdx != null ? 0.1 : 0;
      vignetteMat.current.opacity += (vt - vignetteMat.current.opacity) * k;
    }
  });

  return (
    <group>
      <mesh ref={markRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.8, 64]} />
        <meshBasicMaterial
          ref={markMat}
          color={"#f4a3c1"}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[16.5, 34, 96]} />
        <meshBasicMaterial
          ref={vignetteMat}
          color={"#0f172a"}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
