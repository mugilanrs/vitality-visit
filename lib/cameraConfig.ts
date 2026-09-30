/**
 * Centralised camera math for the orthographic architectural view.
 *
 * The campus occupies roughly a 26×22 world-unit oval centred on the origin.
 * The default overview frame width fits that bounds with a small margin.
 *
 * `orthoBoundsForZoom` returns the left/right/top/bottom that keeps the
 * scene centred across viewport aspect ratios.
 */

export const CAMPUS_BOUNDS = {
  width: 28,
  depth: 24,
  centre: [0, 0, -1] as const,
};

export type OrthoBounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

/**
 * `frameWidth` is the world-space width the camera should show at zoom=1.
 * Returns the frustum bounds that keep that width for a given aspect ratio.
 */
export function orthoBoundsForZoom(frameWidth: number, aspect: number): OrthoBounds {
  const half = frameWidth / 2;
  const halfV = half / aspect;
  return { left: -half, right: half, top: halfV, bottom: -halfV };
}

/**
 * Sensible clamp so wildly-lerped zooms don't collapse or explode the frustum.
 */
export function clampZoom(z: number, min = 0.5, max = 3.5): number {
  return Math.max(min, Math.min(max, z));
}
