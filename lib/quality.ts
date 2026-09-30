/**
 * PHASE 6 — quality tier detection.
 *
 * Desktop → HIGH, tablet → MEDIUM, phone → LOW. The architecture stays
 * recognizable at every tier — only shadows / post / vegetation density /
 * water complexity scale down.
 */

export type QualityTier = "high" | "medium" | "low";

export type QualitySettings = {
  tier: QualityTier;
  dpr: [number, number];
  shadowMap: number;
  softShadows: boolean;
  contactShadowsRes: number;
  vegetationScale: number;
  ambientMotion: boolean;
  parallax: boolean;
};

export function detectQuality(): QualitySettings {
  if (typeof window === "undefined") {
    return HIGH;
  }
  const w = window.innerWidth;
  const isCoarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  if (w < 720 || (isCoarse && w < 900)) return LOW;
  if (w < 1200 || isCoarse) return MEDIUM;
  return HIGH;
}

const HIGH: QualitySettings = {
  tier: "high",
  dpr: [1, 2],
  shadowMap: 2048,
  softShadows: true,
  contactShadowsRes: 1024,
  vegetationScale: 1,
  ambientMotion: true,
  parallax: true,
};

const MEDIUM: QualitySettings = {
  tier: "medium",
  dpr: [1, 1.75],
  shadowMap: 1024,
  softShadows: true,
  contactShadowsRes: 768,
  vegetationScale: 0.75,
  ambientMotion: true,
  parallax: true,
};

const LOW: QualitySettings = {
  tier: "low",
  dpr: [1, 1.5],
  shadowMap: 512,
  softShadows: false,
  contactShadowsRes: 512,
  vegetationScale: 0.55,
  ambientMotion: false,
  parallax: false,
};
