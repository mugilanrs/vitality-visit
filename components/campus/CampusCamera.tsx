"use client";

import { OrthographicCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrthographicCamera as ThreeOrthographicCamera } from "three";

import { CAMPUS_LOCATIONS, N_STOPS } from "@/data/campusLocations";
import { BUILDINGS } from "@/data/buildings";
import { journey } from "@/lib/journey";
import { clampZoom, orthoBoundsForViewport } from "@/lib/cameraConfig";
import type { CameraState } from "@/lib/camera";

/**
 * PHASE 5–7 — orthographic camera.
 *
 * Two possible frames per frame:
 *
 *   focus.level === "campus"  → interpolate along the scroll journey
 *                               (Phase 5 behaviour, kept unchanged).
 *
 *   focus.level !== "campus"  → aim at the focus target (building / floor /
 *                               room / interior). No parallax, no idle
 *                               breathing while drilled in.
 *
 * The transition between the two branches is smoothed by the same lerp
 * coefficients, so switching from campus to a building feels like the same
 * camera flying through the architecture.
 */

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const vPos = new THREE.Vector3();
const vTarget = new THREE.Vector3();
const vA = new THREE.Vector3();
const vB = new THREE.Vector3();
const tA = new THREE.Vector3();
const tB = new THREE.Vector3();
const vBreath = new THREE.Vector3();

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOutExpo(t: number) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

const IDLE_MS = 3500;
const OPEN_MS = 1700;
const OPEN_ZOOM_START = 0.62;

function focusCamera(): CameraState | null {
  const f = journey.focus;
  if (f.level === "campus" || f.building == null) return null;
  const b = BUILDINGS[f.building];
  if (!b) return null;
  if (f.level === "building") return b.camera;
  const floor = b.floors.find((x) => x.index === f.floor);
  if (!floor) return b.camera;
  if (f.level === "floor") return floor.camera;
  const room = floor.rooms.find((r) => r.id === f.roomId);
  if (!room) return floor.camera;
  if (f.level === "room") return floor.camera; // still frame the floor while the room card shows
  if (f.level === "inside") return room.interior;
  return b.camera;
}

export default function CampusCamera() {
  const camRef = useRef<ThreeOrthographicCamera>(null);
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const inited = useRef(false);
  const coarsePointer = useRef(false);
  const openStart = useRef<number | null>(null);
  const { size } = useThree();

  useEffect(() => {
    if (typeof window === "undefined") return;
    coarsePointer.current = window.matchMedia?.("(pointer: coarse)").matches;
  }, []);

  useEffect(() => {
    const cam = camRef.current;
    if (!cam) return;
    const aspect = size.width / size.height;
    const b = orthoBoundsForViewport(aspect);
    cam.left = b.left;
    cam.right = b.right;
    cam.top = b.top;
    cam.bottom = b.bottom;
    cam.updateProjectionMatrix();
  }, [size.width, size.height]);

  useFrame((state) => {
    const cam = camRef.current;
    if (!cam) return;

    const focus = focusCamera();
    let zTarget: number;

    if (focus) {
      // ---------------- Focus-driven framing ----------------
      vPos.set(focus.position[0], focus.position[1], focus.position[2]);
      vTarget.set(focus.target![0], focus.target![1], focus.target![2]);
      zTarget = clampZoom(focus.zoom ?? 1);
    } else {
      // ---------------- Scroll-driven framing (Phase 5) ----------------
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

      const zA = a.zoom ?? 1;
      const zB = b.zoom ?? 1;
      zTarget = clampZoom(zA + (zB - zA) * f);
    }

    // ---------------- Cinematic opening ----------------
    if (journey.opening && !journey.welcome) {
      if (openStart.current == null) openStart.current = state.clock.elapsedTime * 1000;
      const elapsed = state.clock.elapsedTime * 1000 - openStart.current;
      const kOpen = clamp(elapsed / OPEN_MS, 0, 1);
      const e = easeOutExpo(kOpen);
      zTarget = clampZoom(OPEN_ZOOM_START + (zTarget - OPEN_ZOOM_START) * e);
      const pull = (1 - e) * 3.0;
      vPos.y += pull;
      vPos.z += pull * 0.6;
      if (kOpen >= 1) journey.opening = false;
    }

    const isInFocus = journey.focus.level !== "campus";

    // ---------------- Idle breathing (campus overview only) ----------------
    if (
      !journey.welcome &&
      !journey.opening &&
      !journey.transitioning &&
      !journey.reducedMotion &&
      !isInFocus &&
      typeof performance !== "undefined" &&
      performance.now() - journey.lastInteraction > IDLE_MS
    ) {
      const t = state.clock.elapsedTime;
      const amp = 0.06;
      vBreath.set(
        Math.sin(t * 0.35) * amp,
        0,
        Math.cos(t * 0.28) * amp * 0.6,
      );
      vPos.add(vBreath);
      vTarget.add(vBreath.multiplyScalar(0.6));
    }

    // ---------------- Mouse parallax ----------------
    // Suppressed while welcome intro is showing, while drilled in, and
    // while a hotspot is under the cursor — this kills the entrance/
    // auditorium flicker.
    const parallaxOK =
      !coarsePointer.current &&
      !journey.reducedMotion &&
      !journey.opening &&
      !journey.welcome &&
      !isInFocus &&
      journey.hoverIndex == null;

    if (parallaxOK) {
      const parallaxScale = ((cam.right - cam.left) / cam.zoom) * 0.02;
      vPos.x += state.pointer.x * parallaxScale;
      vPos.z += -state.pointer.y * parallaxScale * 0.5;
    }

    // ---------------- Approach + settle ----------------
    const distToStop =
      focus == null
        ? Math.min(
            journey.progress - Math.floor(journey.progress),
            1 - (journey.progress - Math.floor(journey.progress)),
          )
        : 0;
    const isTransitioning = journey.transitioning || isInFocus;

    let k = isTransitioning ? 0.1 : 0.08;
    if (!isInFocus && isTransitioning && distToStop > 0.42) k *= 0.85;
    if (!isInFocus && distToStop < 0.06) k = Math.min(0.2, k + 0.08);
    if (journey.reducedMotion) k = Math.min(1, k * 2.2);

    if (!inited.current) {
      cam.position.copy(vPos);
      target.current.copy(vTarget);
      cam.zoom = zTarget;
      cam.updateProjectionMatrix();
      inited.current = true;
    } else {
      cam.position.lerp(vPos, k);
      target.current.lerp(vTarget, k);
      const nextZoom = cam.zoom + (zTarget - cam.zoom) * k;
      if (Math.abs(nextZoom - cam.zoom) > 0.0005) {
        cam.zoom = nextZoom;
        cam.updateProjectionMatrix();
      }
    }

    cam.lookAt(target.current);

    if (isTransitioning && !isInFocus) {
      const posD = cam.position.distanceTo(vPos);
      const zoomD = Math.abs(cam.zoom - zTarget);
      if (posD < 0.02 && zoomD < 0.005) journey.transitioning = false;
    }
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
