import {
  dampForbiddenMovement,
  getSwipeDisplacement,
  movementForDirection,
  oppositeSwipeDirection,
} from './direction';

describe('swipe direction helpers', () => {
  it.each([
    ['down', { x: 3, y: 20 }, 20],
    ['up', { x: 3, y: -20 }, 20],
    ['right', { x: 20, y: 3 }, 20],
    ['left', { x: -20, y: 3 }, 20],
  ] as const)('projects %s displacement', (direction, vector, expected) => {
    expect(getSwipeDisplacement(direction, vector)).toBe(expected);
  });

  it('square-root damps forbidden and cross-axis movement', () => {
    expect(dampForbiddenMovement(-25)).toBe(-5);
    expect(movementForDirection('down', { x: 16, y: -25 })).toEqual({ x: 4, y: -5 });
  });

  it('returns the physical opposite direction', () => {
    expect(oppositeSwipeDirection('up')).toBe('down');
    expect(oppositeSwipeDirection('left')).toBe('right');
  });
});
