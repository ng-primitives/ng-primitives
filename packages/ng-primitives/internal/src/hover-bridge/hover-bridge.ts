/**
 * Fallback timeout (ms) after which an idle hover bridge closes the overlay.
 * Shared so tooltip, menu and submenu hover-intent behaviour stay in sync.
 */
export const HOVER_BRIDGE_TIMEOUT_MS = 150;

export interface HoverBridgePoint {
  x: number;
  y: number;
}

interface CreateHoverBridgePolygonOptions {
  triggerRect: DOMRect | null;
  targetRect: DOMRect | null;
  exitPoint: HoverBridgePoint;
  corridorHalfSize?: number;
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

  const triggerCenterX = triggerRect.left + triggerRect.width / 2;
  const triggerCenterY = triggerRect.top + triggerRect.height / 2;
  const targetCenterX = targetRect.left + targetRect.width / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;

  const dx = targetCenterX - triggerCenterX;
  const dy = targetCenterY - triggerCenterY;
  const horizontalDominant = Math.abs(dx) >= Math.abs(dy);

  if (horizontalDominant) {
    const targetX = dx >= 0 ? targetRect.left : targetRect.right;
    return [
      { x: exitPoint.x, y: exitPoint.y - corridorHalfSize },
      { x: exitPoint.x, y: exitPoint.y + corridorHalfSize },
      { x: targetX, y: targetRect.bottom + corridorHalfSize },
      { x: targetX, y: targetRect.top - corridorHalfSize },
    ];
  }

  const targetY = dy >= 0 ? targetRect.top : targetRect.bottom;
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
