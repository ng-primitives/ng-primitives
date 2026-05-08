export interface TooltipHoverBridgePoint {
  x: number;
  y: number;
}

interface CreateTooltipHoverBridgePolygonOptions {
  triggerRect: DOMRect | null;
  tooltipRect: DOMRect | null;
  exitPoint: TooltipHoverBridgePoint;
  corridorHalfSize?: number;
}

/**
 * Builds a pointer grace polygon between the trigger exit point and the tooltip.
 * The polygon is intentionally directional so moving away from the tooltip exits quickly.
 */
export function createTooltipHoverBridgePolygon({
  triggerRect,
  tooltipRect,
  exitPoint,
  corridorHalfSize = 8,
}: CreateTooltipHoverBridgePolygonOptions): TooltipHoverBridgePoint[] | null {
  if (!triggerRect || !tooltipRect) {
    return null;
  }

  const triggerCenterX = triggerRect.left + triggerRect.width / 2;
  const triggerCenterY = triggerRect.top + triggerRect.height / 2;
  const tooltipCenterX = tooltipRect.left + tooltipRect.width / 2;
  const tooltipCenterY = tooltipRect.top + tooltipRect.height / 2;

  const dx = tooltipCenterX - triggerCenterX;
  const dy = tooltipCenterY - triggerCenterY;
  const horizontalDominant = Math.abs(dx) >= Math.abs(dy);

  if (horizontalDominant) {
    const targetX = dx >= 0 ? tooltipRect.left : tooltipRect.right;
    return [
      { x: exitPoint.x, y: exitPoint.y - corridorHalfSize },
      { x: exitPoint.x, y: exitPoint.y + corridorHalfSize },
      { x: targetX, y: tooltipRect.bottom + corridorHalfSize },
      { x: targetX, y: tooltipRect.top - corridorHalfSize },
    ];
  }

  const targetY = dy >= 0 ? tooltipRect.top : tooltipRect.bottom;
  return [
    { x: exitPoint.x - corridorHalfSize, y: exitPoint.y },
    { x: exitPoint.x + corridorHalfSize, y: exitPoint.y },
    { x: tooltipRect.right + corridorHalfSize, y: targetY },
    { x: tooltipRect.left - corridorHalfSize, y: targetY },
  ];
}

/**
 * Returns true when the point lies inside the provided polygon.
 */
export function isPointInHoverBridgePolygon(
  point: TooltipHoverBridgePoint,
  polygon: TooltipHoverBridgePoint[],
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
