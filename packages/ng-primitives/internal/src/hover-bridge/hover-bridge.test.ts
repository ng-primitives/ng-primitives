import { createHoverBridgePolygon, isPointInHoverBridgePolygon } from './hover-bridge';

describe('hover-bridge', () => {
  it('should return null when trigger rect is missing', () => {
    const polygon = createHoverBridgePolygon({
      triggerRect: null,
      targetRect: new DOMRect(100, 0, 40, 20),
      exitPoint: { x: 10, y: 10 },
    });

    expect(polygon).toBeNull();
  });

  it('should return null when target rect is missing', () => {
    const polygon = createHoverBridgePolygon({
      triggerRect: new DOMRect(0, 0, 40, 20),
      targetRect: null,
      exitPoint: { x: 10, y: 10 },
    });

    expect(polygon).toBeNull();
  });

  it('should include points traveling from trigger toward target to the right', () => {
    const polygon = createHoverBridgePolygon({
      triggerRect: new DOMRect(0, 0, 40, 20),
      targetRect: new DOMRect(120, 0, 80, 40),
      exitPoint: { x: 40, y: 10 },
    });

    expect(polygon).not.toBeNull();
    expect(isPointInHoverBridgePolygon({ x: 80, y: 10 }, polygon!)).toBe(true);
    expect(isPointInHoverBridgePolygon({ x: 80, y: 80 }, polygon!)).toBe(false);
  });

  it('should include points traveling from trigger toward target above', () => {
    const polygon = createHoverBridgePolygon({
      triggerRect: new DOMRect(0, 100, 40, 20),
      targetRect: new DOMRect(0, 0, 60, 40),
      exitPoint: { x: 20, y: 100 },
    });

    expect(polygon).not.toBeNull();
    expect(isPointInHoverBridgePolygon({ x: 20, y: 70 }, polygon!)).toBe(true);
    expect(isPointInHoverBridgePolygon({ x: 120, y: 70 }, polygon!)).toBe(false);
  });

  it('should handle diagonal movement between trigger and target', () => {
    const polygon = createHoverBridgePolygon({
      triggerRect: new DOMRect(0, 0, 40, 20),
      targetRect: new DOMRect(80, 80, 60, 40),
      exitPoint: { x: 40, y: 20 },
    });

    expect(polygon).not.toBeNull();
    expect(isPointInHoverBridgePolygon({ x: 70, y: 80 }, polygon!)).toBe(true);
    expect(isPointInHoverBridgePolygon({ x: 20, y: 80 }, polygon!)).toBe(false);
  });
});
