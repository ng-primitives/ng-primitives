import { fireEvent } from '@testing-library/angular';

/**
 * userEvent.pointer's own leave/enter bookkeeping (it gates dispatch on a
 * cached, per-call pointer-events check) doesn't reliably reflect a
 * suppression change applied mid-gesture in this environment. Corridor
 * movement is dispatched directly instead, the same technique the existing
 * hover-bridge geometry tests use, with the target resolved via a live
 * document.elementFromPoint call right before each dispatch - still real
 * Chromium, real CSS, real hit-testing, just without userEvent's own
 * target-tracking state machine in the way.
 */
export function leavePointerAt(element: HTMLElement, coords: { x: number; y: number }): void {
  fireEvent.pointerLeave(element, { clientX: coords.x, clientY: coords.y, pointerType: 'mouse' });
}

export function movePointerTo(coords: { x: number; y: number }): Element {
  const target = document.elementFromPoint(coords.x, coords.y) ?? document.body;
  fireEvent.pointerEnter(target, { clientX: coords.x, clientY: coords.y, pointerType: 'mouse' });
  fireEvent.pointerMove(document, { clientX: coords.x, clientY: coords.y, pointerType: 'mouse' });
  return target;
}
