import { resolveDrawerReleaseStrength } from './release-strength';

describe('resolveDrawerReleaseStrength', () => {
  it('returns the shortest scalar for a fast flick with far to travel', () => {
    // 300px remaining at the clamped 4px/ms is 75ms, below the 80ms floor, so the scalar bottoms
    // out at MIN_RELEASE_SCALAR.
    expect(
      resolveDrawerReleaseStrength({
        size: 400,
        translation: 100,
        releaseVelocity: 6,
        fallbackVelocity: 1,
      }),
    ).toBe(0.1);
  });

  it('returns the full duration for a slow release', () => {
    expect(
      resolveDrawerReleaseStrength({
        size: 400,
        translation: 0,
        releaseVelocity: 0.5,
        fallbackVelocity: 0.5,
      }),
    ).toBe(1);
  });

  it('scales between the bounds', () => {
    const scalar = resolveDrawerReleaseStrength({
      size: 200,
      translation: 30,
      releaseVelocity: 1.5,
      fallbackVelocity: 0.5,
    });

    expect(scalar).toBeGreaterThan(0.1);
    expect(scalar).toBeLessThan(1);
  });

  it('falls back to the whole-gesture velocity when the release sample is still', () => {
    expect(
      resolveDrawerReleaseStrength({
        size: 400,
        translation: 100,
        releaseVelocity: 0,
        fallbackVelocity: 6,
      }),
    ).toBe(0.1);
  });

  it('declines a release with no useful speed, a zero size, or nothing left to travel', () => {
    const base = { size: 400, translation: 40, releaseVelocity: 6, fallbackVelocity: 6 };

    expect(
      resolveDrawerReleaseStrength({ ...base, releaseVelocity: 0.1, fallbackVelocity: 0.1 }),
    ).toBeNull();
    expect(resolveDrawerReleaseStrength({ ...base, size: 0 })).toBeNull();
    expect(resolveDrawerReleaseStrength({ ...base, translation: 400 })).toBeNull();
  });
});
