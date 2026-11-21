import { expect, vi } from 'vitest';

export type PointerEventType = 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel';

export type TouchEventType = 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel';

export interface PointerOptions {
  readonly pointerId: number;
  readonly buttons?: number;
  readonly x?: number;
  readonly y?: number;
  /** Overrides `timeStamp`, which the swipe velocity maths reads. */
  readonly time?: number;
  readonly isPrimary?: boolean;
  readonly pointerType?: string;
}

/**
 * Dispatches a pointer event shaped like real input. It is cancelable so the drawer's
 * `preventDefault()` calls take effect.
 */
export function dispatchPointer(
  target: EventTarget,
  type: PointerEventType,
  options: PointerOptions,
): PointerEvent {
  const event = new PointerEvent(type, {
    bubbles: true,
    button: 0,
    buttons: options.buttons ?? 0,
    cancelable: true,
    clientX: options.x ?? 0,
    clientY: options.y ?? 0,
    composed: true,
    isPrimary: options.isPrimary ?? true,
    pointerId: options.pointerId,
    pointerType: options.pointerType ?? 'mouse',
  });
  overrideTimeStamp(event, options.time);
  target.dispatchEvent(event);
  return event;
}

export function touch(
  target: EventTarget,
  identifier: number,
  clientX: number,
  clientY: number,
): Touch {
  return new Touch({ clientX, clientY, identifier, target });
}

let touchHitTarget: Element | null | undefined;

/**
 * Synthetic touches skip hit-testing, so route `document.elementFromPoint` to the element
 * each `touchstart` lands on, or to the target pinned with `setTouchHitTarget`.
 */
export function mockTouchHitTesting(): void {
  touchHitTarget = undefined;
  vi.spyOn(document, 'elementFromPoint').mockImplementation(() => touchHitTarget ?? null);
}

export function setTouchHitTarget(target: Element | undefined): void {
  touchHitTarget = target;
}

export function dispatchTouch(
  target: EventTarget,
  type: TouchEventType,
  touches: readonly Touch[],
  changedTouches: readonly Touch[],
  time?: number,
): TouchEvent {
  const event = new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    changedTouches: [...changedTouches],
    composed: true,
    targetTouches: [...touches],
    touches: [...touches],
  });
  overrideTimeStamp(event, time);
  const previousHitTarget = touchHitTarget;
  if (type === 'touchstart' && touchHitTarget === undefined) {
    const touchTarget = touches[0]?.target;
    touchHitTarget = touchTarget instanceof Element ? touchTarget : null;
  }
  target.dispatchEvent(event);
  touchHitTarget = previousHitTarget;
  return event;
}

export function getElement<T extends HTMLElement = HTMLElement>(selector: string): T {
  return document.querySelector<T>(selector)!;
}

export function waitForElement<T extends HTMLElement = HTMLElement>(selector: string): Promise<T> {
  return vi.waitFor(() => {
    const element = document.querySelector<T>(selector);
    expect(element).not.toBeNull();
    return element!;
  });
}

export function rect(width: number, height: number, top = 0): DOMRect {
  return {
    bottom: top + height,
    height,
    left: 0,
    right: width,
    top,
    width,
    x: 0,
    y: top,
    toJSON: () => ({}),
  };
}

/** Overrides layout readouts such as `clientHeight` or `scrollTop` that the test cannot lay out. */
export function setDimensions(element: HTMLElement, values: Record<string, number>): void {
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(element, key, { configurable: true, value, writable: true });
  }
}

export function animationFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

function overrideTimeStamp(event: Event, time: number | undefined): void {
  if (time !== undefined) {
    Object.defineProperty(event, 'timeStamp', { configurable: true, value: time });
  }
}
