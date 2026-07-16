/* Adapted from Base UI useDrawerSnapPoints at c33f4210 (MIT, Material UI SAS). */
import { NgpDrawerSnapPoint } from '../drawer.types';

export interface ResolvedDrawerSnapPoint {
  readonly value: NgpDrawerSnapPoint;
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
    const point = { value, height, offset: popupHeight - height, declaredIndex };
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

export function projectDrawerSnapPoint(
  points: readonly ResolvedDrawerSnapPoint[],
  active: ResolvedDrawerSnapPoint,
  directionalDisplacement: number,
  dismissVelocity: number,
  sequential: boolean,
): ResolvedDrawerSnapPoint | null {
  const projectedVelocity =
    Math.abs(dismissVelocity) >= 0.5 ? Math.max(-4, Math.min(4, dismissVelocity)) * 300 : 0;
  const projectedHeight = active.height - directionalDisplacement - projectedVelocity;
  const rawTarget = closestDrawerSnapPoint(points, projectedHeight);
  if (!rawTarget) {
    return null;
  }

  const closeIsNearest = Math.abs(projectedHeight) < Math.abs(rawTarget.height - projectedHeight);
  const rawDestinationIndex = closeIsNearest ? -1 : points.indexOf(rawTarget);
  if (!sequential) {
    return rawDestinationIndex < 0 ? null : (points[rawDestinationIndex] ?? rawTarget);
  }

  const activeIndex = points.indexOf(active);
  const destinationIndex = Math.max(
    activeIndex - 1,
    Math.min(activeIndex + 1, rawDestinationIndex),
  );
  return destinationIndex < 0 ? null : (points[destinationIndex] ?? active);
}

export function dampSnapOvershoot(signedMovement: number, activeOffset: number): number {
  const nextOffset = activeOffset + signedMovement;
  return nextOffset < 0 ? -Math.sqrt(-nextOffset) - activeOffset : signedMovement;
}

function resolveHeight(
  value: NgpDrawerSnapPoint,
  viewportHeight: number,
  rootFontSize: number,
): number | null {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) {
      return null;
    }
    return value <= 1 ? value * viewportHeight : value;
  }

  const match = LENGTH_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }
  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }
  return match[2] === 'rem' ? amount * rootFontSize : amount;
}
