import { coerceShift } from './shift';

describe('coerceShift', () => {
  it('should handle boolean inputs', () => {
    expect(coerceShift(true)).toBe(true);
    expect(coerceShift(false)).toBe(false);
  });

  it('should handle string boolean inputs', () => {
    expect(coerceShift('true')).toBe(true);
    expect(coerceShift('false')).toBe(false);
  });

  it('should handle string number inputs as padding shorthand', () => {
    expect(coerceShift('10')).toEqual({ padding: 10 });
    expect(coerceShift('0')).toEqual({ padding: 0 });
    expect(coerceShift('5')).toEqual({ padding: 5 });
  });

  it('should handle object inputs', () => {
    const shiftObj = { padding: 10 };
    expect(coerceShift(shiftObj)).toBe(shiftObj);
  });

  it('should handle complex object inputs', () => {
    const complexShift = {
      padding: 10,
      limiter: {
        fn: () => ({ x: 0, y: 0 }),
        options: {},
      },
    };
    expect(coerceShift(complexShift)).toBe(complexShift);
  });

  it('should handle null and undefined inputs', () => {
    expect(coerceShift(null)).toBeUndefined();
    expect(coerceShift(undefined)).toBeUndefined();
  });

  it('should handle invalid string inputs', () => {
    expect(coerceShift('invalid')).toBeUndefined();
    expect(coerceShift('')).toBeUndefined();
    expect(coerceShift('abc')).toBeUndefined();
  });
});
