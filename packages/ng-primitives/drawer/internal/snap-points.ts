/* Adapted from Base UI useDrawerSnapPoints at c33f4210 (MIT, Material UI SAS). */
import { NgpDrawerSnapPoint } from '../drawer.types';

export interface ResolvedDrawerSnapPoint {
  readonly value: NgpDrawerSnapPoint;
  /**
   * Every declared value that resolves to this height, in declaration order. Deduplication keeps a
   * single point per height, so the declared values it absorbed must stay resolvable - otherwise an
   * active or default snap point declared as an equivalent value no longer matches any point.
   */
  readonly values: readonly NgpDrawerSnapPoint[];
  readonly height: number;
  readonly offset: number;
  readonly declaredIndex: number;
}

const LENGTH_PATTERN = /^([+-]?(?:\d+(?:\.\d+)?|\.\d+))(px|rem)$/;

export function resolveDrawerSnapPoints(
  values: readonly NgpDrawerSnapPoint[] | undefined,
  viewportHeight: number,
  popupHeight: number,
  rootFontSize: number,
): ResolvedDrawerSnapPoint[] {
  if (!values?.length || viewportHeight <= 0 || popupHeight <= 0 || rootFontSize <= 0) {
    return [];
  }

  const maximum = Math.min(viewportHeight, popupHeight);
  const resolved: ResolvedDrawerSnapPoint[] = [];
  values.forEach((value, declaredIndex) => {
    const rawHeight = resolveHeight(value, viewportHeight, rootFontSize);
    if (rawHeight === null) {
      return;
    }
    const height = Math.min(maximum, Math.max(0, rawHeight));
    const duplicateIndex = resolved.findIndex(point => Math.abs(point.height - height) <= 1);
    const duplicate = duplicateIndex >= 0 ? resolved[duplicateIndex] : null;
    const point = {
      value,
      values: duplicate ? [...duplicate.values, value] : [value],
      height,
      offset: popupHeight - height,
      declaredIndex,
    };
    if (duplicateIndex >= 0) {
      resolved.splice(duplicateIndex, 1, point);
    } else {
      resolved.push(point);
    }
  });

  return resolved.sort((a, b) => a.height - b.height || a.declaredIndex - b.declaredIndex);
}

export function closestDrawerSnapPoint(
  points: readonly ResolvedDrawerSnapPoint[],
  height: number,
): ResolvedDrawerSnapPoint | null {
  return points.reduce<ResolvedDrawerSnapPoint | null>((closest, point) => {
    if (!closest || Math.abs(point.height - height) < Math.abs(closest.height - height)) {
      return point;
    }
    return closest;
  }, null);
}

/**
 * Release speed, in pixels per millisecond toward dismissal, at which a flick closes the drawer
 * outright rather than resolving to a snap point. Mirrors Base UI's `FAST_SWIPE_VELOCITY`.
 */
export const FAST_SWIPE_VELOCITY = 0.5;

export function projectDrawerSnapPoint(
  points: readonly ResolvedDrawerSnapPoint[],
  active: ResolvedDrawerSnapPoint,
  directionalDisplacement: number,
  dismissVelocity: number,
  sequential: boolean,
): ResolvedDrawerSnapPoint | null {
  if (points.length === 0) {
    return null;
  }
  return sequential
    ? projectSequentialSnapPoint(points, active, directionalDisplacement, dismissVelocity)
    : projectFreeformSnapPoint(points, active, directionalDisplacement, dismissVelocity);
}

function projectFreeformSnapPoint(
  points: readonly ResolvedDrawerSnapPoint[],
  active: ResolvedDrawerSnapPoint,
  directionalDisplacement: number,
  dismissVelocity: number,
): ResolvedDrawerSnapPoint | null {
  // A decisive flick toward dismissal closes the drawer outright, without asking which snap point
  // the projection lands nearest (Base UI DrawerViewport.tsx:563-565).
  if (dismissVelocity >= FAST_SWIPE_VELOCITY && directionalDisplacement > 0) {
    return null;
  }
  const projectedVelocity =
    Math.abs(dismissVelocity) >= FAST_SWIPE_VELOCITY
      ? clampValue(dismissVelocity, -4, 4) * 300
      : 0;
  const projectedHeight = active.height - directionalDisplacement - projectedVelocity;
  const rawTarget = closestDrawerSnapPoint(points, projectedHeight);
  if (!rawTarget) {
    return null;
  }
  const closeIsNearest = Math.abs(projectedHeight) < Math.abs(rawTarget.height - projectedHeight);
  return closeIsNearest ? null : rawTarget;
}

/**
 * Ported from Base UI's `snapToSequentialPoints` branch (DrawerViewport.tsx:514-561). Works in
 * offset space, where `0` is fully open and `popupHeight` is fully closed, because that is the
 * space Base UI's three rules are expressed in.
 */
function projectSequentialSnapPoint(
  points: readonly ResolvedDrawerSnapPoint[],
  active: ResolvedDrawerSnapPoint,
  directionalDisplacement: number,
  dismissVelocity: number,
): ResolvedDrawerSnapPoint | null {
  // `offset = popupHeight - height` for every resolved point, so the popup height is recoverable
  // from the active point alone.
  const popupHeight = active.offset + active.height;
  const ordered = [...points].sort((first, second) => first.offset - second.offset);
  const currentOffset = active.offset;
  // Unlike the freeform path, the velocity projection is deliberately excluded here: a sequential
  // step is decided by where the finger actually went, and velocity only decides whether to force
  // the adjacent point below.
  const targetOffset = clampValue(currentOffset + directionalDisplacement, 0, popupHeight);
  const currentIndex = closestOffsetIndex(ordered, currentOffset);
  let targetIndex = closestOffsetIndex(ordered, targetOffset);
  let effectiveTargetOffset = targetOffset;

  const dragDirection = Math.sign(directionalDisplacement);
  const velocityDirection = Math.sign(dismissVelocity);
  const shouldAdvance =
    dragDirection !== 0 &&
    velocityDirection !== 0 &&
    velocityDirection === dragDirection &&
    Math.abs(dismissVelocity) >= FAST_SWIPE_VELOCITY;

  if (shouldAdvance) {
    const adjacentIndex = clampValue(currentIndex + dragDirection, 0, ordered.length - 1);
    if (adjacentIndex !== currentIndex) {
      const adjacent = ordered[adjacentIndex];
      const forceAdjacent =
        dragDirection > 0 ? targetOffset < adjacent.offset : targetOffset > adjacent.offset;
      if (forceAdjacent) {
        targetIndex = adjacentIndex;
        effectiveTargetOffset = adjacent.offset;
      }
    } else if (dragDirection > 0) {
      // Already at the most-dismissed point and still flicking that way.
      return null;
    }
  }

  const target = ordered[targetIndex];
  if (!target) {
    return null;
  }
  const closeDistance = Math.abs(effectiveTargetOffset - popupHeight);
  const snapDistance = Math.abs(effectiveTargetOffset - target.offset);
  return closeDistance < snapDistance ? null : target;
}

function closestOffsetIndex(points: readonly ResolvedDrawerSnapPoint[], offset: number): number {
  let closestIndex = -1;
  let closestDistance = Infinity;
  for (let index = 0; index < points.length; index += 1) {
    const distance = Math.abs(points[index].offset - offset);
    // Strict `<` keeps the first of equally-distant points, matching Base UI's
    // `closestSnapPointIndex` (useDrawerSnapPoints.ts:69-82).
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  }
  return closestIndex;
}

function clampValue(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function dampSnapOvershoot(signedMovement: number, activeOffset: number): number {
  const nextOffset = activeOffset + signedMovement;
  return nextOffset < 0 ? -Math.sqrt(-nextOffset) - activeOffset : signedMovement;
}

/**
 * The clamped height a single declared value resolves to, or `null` when the value is not a valid
 * snap point or the geometry is not measurable yet. Shares `resolveHeight` with
 * `resolveDrawerSnapPoints`, so a value that appears in `snapPoints` resolves identically whether
 * it is looked up in the resolved list or resolved on its own.
 */
export function resolveDrawerSnapPointHeight(
  value: NgpDrawerSnapPoint,
  viewportHeight: number,
  popupHeight: number,
  rootFontSize: number,
): number | null {
  if (viewportHeight <= 0 || popupHeight <= 0 || rootFontSize <= 0) {
    return null;
  }
  const rawHeight = resolveHeight(value, viewportHeight, rootFontSize);
  if (rawHeight === null) {
    return null;
  }
  return Math.min(Math.min(viewportHeight, popupHeight), Math.max(0, rawHeight));
}

function resolveHeight(
  value: NgpDrawerSnapPoint,
  viewportHeight: number,
  rootFontSize: number,
): number | null {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return null;
    }
    // A fraction is clamped into [0, 1] rather than rejected, matching Base UI's
    // `clamp(snapPoint, 0, 1) * viewportHeight` (useDrawerSnapPoints.ts:44-46). `Math.min(1, …)`
    // would be inert inside this branch, so only the lower bound is applied.
    return value <= 1 ? Math.max(0, value) * viewportHeight : value;
  }

  const match = LENGTH_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) {
    return null;
  }
  // A negative length is returned as-is. Both callers clamp with `Math.max(0, …)`, which is how
  // Base UI turns `'-5px'` into height 0 (useDrawerSnapPoints.ts:53-56 plus its caller's clamp).
  return match[2] === 'rem' ? amount * rootFontSize : amount;
}
