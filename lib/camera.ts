/**
 * Camera types and helpers shared by Phase 3/4.
 * Kept in a plain module so both server data (campusLocations) and client
 * components (CampusCamera, CameraTransition) can import it.
 */

export type Vec3 = readonly [number, number, number];

export type CameraState = {
  /** World position of the camera. */
  position: Vec3;
  /** Euler rotation (radians). Ignored when `target` is set. */
  rotation: Vec3;
  /** Optional look-at target; if set, overrides rotation at runtime. */
  target?: Vec3;
  /**
   * Field of view (perspective) OR ortho zoom multiplier (orthographic).
   * For the current orthographic camera treat this as a zoom factor —
   * higher = closer/tighter framing.
   */
  fov?: number;
  /** Orthographic zoom multiplier. 1 = default overview frame. */
  zoom?: number;
};

/** Linear interpolation of two camera states — sufficient for GSAP.to hooks. */
export function lerpCameraState(a: CameraState, b: CameraState, t: number): CameraState {
  const l = (x: number, y: number) => x + (y - x) * t;
  return {
    position: [
      l(a.position[0], b.position[0]),
      l(a.position[1], b.position[1]),
      l(a.position[2], b.position[2]),
    ],
    rotation: [
      l(a.rotation[0], b.rotation[0]),
      l(a.rotation[1], b.rotation[1]),
      l(a.rotation[2], b.rotation[2]),
    ],
    fov: a.fov !== undefined && b.fov !== undefined ? l(a.fov, b.fov) : b.fov ?? a.fov,
    zoom:
      a.zoom !== undefined && b.zoom !== undefined ? l(a.zoom, b.zoom) : b.zoom ?? a.zoom,
  };
}
