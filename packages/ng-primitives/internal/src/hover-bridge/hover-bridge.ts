/**
 * Fallback timeout (ms) after which an idle hover bridge closes the overlay.
 * Shared so tooltip, menu and submenu hover-intent behaviour stay in sync.
 */
export const HOVER_BRIDGE_TIMEOUT_MS = 150;

/**
 * Pointer movement below this magnitude (px) on the intent axis is treated as
 * jitter, not a reversal, so a tiny backward twitch doesn't collapse the bridge.
 */
export const HOVER_BRIDGE_DIRECTION_TOLERANCE_PX = 2;

export interface HoverBridgePoint {
  x: number;
  y: number;
}

/**
 * The dominant axis and sign pointing from the trigger toward the target. Used
 * to reject pointer movement heading away from the target while inside the corridor.
 */
export interface HoverBridgeDirection {
  axis: 'x' | 'y';
  sign: 1 | -1;
}

interface CreateHoverBridgePolygonOptions {
  triggerRect: DOMRect | null;
  targetRect: DOMRect | null;
  exitPoint: HoverBridgePoint;
  corridorHalfSize?: number;
}

/**
 * Computes the dominant axis and sign from the trigger toward the target - i.e.
 * which way the pointer must travel to reach the panel. Returns null if either
 * rect is missing.
 */
export function getHoverBridgeDirection(
  triggerRect: DOMRect | null,
  targetRect: DOMRect | null,
): HoverBridgeDirection | null {
  if (!triggerRect || !targetRect) {
    return null;
  }

  const dx = targetRect.left + targetRect.width / 2 - (triggerRect.left + triggerRect.width / 2);
  const dy = targetRect.top + targetRect.height / 2 - (triggerRect.top + triggerRect.height / 2);

  // Prefer the axis on which the rects are separated: a bottom-placed panel that
  // is wider than its trigger still overlaps it horizontally, so travel must be
  // vertical even when the centers are further apart horizontally. Being
  // rect-based (rather than reading the configured placement) keeps this correct
  // after the overlay flips.
  const overlapsX = triggerRect.left < targetRect.right && targetRect.left < triggerRect.right;
  const overlapsY = triggerRect.top < targetRect.bottom && targetRect.top < triggerRect.bottom;

  if (overlapsX !== overlapsY) {
    return overlapsX
      ? { axis: 'y', sign: dy >= 0 ? 1 : -1 }
      : { axis: 'x', sign: dx >= 0 ? 1 : -1 };
  }

  // Fully separated (diagonal travel) or fully overlapping: fall back to centers.
  if (Math.abs(dx) >= Math.abs(dy)) {
    return { axis: 'x', sign: dx >= 0 ? 1 : -1 };
  }

  return { axis: 'y', sign: dy >= 0 ? 1 : -1 };
}

/**
 * Builds a pointer grace polygon between the trigger exit point and the target overlay.
 * The polygon is intentionally directional so moving away from the target exits quickly.
 */
export function createHoverBridgePolygon({
  triggerRect,
  targetRect,
  exitPoint,
  corridorHalfSize = 8,
}: CreateHoverBridgePolygonOptions): HoverBridgePoint[] | null {
  if (!triggerRect || !targetRect) {
    return null;
  }

  const direction = getHoverBridgeDirection(triggerRect, targetRect);
  if (!direction) {
    return null;
  }

  if (direction.axis === 'x') {
    const targetX = direction.sign >= 0 ? targetRect.left : targetRect.right;
    return [
      { x: exitPoint.x, y: exitPoint.y - corridorHalfSize },
      { x: exitPoint.x, y: exitPoint.y + corridorHalfSize },
      { x: targetX, y: targetRect.bottom + corridorHalfSize },
      { x: targetX, y: targetRect.top - corridorHalfSize },
    ];
  }

  const targetY = direction.sign >= 0 ? targetRect.top : targetRect.bottom;
  return [
    { x: exitPoint.x - corridorHalfSize, y: exitPoint.y },
    { x: exitPoint.x + corridorHalfSize, y: exitPoint.y },
    { x: targetRect.right + corridorHalfSize, y: targetY },
    { x: targetRect.left - corridorHalfSize, y: targetY },
  ];
}

/**
 * Returns true when the point lies inside the provided polygon.
 */
export function isPointInHoverBridgePolygon(
  point: HoverBridgePoint,
  polygon: HoverBridgePoint[],
): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi || Number.EPSILON) + xi;
    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}
