/**
 * Shared architectural material palette. Building components import these
 * refs so we don't allocate new MeshStandardMaterial per instance and so a
 * single theme edit propagates everywhere.
 *
 * Colours are tuned for clean daylight — no emissive, no bloom. The teal
 * glass has enough metalness/roughness to catch the directional key light
 * without looking neon.
 */

import * as THREE from "three";

export const COLORS = {
  whiteShell: "#f5f2ec",     // warm white architecture
  whiteShellCool: "#eef1f4", // cooler white for accents
  roofWhite: "#f8f6f1",
  roofRim: "#c9c4bb",
  tealGlass: "#7cc4c4",      // primary glass — soft turquoise
  tealGlassDeep: "#3f8a94",
  concreteLight: "#d9d4c8",  // sidewalk / plaza
  concreteWarm: "#c2bcae",
  roadDark: "#3f3f46",       // asphalt
  roadStripe: "#f4f4f2",
  grass: "#8fbf6d",
  grassDeep: "#6ba653",
  waterTurquoise: "#63c2c2",
  waterDeep: "#3f9ea6",
  trunk: "#7a5236",
  leavesGreen: "#4f9d5d",
  palmGreen: "#5aab63",
  blossomPink: "#f4a3c1",
  solar: "#243046",
  metalDark: "#7a7b80",
  ground: "#e7e4d8",         // pale terrain
  groundOutside: "#e2ded1",  // surrounding urban tissue
} as const;

// ---------------- Shared material singletons ----------------

export const M_WHITE_SHELL = new THREE.MeshStandardMaterial({
  color: COLORS.whiteShell,
  roughness: 0.7,
  metalness: 0.05,
});

export const M_ROOF_WHITE = new THREE.MeshStandardMaterial({
  color: COLORS.roofWhite,
  roughness: 0.55,
  metalness: 0.08,
});

export const M_ROOF_RIM = new THREE.MeshStandardMaterial({
  color: COLORS.roofRim,
  roughness: 0.8,
  metalness: 0.15,
});

export const M_TEAL_GLASS = new THREE.MeshStandardMaterial({
  color: COLORS.tealGlass,
  roughness: 0.22,
  metalness: 0.65,
  transparent: true,
  opacity: 0.94,
  envMapIntensity: 0.75,
});

export const M_TEAL_GLASS_DEEP = new THREE.MeshStandardMaterial({
  color: COLORS.tealGlassDeep,
  roughness: 0.25,
  metalness: 0.6,
  envMapIntensity: 0.7,
});

// Highlight tint used when a building is hovered — very subtle emissive lift.
export const M_TEAL_GLASS_HOVER = new THREE.MeshStandardMaterial({
  color: COLORS.tealGlass,
  roughness: 0.2,
  metalness: 0.65,
  transparent: true,
  opacity: 0.94,
  emissive: COLORS.tealGlass,
  emissiveIntensity: 0.35,
});

export const M_CONCRETE_LIGHT = new THREE.MeshStandardMaterial({
  color: COLORS.concreteLight,
  roughness: 0.95,
});

export const M_ROAD = new THREE.MeshStandardMaterial({
  color: COLORS.roadDark,
  roughness: 0.95,
});

export const M_ROAD_STRIPE = new THREE.MeshStandardMaterial({
  color: COLORS.roadStripe,
  roughness: 0.7,
});

export const M_GRASS = new THREE.MeshStandardMaterial({
  color: COLORS.grass,
  roughness: 1,
});

export const M_WATER = new THREE.MeshStandardMaterial({
  color: COLORS.waterTurquoise,
  roughness: 0.15,
  metalness: 0.75,
  transparent: true,
  opacity: 0.92,
  envMapIntensity: 1.1,
});

export const M_GROUND = new THREE.MeshStandardMaterial({
  color: COLORS.ground,
  roughness: 1,
});

export const M_METAL_DARK = new THREE.MeshStandardMaterial({
  color: COLORS.metalDark,
  roughness: 0.5,
  metalness: 0.7,
});

// Placeholder wireframe for Phase 1 building slots.
export const M_PLACEHOLDER = new THREE.MeshStandardMaterial({
  color: COLORS.tealGlass,
  roughness: 0.4,
  metalness: 0.3,
  wireframe: true,
  transparent: true,
  opacity: 0.5,
});

export const M_PLACEHOLDER_SOLID = new THREE.MeshStandardMaterial({
  color: COLORS.whiteShell,
  roughness: 0.7,
  transparent: true,
  opacity: 0.35,
});
