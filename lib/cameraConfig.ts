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

/**
 * Viewport-adaptive ortho bounds.
 *
 * Landscape / desktop → 34-world-unit horizontal frame (BASE_FRAME_WIDTH).
 * Portrait / mobile   → cap the vertical extent so we don't reveal a huge
 *                       empty area above and below the campus; the horizontal
 *                       is derived from the cap × aspect. The horizontal is
 *                       kept ≥ 22 world units so the six primary blocks
 *                       (span ±3.85) plus the tower and lake stay comfortably
 *                       in view.
 */
export function orthoBoundsForViewport(aspect: number): OrthoBounds {
  const desktopFrame = 34;
  const portraitVerticalCap = 42;
  const portraitMinFrame = 22;

  let frameWidth = desktopFrame;
  const naturalVert = frameWidth / aspect;

  if (aspect < 1 && naturalVert > portraitVerticalCap) {
    // Constrain vertical, derive horizontal from the cap × aspect.
    frameWidth = Math.max(portraitMinFrame, portraitVerticalCap * aspect);
  }

  const halfH = frameWidth / 2;
  const halfV = halfH / aspect;
  return { left: -halfH, right: halfH, top: halfV, bottom: -halfV };
}

/** True when the viewport is portrait (h > w). */
export function isPortrait(width: number, height: number): boolean {
  return height > width;
}
