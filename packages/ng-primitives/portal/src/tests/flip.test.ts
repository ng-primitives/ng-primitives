import { coerceFlip } from 'ng-primitives/portal';

describe('coerceFlip', () => {
  it('should handle boolean inputs', () => {
    expect(coerceFlip(true)).toBe(true);
    expect(coerceFlip(false)).toBe(false);
  });

  it('should handle string boolean inputs', () => {
    expect(coerceFlip('true')).toBe(true);
    expect(coerceFlip('false')).toBe(false);
  });

  it('should treat an empty attribute as enabled', () => {
    expect(coerceFlip('')).toBe(true);
  });

  it('should handle string number inputs as padding shorthand', () => {
    expect(coerceFlip('10')).toEqual({ padding: 10 });
    expect(coerceFlip('0')).toEqual({ padding: 0 });
  });

  it('should handle object inputs', () => {
    const flip = { padding: 10, fallbackPlacements: ['top' as const] };
    expect(coerceFlip(flip)).toBe(flip);
  });

  it('should pass through the overflow boundary options untouched', () => {
    const boundary = document.createElement('div');
    const flip = {
      boundary,
      rootBoundary: 'document' as const,
      crossAxis: 'alignment' as const,
    };

    expect(coerceFlip(flip)).toBe(flip);
  });

  it('should handle null and undefined inputs', () => {
    expect(coerceFlip(null)).toBeUndefined();
    expect(coerceFlip(undefined)).toBeUndefined();
  });

  it('should handle invalid string inputs', () => {
    expect(coerceFlip('invalid')).toBeUndefined();
    expect(coerceFlip('abc')).toBeUndefined();
  });
});
