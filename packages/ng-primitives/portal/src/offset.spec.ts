import { coerceOffset } from './offset';

describe('coerceOffset', () => {
  it('should handle number inputs', () => {
    expect(coerceOffset(10)).toBe(10);
    expect(coerceOffset(0)).toBe(0);
    expect(coerceOffset(-5)).toBe(-5);
  });

  it('should handle string number inputs', () => {
    expect(coerceOffset('10')).toBe(10);
    expect(coerceOffset('0')).toBe(0);
    expect(coerceOffset('-5')).toBe(-5);
    expect(coerceOffset('3.14')).toBe(3.14);
  });

  it('should handle invalid string inputs', () => {
    expect(coerceOffset('invalid')).toBe(0);
    expect(coerceOffset('')).toBe(0);
    expect(coerceOffset('abc123')).toBe(0);
  });

  it('should handle object inputs', () => {
    const offsetObj = { mainAxis: 10, crossAxis: 5 };
    expect(coerceOffset(offsetObj)).toBe(offsetObj);
  });

  it('should handle null and undefined inputs', () => {
    expect(coerceOffset(null)).toBe(0);
    expect(coerceOffset(undefined)).toBe(0);
  });

  it('should handle complex object inputs', () => {
    const complexOffset = {
      mainAxis: 10,
      crossAxis: 5,
      alignmentAxis: 2,
    };
    expect(coerceOffset(complexOffset)).toBe(complexOffset);
  });
});
