/* Adapted from Base UI DrawerViewport at c33f4210 (MIT, Material UI SAS). */

/** Below this speed (px/ms) a release is not fast enough to shorten the exit at all. */
export const MIN_RELEASE_VELOCITY = 0.2;
export const MAX_RELEASE_VELOCITY = 4;
export const MIN_RELEASE_DURATION_MS = 80;
export const MAX_RELEASE_DURATION_MS = 360;
export const MIN_RELEASE_SCALAR = 0.1;
export const MAX_RELEASE_SCALAR = 1;

export interface DrawerReleaseStrengthInput {
  /** The popup's length along the dismissal axis, in pixels. */
  readonly size: number;
  /** How far the popup has already travelled toward dismissal, including any snap-point offset. */
  readonly translation: number;
  /** Release velocity along the dismissal axis, in pixels per millisecond. */
  readonly releaseVelocity: number;
  /** Whole-gesture velocity, used when the release sample carries no movement. */
  readonly fallbackVelocity: number;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

/**
 * The scalar a consumer multiplies its exit `transition-duration` by, so a fast flick finishes the
 * dismissal quickly and a slow drag keeps the full duration. Returns `null` when the release
 * carries no useful speed, in which case the neutral value of `1` must be kept.
 */
export function resolveDrawerReleaseStrength(input: DrawerReleaseStrengthInput): number | null {
  if (!Number.isFinite(input.size) || input.size <= 0) {
    return null;
  }

  const remainingDistance = Math.max(0, input.size - input.translation);
  if (remainingDistance <= 0) {
    return null;
  }

  const velocity =
    Math.abs(input.releaseVelocity) > 0 ? input.releaseVelocity : input.fallbackVelocity;
  if (!Number.isFinite(velocity) || velocity <= MIN_RELEASE_VELOCITY) {
    return null;
  }

  const clampedVelocity = clamp(velocity, MIN_RELEASE_VELOCITY, MAX_RELEASE_VELOCITY);
  const durationMs = clamp(
    remainingDistance / clampedVelocity,
    MIN_RELEASE_DURATION_MS,
    MAX_RELEASE_DURATION_MS,
  );
  const normalizedDuration =
    (durationMs - MIN_RELEASE_DURATION_MS) / (MAX_RELEASE_DURATION_MS - MIN_RELEASE_DURATION_MS);
  const scalar =
    MIN_RELEASE_SCALAR + normalizedDuration * (MAX_RELEASE_SCALAR - MIN_RELEASE_SCALAR);
  // Three decimals is more than a transition duration can resolve and keeps the inline style
  // readable when a consumer inspects the element.
  return Math.round(scalar * 1000) / 1000;
}
