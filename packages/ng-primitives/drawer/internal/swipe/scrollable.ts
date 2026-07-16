/* Adapted from Base UI scroll helpers at c33f4210 (MIT, Material UI SAS). */
import { NgpDrawerSwipeDirection } from '../../drawer.types';
import { DrawerSwipeAxis, getSwipeAxis, getSwipeSign } from './direction';

export interface TouchScrollContext {
  readonly drawerAxis: HTMLElement | null;
  readonly crossAxis: HTMLElement | null;
}

function parentElementOrHost(element: Element): Element | null {
  if (element.assignedSlot) {
    return element.assignedSlot;
  }
  if (element.parentElement) {
    return element.parentElement;
  }
  const root = element.getRootNode();
  return root instanceof ShadowRoot ? root.host : null;
}

function closestComposed(element: Element, selector: string): Element | null {
  let current: Element | null = element;
  while (current) {
    if (current.matches(selector)) {
      return current;
    }
    current = parentElementOrHost(current);
  }
  return null;
}

export function canScrollAxis(element: Element, axis: DrawerSwipeAxis): boolean {
  if (!(element instanceof HTMLElement)) {
    return false;
  }
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  const overflow = axis === 'x' ? style?.overflowX : style?.overflowY;
  if (!overflow || !['auto', 'scroll', 'overlay'].includes(overflow)) {
    return false;
  }
  return axis === 'x'
    ? element.scrollWidth > element.clientWidth
    : element.scrollHeight > element.clientHeight;
}

function findScrollableOnAxis(
  start: EventTarget | null,
  boundary: HTMLElement,
  axis: DrawerSwipeAxis,
  predicate: (element: HTMLElement) => boolean = () => true,
): HTMLElement | null {
  let element = start instanceof Element ? start : null;
  while (element) {
    if (canScrollAxis(element, axis) && predicate(element as HTMLElement)) {
      return element as HTMLElement;
    }
    if (element === boundary) {
      return null;
    }
    element = parentElementOrHost(element);
  }
  return null;
}

export function findRelevantScrollable(
  start: EventTarget | null,
  boundary: HTMLElement,
  direction: NgpDrawerSwipeDirection,
): HTMLElement | null {
  return findScrollableOnAxis(start, boundary, getSwipeAxis(direction));
}

export function findTouchScrollContext(
  start: EventTarget | null,
  boundary: HTMLElement,
  direction: NgpDrawerSwipeDirection,
): TouchScrollContext {
  const drawerAxis = getSwipeAxis(direction);
  const crossAxis = drawerAxis === 'x' ? 'y' : 'x';
  return {
    drawerAxis: findScrollableOnAxis(start, boundary, drawerAxis),
    crossAxis: findScrollableOnAxis(start, boundary, crossAxis),
  };
}

export function canConsumeTouchDelta(
  element: HTMLElement,
  direction: NgpDrawerSwipeDirection,
  delta: number,
): boolean {
  if (delta === 0) {
    return false;
  }
  const axis = getSwipeAxis(direction);
  const offset = axis === 'x' ? element.scrollLeft : element.scrollTop;
  const clientSize = axis === 'x' ? element.clientWidth : element.clientHeight;
  const scrollSize = axis === 'x' ? element.scrollWidth : element.scrollHeight;
  const maximum = Math.max(0, scrollSize - clientSize);
  return delta > 0 ? offset >= delta : maximum - offset >= -delta;
}

export function findConsumingScrollable(
  start: EventTarget | null,
  boundary: HTMLElement,
  direction: NgpDrawerSwipeDirection,
  delta: number,
): HTMLElement | null {
  return findScrollableOnAxis(start, boundary, getSwipeAxis(direction), element =>
    canConsumeTouchDelta(element, direction, delta),
  );
}

export function isTouchDeltaTowardDismissal(
  direction: NgpDrawerSwipeDirection,
  delta: number,
): boolean {
  return delta * getSwipeSign(direction) > 0;
}

export function isAtDismissEdge(element: HTMLElement, direction: NgpDrawerSwipeDirection): boolean {
  switch (direction) {
    case 'down':
      return element.scrollTop <= 0;
    case 'up':
      return element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
    case 'right':
      return element.scrollLeft <= 0;
    case 'left':
      return element.scrollLeft + element.clientWidth >= element.scrollWidth - 1;
  }
}

export function shouldTransferToDrawer(
  element: HTMLElement,
  direction: NgpDrawerSwipeDirection,
  delta: number,
): boolean {
  return isTouchDeltaTowardDismissal(direction, delta) && isAtDismissEdge(element, direction);
}

export function canTransferTouchToDrawer(
  start: EventTarget | null,
  boundary: HTMLElement,
  direction: NgpDrawerSwipeDirection,
  delta: number,
): boolean {
  if (!isTouchDeltaTowardDismissal(direction, delta)) {
    return false;
  }
  const axis = getSwipeAxis(direction);
  let element = start instanceof Element ? start : null;
  while (element) {
    if (canScrollAxis(element, axis) && !isAtDismissEdge(element as HTMLElement, direction)) {
      return false;
    }
    if (element === boundary) {
      break;
    }
    element = parentElementOrHost(element);
  }
  return true;
}

export function shouldIgnoreSwipeTarget(target: EventTarget | null, pointerType: string): boolean {
  const element = target instanceof Element ? target : null;
  if (!element) {
    return true;
  }
  if (
    closestComposed(
      element,
      '[data-ngp-drawer-swipe-ignore], [data-base-ui-swipe-ignore], input[type="range"]',
    )
  ) {
    return true;
  }
  if (
    closestComposed(
      element,
      'input:not([type]), input[type="text"], input[type="email"], input[type="number"], input[type="password"], input[type="search"], input[type="tel"], input[type="url"], textarea, [contenteditable]:not([contenteditable="false"])',
    )
  ) {
    return true;
  }
  if (pointerType !== 'touch' && closestComposed(element, '[data-drawer-content]')) {
    return true;
  }
  if (
    pointerType !== 'touch' &&
    closestComposed(element, 'button, a[href], input, select, textarea, [contenteditable]')
  ) {
    return true;
  }
  const selection = element.ownerDocument.getSelection();
  return Boolean(selection && !selection.isCollapsed && selection.toString());
}
