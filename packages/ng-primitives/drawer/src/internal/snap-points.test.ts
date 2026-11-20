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

  it('constrains sequential movement to an adjacent point', () => {
    const points = resolveDrawerSnapPoints([100, 300, 500], 800, 700, 16);
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

  it('closes a sequential release from any point once the target passes the last one', () => {
    const points = resolveDrawerSnapPoints([100, 200, 300], 800, 700, 16);
    // offsets 600/500/400, popupHeight 700. From offset 500 a 300px drag lands at the closed edge,
    // which is nearer than the lowest point's 600 — Base UI closes rather than stepping down.
    expect(projectDrawerSnapPoint(points, points[1], 300, 0, true)).toBeNull();
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

  it('closes on a fast flick toward dismissal instead of snapping', () => {
    const points = resolveDrawerSnapPoints([100, 200, 300], 400, 400, 16);
    // Only 5px of travel, but 0.6px/ms toward dismissal.
    expect(projectDrawerSnapPoint(points, points[2], 5, 0.6, false)).toBeNull();
  });

  it('ignores the flick shortcut for an expanding release', () => {
    const points = resolveDrawerSnapPoints([100, 200, 300], 400, 400, 16);
    // Negative displacement is away from dismissal, so the shortcut must not fire however fast.
    expect(projectDrawerSnapPoint(points, points[0], -5, -0.6, false)?.value).toBe(300);
  });

  it('ignores the flick shortcut below the velocity threshold', () => {
    const points = resolveDrawerSnapPoints([100, 200, 300], 400, 400, 16);
    expect(projectDrawerSnapPoint(points, points[2], 5, 0.4, false)?.value).toBe(300);
  });

  it('leaves the sequential path without a flick shortcut', () => {
    const points = resolveDrawerSnapPoints([100, 200, 300], 400, 400, 16);
    // Base UI applies the shortcut only to non-sequential releases.
    expect(projectDrawerSnapPoint(points, points[2], 5, 0.6, true)).not.toBeNull();
  });

  it('closes a sequential release that lands nearer the closed edge', () => {
    // 400px popup, offsets 300/200/100 for 100px/200px/300px. From '200px' (offset 200) a 250px
    // drag lands at offset 400 — the fully-closed edge — which is nearer than the 300 offset of
    // the lowest point.
    const points = resolveDrawerSnapPoints([100, 200, 300], 400, 400, 16);
    expect(projectDrawerSnapPoint(points, points[1], 250, 0.625, true)).toBeNull();
  });

  it('forces the adjacent point when a flick agrees with the drag direction', () => {
    const points = resolveDrawerSnapPoints([100, 200, 300], 400, 400, 16);
    // From '300px' (offset 100) a 25px drag lands at 125, short of '200px' (offset 200); a
    // 0.6px/ms flick in the same direction promotes it to the adjacent point anyway.
    expect(projectDrawerSnapPoint(points, points[2], 25, 0.6, true)?.value).toBe(200);
    // The same drag without the flick stays where the finger left it.
    expect(projectDrawerSnapPoint(points, points[2], 25, 0.1, true)?.value).toBe(300);
  });

  it('forces the adjacent point when expanding', () => {
    const points = resolveDrawerSnapPoints([100, 200, 300], 400, 400, 16);
    // From '100px' (offset 300) a 25px expanding drag lands at 275, short of '200px' (offset 200);
    // a matching upward flick promotes it.
    expect(projectDrawerSnapPoint(points, points[0], -25, -0.6, true)?.value).toBe(200);
  });

  it('ignores a flick that disagrees with the drag direction', () => {
    const points = resolveDrawerSnapPoints([100, 200, 300], 400, 400, 16);
    expect(projectDrawerSnapPoint(points, points[2], 25, -0.6, true)?.value).toBe(300);
  });

  it('excludes the velocity projection from the sequential drag target', () => {
    const points = resolveDrawerSnapPoints([100, 200, 300], 400, 400, 16);
    // A 4px/ms flick would project 1200px in the freeform path. Sequentially it may only advance
    // one step, so the result is the adjacent point, never the lowest.
    expect(projectDrawerSnapPoint(points, points[2], 5, 4, true)?.value).toBe(200);
  });
});
