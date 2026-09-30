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
  s.lineTo(hw, depth * 0.8);
  s.quadraticCurveTo(hw * (1 + bow), depth * 0.9, hw * 0.9, depth);
  s.lineTo(-hw * 0.9, depth);
  s.quadraticCurveTo(-hw * (1 + bow), depth * 0.9, -hw, depth * 0.8);
  s.closePath();
  return s;
}

/**
 * A canopy roof plan: like curvedFloorPlan but larger (overhang) and with a
 * more dramatic front swoop — reads as a cantilever roof from above.
 */
export function canopyRoofPlan(width: number, depth: number, overhang = 0.35): THREE.Shape {
  const s = new THREE.Shape();
  const hw = width / 2 + overhang;
  const d = depth + overhang;
  s.moveTo(-hw, -overhang * 0.5);
  s.lineTo(hw, -overhang * 0.5);
  s.lineTo(hw * 1.05, d * 0.6);
  s.quadraticCurveTo(hw * 1.25, d * 1.02, hw * 0.85, d);
  s.lineTo(-hw * 0.85, d);
  s.quadraticCurveTo(-hw * 1.25, d * 1.02, -hw * 1.05, d * 0.6);
  s.closePath();
  return s;
}

/**
 * Teardrop pond outline centred on origin, with the pointed end at +z.
 */
export function teardropShape(rx: number, rz: number, taper = 0.5): THREE.Shape {
  const s = new THREE.Shape();
  const steps = 96;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    // Warp Z so the +z side pinches
    const warp = Math.sin(a) > 0 ? taper : 1;
    const x = Math.cos(a) * rx * warp;
    const z = Math.sin(a) * rz;
    if (i === 0) s.moveTo(x, z);
    else s.lineTo(x, z);
  }
  return s;
}

/**
 * A shape roughly matching the "leaf" plan of the central spine —
 * elongated ellipse pinched at both ends.
 */
export function spineLeafShape(length: number, width: number): THREE.Shape {
  const s = new THREE.Shape();
  const steps = 96;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * Math.PI * 2;
    const x = Math.cos(a) * (width / 2);
    const z = Math.sin(a) * (length / 2);
    // Pinch at ±z ends
    const pinch = 1 - 0.35 * Math.pow(Math.abs(Math.sin(a)), 3);
    if (i === 0) s.moveTo(x * pinch, z);
    else s.lineTo(x * pinch, z);
  }
  return s;
}

/**
 * Ring plan (annulus) used for the residential lake and the plaza water surround.
 */
export function ringShape(outerRx: number, outerRz: number, innerRx: number, innerRz: number): THREE.Shape {
  const s = new THREE.Shape();
  const steps = 96;
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
