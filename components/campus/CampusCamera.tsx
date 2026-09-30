"use client";

import { OrthographicCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrthographicCamera as ThreeOrthographicCamera } from "three";

import { CAMPUS_LOCATIONS, N_STOPS } from "@/data/campusLocations";
import { journey } from "@/lib/journey";
import { clampZoom, orthoBoundsForZoom } from "@/lib/cameraConfig";

/**
 * Scroll-driven ORTHOGRAPHIC camera — the correct camera for an architectural
 * masterplan view. Reads `journey.progress` and lerps position/target/zoom
 * between the two nearest stops.
 *
 * Mouse parallax is a very small clamped offset (±2% of frame), disabled on
 * coarse-pointer devices.
 */

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// Reused vectors so we don't allocate per frame.
const vPos = new THREE.Vector3();
const vTarget = new THREE.Vector3();
const vA = new THREE.Vector3();
const vB = new THREE.Vector3();
const tA = new THREE.Vector3();
const tB = new THREE.Vector3();

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Base frame width (world units) the ortho camera shows at zoom=1.
const BASE_FRAME_WIDTH = 30;

export default function CampusCamera() {
  const camRef = useRef<ThreeOrthographicCamera>(null);
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const inited = useRef(false);
  const coarsePointer = useRef(false);
  const { size } = useThree();

  useEffect(() => {
    coarsePointer.current =
      typeof window !== "undefined" &&
      window.matchMedia?.("(pointer: coarse)").matches;
  }, []);

  // Keep the ortho frustum matching the viewport aspect on resize.
  useEffect(() => {
    const cam = camRef.current;
    if (!cam) return;
    const aspect = size.width / size.height;
    const b = orthoBoundsForZoom(BASE_FRAME_WIDTH, aspect);
    cam.left = b.left;
    cam.right = b.right;
    cam.top = b.top;
    cam.bottom = b.bottom;
    cam.updateProjectionMatrix();
  }, [size.width, size.height]);

  useFrame((state) => {
    const cam = camRef.current;
    if (!cam) return;

    const p = clamp(journey.progress, 0, N_STOPS - 1);
    const i0 = clamp(Math.floor(p), 0, N_STOPS - 1);
    const i1 = clamp(i0 + 1, 0, N_STOPS - 1);
    const f = easeInOutCubic(clamp(p - i0, 0, 1));

    const a = CAMPUS_LOCATIONS[i0].camera;
    const b = CAMPUS_LOCATIONS[i1].camera;

    vA.set(a.position[0], a.position[1], a.position[2]);
    vB.set(b.position[0], b.position[1], b.position[2]);
    tA.set(a.target?.[0] ?? 0, a.target?.[1] ?? 0, a.target?.[2] ?? 0);
    tB.set(b.target?.[0] ?? 0, b.target?.[1] ?? 0, b.target?.[2] ?? 0);

    vPos.copy(vA).lerp(vB, f);
    vTarget.copy(tA).lerp(tB, f);

    // Very subtle mouse parallax: clamp to a fraction of the current frame width.
    if (!coarsePointer.current) {
      const parallaxScale = ((cam.right - cam.left) / cam.zoom) * 0.02;
      vPos.x += state.pointer.x * parallaxScale;
      vPos.z += -state.pointer.y * parallaxScale * 0.5;
    }

    // Zoom
    const zA = a.zoom ?? 1;
    const zB = b.zoom ?? 1;
    const zTarget = clampZoom(zA + (zB - zA) * f);

    if (!inited.current) {
      cam.position.copy(vPos);
      target.current.copy(vTarget);
      cam.zoom = zTarget;
      cam.updateProjectionMatrix();
      inited.current = true;
    } else {
      const k = 0.08;
      cam.position.lerp(vPos, k);
      target.current.lerp(vTarget, k);
      const nextZoom = cam.zoom + (zTarget - cam.zoom) * k;
      if (Math.abs(nextZoom - cam.zoom) > 0.001) {
        cam.zoom = nextZoom;
        cam.updateProjectionMatrix();
      }
    }

    cam.lookAt(target.current);
  });

  return (
    <OrthographicCamera
      ref={camRef}
      makeDefault
      near={0.1}
      far={200}
      position={[
        CAMPUS_LOCATIONS[0].camera.position[0],
        CAMPUS_LOCATIONS[0].camera.position[1],
        CAMPUS_LOCATIONS[0].camera.position[2],
      ]}
      zoom={CAMPUS_LOCATIONS[0].camera.zoom ?? 1}
    />
  );
}
