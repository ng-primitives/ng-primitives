/* Adapted from Base UI Drawer at c33f4210 (MIT, Material UI SAS). */
import { NgpDrawerSwipeDirection } from '../../drawer.types';

export type DrawerSwipeAxis = 'x' | 'y';

export interface DrawerSwipeVector {
  x: number;
  y: number;
}

export function getSwipeAxis(direction: NgpDrawerSwipeDirection): DrawerSwipeAxis {
  return direction === 'left' || direction === 'right' ? 'x' : 'y';
}

export function getSwipeSign(direction: NgpDrawerSwipeDirection): -1 | 1 {
  return direction === 'left' || direction === 'up' ? -1 : 1;
}

export function getSwipeDisplacement(
  direction: NgpDrawerSwipeDirection,
  vector: DrawerSwipeVector,
): number {
  return vector[getSwipeAxis(direction)] * getSwipeSign(direction);
}

export function getCrossAxisDisplacement(
  direction: NgpDrawerSwipeDirection,
  vector: DrawerSwipeVector,
): number {
  return vector[getSwipeAxis(direction) === 'x' ? 'y' : 'x'];
}

export function dampForbiddenMovement(value: number): number {
  return Math.sign(value) * Math.sqrt(Math.abs(value));
}

export function movementForDirection(
  direction: NgpDrawerSwipeDirection,
  vector: DrawerSwipeVector,
): DrawerSwipeVector {
  const axis = getSwipeAxis(direction);
  const sign = getSwipeSign(direction);
  const primary = vector[axis];
  const permitted = primary * sign >= 0 ? primary : dampForbiddenMovement(primary);
  return axis === 'x'
    ? { x: permitted, y: dampForbiddenMovement(vector.y) }
    : { x: dampForbiddenMovement(vector.x), y: permitted };
}

export function oppositeSwipeDirection(
  direction: NgpDrawerSwipeDirection,
): NgpDrawerSwipeDirection {
  switch (direction) {
    case 'up':
      return 'down';
    case 'down':
      return 'up';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
  }
}
