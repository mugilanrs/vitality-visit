"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { CAMPUS_LOCATIONS } from "@/data/campusLocations";
import { journey } from "@/lib/journey";

/**
 * PHASE 5 — spatial focus mark + soft dimming vignette.
 *
 * A wide, very soft circular disc sits under the ACTIVE location:
 *   - Extremely low opacity, larger radius — reads as "this is where you are"
 *   - The mark's colour picks up the location's accent
 *   - It moves smoothly from one stop to the next along with the camera
 *
 * A darker outer ring is drawn just outside the campus site disc — as a
 * location becomes active the *outer* ring becomes slightly darker, subtly
 * pulling attention inward without darkening the whole scene.
 *
 * Neither element is aggressive: the goal is "focus", not "spotlight".
 */

const currentTarget = new THREE.Vector3();
const targetPos = new THREE.Vector3();

export default function SpatialFocus() {
  const markRef = useRef<THREE.Mesh>(null);
  const markMat = useRef<THREE.MeshBasicMaterial | null>(null);
  const vignetteMat = useRef<THREE.MeshBasicMaterial | null>(null);
  const currentColor = useRef(new THREE.Color(0x7cc4c4));
  const targetColor = useRef(new THREE.Color(0x7cc4c4));

  useFrame((_, dt) => {
    const mark = markRef.current;
    if (!mark) return;

    // Pull target from active location (interpolated toward the current progress).
    const p = journey.progress;
    const i0 = Math.max(0, Math.min(CAMPUS_LOCATIONS.length - 1, Math.floor(p)));
    const i1 = Math.min(CAMPUS_LOCATIONS.length - 1, i0 + 1);
    const f = Math.max(0, Math.min(1, p - i0));
    const A = CAMPUS_LOCATIONS[i0].hotspotPosition;
    const B = CAMPUS_LOCATIONS[i1].hotspotPosition;
    targetPos.set(
      A[0] + (B[0] - A[0]) * f,
      0.02,
      A[2] + (B[2] - A[2]) * f,
    );

    const active = CAMPUS_LOCATIONS[Math.round(p)];
    targetColor.current.set(active.accent);

    // Smooth position + color
    const k = Math.min(1, dt * 3.5);
    currentTarget.lerp(targetPos, k);
    currentColor.current.lerp(targetColor.current, k);
    mark.position.copy(currentTarget);

    // Fade in/out — mark is nearly invisible during pure overview mode
    const overviewFade = journey.overview ? 0.0 : 1.0;
    const targetOpacity = 0.16 * overviewFade;
    if (markMat.current) {
      markMat.current.opacity += (targetOpacity - markMat.current.opacity) * k;
      markMat.current.color.copy(currentColor.current);
    }

    // Vignette — barely-there darker ring outside the site.
    const vigTarget = journey.overview ? 0.0 : 0.14;
    if (vignetteMat.current) {
      vignetteMat.current.opacity +=
        (vigTarget - vignetteMat.current.opacity) * k;
    }
  });

  return (
    <group>
      {/* Focus disc — soft luminous halo under the active location */}
      <mesh ref={markRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[2.4, 64]} />
        <meshBasicMaterial
          ref={markMat}
          color={"#7cc4c4"}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Vignette ring outside the campus site — extremely low opacity */}
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
