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
 * PHASE 5 — refined orthographic camera.
 *
 * The camera reads `journey.progress` and lerps between adjacent stops. On
 * top of that, it applies:
 *
 *   1. ARRIVAL SETTLING — as `journey.progress` approaches an integer, the
 *      lerp coefficient tightens, so the camera "locks" onto the target with
 *      a subtle final adjustment instead of stopping abruptly.
 *
 *   2. INTERRUPT-SAFE — because everything drives `journey.progress` (not a
 *      GSAP-owned camera), clicking a new location while another transition
 *      is running smoothly redirects instead of snapping.
 *
 *   3. IDLE BREATHING — after `IDLE_MS` of no interaction, an almost-
 *      imperceptible X/Z drift. Amplitude is 0 for reduced-motion users.
 *
 *   4. CINEMATIC OPENING — while `journey.opening` is true, the camera
 *      approaches from a slightly farther overview and eases into the
 *      resting overview frame.
 *
 *   5. MOUSE PARALLAX — very small clamped offset (±2% of frame),
 *      disabled on coarse-pointer devices and when reduced-motion is set.
 */

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// Reused vectors so we don't allocate per frame.
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

// Base frame width (world units) the ortho camera shows at zoom=1.
const BASE_FRAME_WIDTH = 30;

// Idle threshold — how long since last interaction before we start breathing.
const IDLE_MS = 3500;

// Opening — extra pull-back distance and duration.
const OPEN_MS = 1700;
const OPEN_ZOOM_START = 0.62;

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

    // Zoom
    const zA = a.zoom ?? 1;
    const zB = b.zoom ?? 1;
    let zTarget = clampZoom(zA + (zB - zA) * f);

    // ---------------- Cinematic opening ----------------
    // Pull back slightly farther than final overview, then ease in.
    if (journey.opening) {
      if (openStart.current == null) openStart.current = state.clock.elapsedTime * 1000;
      const elapsed = state.clock.elapsedTime * 1000 - openStart.current;
      const kOpen = clamp(elapsed / OPEN_MS, 0, 1);
      const e = easeOutExpo(kOpen);
      const startZoom = OPEN_ZOOM_START;
      zTarget = clampZoom(startZoom + (zTarget - startZoom) * e);
      // Nudge the camera farther out early on
      const pull = (1 - e) * 3.0;
      vPos.y += pull;
      vPos.z += pull * 0.6;
      if (kOpen >= 1) {
        // Signal opening finished (once)
        if (journey.opening) {
          journey.opening = false;
        }
      }
    }

    // ---------------- Idle breathing ----------------
    // Only when the user has been still for a while, not opening, not
    // transitioning, and reduced motion is off.
    if (
      !journey.opening &&
      !journey.transitioning &&
      !journey.reducedMotion &&
      typeof performance !== "undefined" &&
      performance.now() - journey.lastInteraction > IDLE_MS
    ) {
      const t = state.clock.elapsedTime;
      const amp = 0.06; // world units — tiny
      vBreath.set(
        Math.sin(t * 0.35) * amp,
        0,
        Math.cos(t * 0.28) * amp * 0.6,
      );
      vPos.add(vBreath);
      vTarget.add(vBreath.multiplyScalar(0.6));
    }

    // ---------------- Mouse parallax ----------------
    if (!coarsePointer.current && !journey.reducedMotion && !journey.opening) {
      const parallaxScale = ((cam.right - cam.left) / cam.zoom) * 0.02;
      vPos.x += state.pointer.x * parallaxScale;
      vPos.z += -state.pointer.y * parallaxScale * 0.5;
    }

    // ---------------- Approach + settle ----------------
    // A tighter coefficient when close to a discrete stop creates the
    // "camera locks onto architecture" feeling.
    const distToStop = Math.min(f, 1 - f);
    const isTransitioning = journey.transitioning;

    // Base coefficient: firmer during transitions (feels intentional),
    // softer when just idling / parallaxing.
    let k = isTransitioning ? 0.12 : 0.08;

    // Slight anticipation: start slower for the first 10% of a transition
    if (isTransitioning && distToStop > 0.42) k *= 0.85;

    // Settle: sharpen the approach when very close to a stop
    if (distToStop < 0.06) k = Math.min(0.2, k + 0.08);

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

    // End of "transitioning" mode: once we've fully arrived, clear the flag.
    if (isTransitioning) {
      const posD = cam.position.distanceTo(vPos);
      const zoomD = Math.abs(cam.zoom - zTarget);
      if (posD < 0.02 && zoomD < 0.005) {
        journey.transitioning = false;
      }
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
