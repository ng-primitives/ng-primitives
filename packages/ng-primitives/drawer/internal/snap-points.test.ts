import {
  closestDrawerSnapPoint,
  dampSnapOvershoot,
  projectDrawerSnapPoint,
  resolveDrawerSnapPointHeight,
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
    expect(points.map(point => point.height)).toEqual([0, 500]);
  });

  it('keeps a negative declared value as a zero-height point, the way Base UI clamps it', () => {
    const points = resolveDrawerSnapPoints([-1, '-5px', '300px'], 800, 600, 16);
    // -1 and '-5px' both clamp to height 0 and dedup into one point (within 1px of each other).
    expect(points.map(point => point.height)).toEqual([0, 300]);
    expect(points.map(point => point.offset)).toEqual([600, 300]);
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

  it('resolves a single value with the same clamp the list resolver applies', () => {
    expect(resolveDrawerSnapPointHeight(0.25, 800, 600, 16)).toBe(200);
    expect(resolveDrawerSnapPointHeight('180px', 800, 600, 16)).toBe(180);
    expect(resolveDrawerSnapPointHeight('20rem', 800, 600, 16)).toBe(320);
    // Clamped to min(viewportHeight, popupHeight).
    expect(resolveDrawerSnapPointHeight(900, 800, 600, 16)).toBe(600);
  });

  it('declines values and geometry the list resolver would also discard', () => {
    expect(resolveDrawerSnapPointHeight('2em' as never, 800, 600, 16)).toBeNull();
    expect(resolveDrawerSnapPointHeight(-1, 800, 600, 16)).toBe(0);
    expect(resolveDrawerSnapPointHeight(0.5, 0, 600, 16)).toBeNull();
    expect(resolveDrawerSnapPointHeight(0.5, 800, 0, 16)).toBeNull();
  });

  it('clamps a negative single value to zero and declines a non-finite one', () => {
    expect(resolveDrawerSnapPointHeight(-1, 800, 600, 16)).toBe(0);
    expect(resolveDrawerSnapPointHeight('-5px', 800, 600, 16)).toBe(0);
    expect(resolveDrawerSnapPointHeight(Number.NaN, 800, 600, 16)).toBeNull();
  });

  it('agrees with the list resolver for a declared value', () => {
    const points = resolveDrawerSnapPoints([0.25, '180px'], 800, 600, 16);
    expect(resolveDrawerSnapPointHeight(0.25, 800, 600, 16)).toBe(
      points.find(point => point.values.includes(0.25))?.height,
    );
  });
});
