// ============================================================
// Ripple – Animation Configuration
// ------------------------------------------------------------
// Centralised spring / timing values. Tweak these to change
// the feel of every animation in the app at once, or override
// per-component.
// ============================================================

/** Spring presets for react-spring / R3F camera moves. */
export const springs = {
  /** Default snappy spring. */
  snappy: { mass: 1, tension: 200, friction: 26 },
  /** Smooth glide for camera transitions. */
  glide: { mass: 2, tension: 120, friction: 30 },
  /** Bouncy entrance. */
  bounce: { mass: 1, tension: 180, friction: 12 },
  /** Slow reveal for UI panels. */
  reveal: { mass: 1, tension: 100, friction: 20 },
} as const;

/** CSS transition durations (ms). */
export const durations = {
  fast: 150,
  normal: 300,
  slow: 600,
  phaseTransition: 1200,
} as const;

/** Easing curves (CSS strings). */
export const easings = {
  smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
  snap: "cubic-bezier(0.2, 0, 0, 1)",
  bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

/** Z-axis spacing between timeline nodes (Three.js units). */
export const TIMELINE_Z_SPACING = 4;

/** How far the camera sits from the active node on the z-axis. */
export const CAMERA_Z_OFFSET = 6;
