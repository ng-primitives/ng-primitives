import {
  closestDrawerSnapPoint,
  dampSnapOvershoot,
  projectDrawerSnapPoint,
  resolveDrawerSnapPoints,
} from './snap-points';

describe('Drawer snap points', () => {
  it('resolves fractions, numeric pixels, px, and rem', () => {
    const points = resolveDrawerSnapPoints([0.25, 120, '180px', '20rem'], 800, 600, 16);
    expect(points.map(point => point.height)).toEqual([120, 180, 200, 320]);
  });

  it('discards invalid values and clamps to popup and viewport', () => {
    const values = [-1, Number.NaN, '2em', '12pxx', 'Infinitypx', 900] as const;
    const points = resolveDrawerSnapPoints(values as never, 700, 500, 16);
    expect(points.map(point => point.height)).toEqual([500]);
  });

  it('deduplicates within one pixel and keeps the last declaration', () => {
    const points = resolveDrawerSnapPoints(['100px', '100.5px', '102px'], 800, 700, 16);
    expect(points.map(point => point.value)).toEqual(['100.5px', '102px']);
  });

  it('chooses the closest point and preserves the first on a tie', () => {
    const points = resolveDrawerSnapPoints([100, 300], 800, 700, 16);
    expect(closestDrawerSnapPoint(points, 200)?.value).toBe(100);
  });

  it('projects velocity and constrains sequential movement to an adjacent point', () => {
    const points = resolveDrawerSnapPoints([100, 300, 500], 800, 700, 16);
    expect(projectDrawerSnapPoint(points, points[2], 20, 1, false)?.value).toBe(100);
    expect(projectDrawerSnapPoint(points, points[2], 20, 1, true)?.value).toBe(300);
  });

  it('uses signed distance to expand toward a higher point', () => {
    const points = resolveDrawerSnapPoints([100, 200, 300], 400, 400, 16);
    expect(projectDrawerSnapPoint(points, points[0], -175, 0, false)?.value).toBe(300);
  });

  it('chooses raw snap versus close before applying the sequential limit', () => {
    const points = resolveDrawerSnapPoints([100, 200, 300], 800, 700, 16);
    expect(projectDrawerSnapPoint(points, points[2], 25, 25 / 42, true)?.value).toBe(200);
  });

  it('allows only the lowest sequential point to move directly to close', () => {
    const points = resolveDrawerSnapPoints([100, 200, 300], 800, 700, 16);
    expect(projectDrawerSnapPoint(points, points[1], 300, 0, true)?.value).toBe(100);
    expect(projectDrawerSnapPoint(points, points[0], 300, 0, true)).toBeNull();
  });

  it('selects close when projected height is nearer zero', () => {
    const points = resolveDrawerSnapPoints([100, 300], 800, 700, 16);
    expect(projectDrawerSnapPoint(points, points[0], 80, 0, false)).toBeNull();
  });

  it('square-root damps movement only past the open edge', () => {
    expect(dampSnapOvershoot(-25, 0)).toBe(-5);
    expect(dampSnapOvershoot(-10, 20)).toBe(-10);
    expect(dampSnapOvershoot(-30, 20)).toBeCloseTo(-Math.sqrt(10) - 20);
  });
});
