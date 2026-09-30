/**
 * Reusable architectural shape helpers. Kept in a plain module so any
 * building component can construct real 3D geometry from the same primitives.
 */

import * as THREE from "three";

/**
 * Curved-plan footprint: a rectangle whose front (+z) edge is bowed outward
 * with a quadratic curve. Used as an ExtrudeGeometry profile for
 * curved-facade wing buildings.
 */
export function curvedFloorPlan(width: number, depth: number, bow = 0.35): THREE.Shape {
  const s = new THREE.Shape();
  const hw = width / 2;
  s.moveTo(-hw, 0);
  s.lineTo(hw, 0);
  s.lineTo(hw, depth * 0.75);
  s.quadraticCurveTo(hw * (1 + bow), depth * 0.92, hw * 0.88, depth);
  s.lineTo(-hw * 0.88, depth);
  s.quadraticCurveTo(-hw * (1 + bow), depth * 0.92, -hw, depth * 0.75);
  s.closePath();
  return s;
}

/**
 * Elongated cantilever roof — an aerodynamic sweep that overhangs the base
 * more dramatically than the plan under it. Used for wing-building roofs so
 * the roof reads as visually floating above the body.
 */
export function canopyRoofPlan(width: number, depth: number, overhang = 0.5): THREE.Shape {
  const s = new THREE.Shape();
  const hw = width / 2 + overhang;
  const d = depth + overhang;
  const back = -overhang * 0.7;
  s.moveTo(-hw, back);
  s.lineTo(hw, back);
  // sweep forward and outward — big cantilever on +z side
  s.lineTo(hw * 1.02, d * 0.55);
  s.quadraticCurveTo(hw * 1.28, d * 1.05, hw * 0.78, d);
  s.lineTo(-hw * 0.78, d);
  s.quadraticCurveTo(-hw * 1.28, d * 1.05, -hw * 1.02, d * 0.55);
  s.closePath();
  return s;
}

/**
 * The elegant "leaf" plan of the central spine — long ellipse with
 * strong pinches at both ends. The `pinch` and `taper` params control how
 * dramatically the ends narrow.
 */
export function spineLeafShape(
  length: number,
  width: number,
  pinchStrength = 0.55,
): THREE.Shape {
  const s = new THREE.Shape();
  const steps = 128;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * Math.PI * 2;
    const rawX = Math.cos(a) * (width / 2);
    const rawZ = Math.sin(a) * (length / 2);
    // Strong pinch at the ±z ends — makes the leaf taper elegantly
    const pinch = 1 - pinchStrength * Math.pow(Math.abs(Math.sin(a)), 2.6);
    if (i === 0) s.moveTo(rawX * pinch, rawZ);
    else s.lineTo(rawX * pinch, rawZ);
  }
  return s;
}

/**
 * A raindrop / teardrop water outline centred on origin, with the pointed
 * end at +z.
 */
export function teardropShape(rx: number, rz: number, taper = 0.55): THREE.Shape {
  const s = new THREE.Shape();
  const steps = 128;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const warp = Math.sin(a) > 0 ? taper : 1;
    const x = Math.cos(a) * rx * warp;
    const z = Math.sin(a) * rz;
    if (i === 0) s.moveTo(x, z);
    else s.lineTo(x, z);
  }
  return s;
}

/**
 * Elliptical ring — outer ellipse with an inner elliptical hole.
 */
export function ringShape(
  outerRx: number,
  outerRz: number,
  innerRx: number,
  innerRz: number,
): THREE.Shape {
  const s = new THREE.Shape();
  const steps = 128;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const x = Math.cos(a) * outerRx;
    const z = Math.sin(a) * outerRz;
    if (i === 0) s.moveTo(x, z);
    else s.lineTo(x, z);
  }
  const hole = new THREE.Path();
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const x = Math.cos(a) * innerRx;
    const z = Math.sin(a) * innerRz;
    if (i === 0) hole.moveTo(x, z);
    else hole.lineTo(x, z);
  }
  s.holes.push(hole);
  return s;
}

/**
 * A smooth peanut/kidney bean shape — used for water bodies that should feel
 * intentionally designed rather than perfectly elliptical.
 */
export function designedPondShape(
  rx: number,
  rz: number,
  kidney = 0.15,
): THREE.Shape {
  const s = new THREE.Shape();
  const steps = 128;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const warp = 1 + kidney * Math.cos(a * 2);
    const x = Math.cos(a) * rx * warp;
    const z = Math.sin(a) * rz;
    if (i === 0) s.moveTo(x, z);
    else s.lineTo(x, z);
  }
  return s;
}
