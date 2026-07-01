import { DestroyRef, inject, signal, Signal } from '@angular/core';
import { injectDisposables } from 'ng-primitives/utils';
import {
  createHoverBridgePolygon,
  getHoverBridgeDirection,
  HOVER_BRIDGE_DIRECTION_TOLERANCE_PX,
  HOVER_BRIDGE_TIMEOUT_MS,
  HoverBridgeDirection,
  HoverBridgePoint,
  isPointInHoverBridgePolygon,
} from './hover-bridge';

export interface HoverBridgeOptions {
  /** Whether the pointer is currently over the trigger or the panel (the "safe" area). */
  isPointerInAnchor: () => boolean;
  /** Close the overlay - called when the pointer leaves the corridor or the idle timer fires. */
  close: () => void;
  /**
   * Require the pointer to keep heading toward the panel. When true, reversing
   * away along the corridor's dominant axis closes the overlay (menu/submenu).
   * Tooltips leave this off. Defaults to false.
   */
  requireForwardMovement?: boolean;
  /**
   * Reset the idle-fallback timer on valid in-corridor movement, so it only
   * fires after the pointer genuinely stops. When false the timer is a fixed cap
   * from the moment the corridor is built (tooltip's original semantics).
   * Defaults to true.
   */
  resetFallbackOnMove?: boolean;
  /** Idle-fallback timeout in ms. Defaults to HOVER_BRIDGE_TIMEOUT_MS. */
  timeoutMs?: number;
}

export interface HoverBridgeTrackOptions {
  triggerRect: DOMRect | null;
  targetRect: DOMRect | null;
  exitPoint: HoverBridgePoint;
}

export interface HoverBridgeController {
  /** The active corridor polygon, or null when no bridge is in progress. */
  readonly polygon: Signal<HoverBridgePoint[] | null>;
  /** Whether a corridor is currently active. */
  isActive(): boolean;
  /**
   * Build a corridor from the exit point toward the panel and start tracking the
   * pointer. Returns false (and does nothing) when a polygon can't be built, so
   * the caller can apply its own fallback.
   */
  track(options: HoverBridgeTrackOptions): boolean;
  /** Tear down the corridor and its global listener/timer. */
  clear(): void;
}

/**
 * Shared safe-polygon hover-intent state machine used by the menu, submenu and
 * tooltip triggers. While the pointer travels inside the corridor toward the
 * panel the overlay stays open; it closes when the pointer leaves the corridor,
 * reverses away (when requireForwardMovement is set) or idles past the timeout.
 */
export function createHoverBridge({
  isPointerInAnchor,
  close,
  requireForwardMovement = false,
  resetFallbackOnMove = true,
  timeoutMs = HOVER_BRIDGE_TIMEOUT_MS,
}: HoverBridgeOptions): HoverBridgeController {
  const disposables = injectDisposables();
  const destroyRef = inject(DestroyRef);
  const polygon = signal<HoverBridgePoint[] | null>(null);
  let direction: HoverBridgeDirection | null = null;
  let lastPointer: HoverBridgePoint | null = null;
  let removePointerMoveListener: (() => void) | undefined = undefined;
  let fallbackTimeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

  // One reusable timer with a single destroy hook. The fallback reschedules on
  // every in-corridor pointermove, and going through disposables.setTimeout would
  // register a new DestroyRef cleanup per move that is never released.
  destroyRef.onDestroy(() => clearTimeout(fallbackTimeoutId));

  function isMovingAway(point: HoverBridgePoint): boolean {
    if (!requireForwardMovement || !direction || !lastPointer) {
      return false;
    }

    const delta = direction.axis === 'x' ? point.x - lastPointer.x : point.y - lastPointer.y;
    return delta * direction.sign < -HOVER_BRIDGE_DIRECTION_TOLERANCE_PX;
  }

  /** (Re)start the idle timer - reset on valid movement so it only fires when idle. */
  function scheduleFallback(): void {
    clearTimeout(fallbackTimeoutId);

    fallbackTimeoutId = setTimeout(() => {
      fallbackTimeoutId = undefined;

      if (!isPointerInAnchor() && polygon()) {
        clear();
        close();
      }
    }, timeoutMs);
  }

  function registerPointerMoveListener(): void {
    if (removePointerMoveListener) {
      return;
    }

    const cleanup = disposables.addEventListener(
      document,
      'pointermove',
      (event: PointerEvent): void => {
        if (isPointerInAnchor() || !polygon()) {
          clear();
          return;
        }

        const point: HoverBridgePoint = { x: event.clientX, y: event.clientY };
        const inside = isPointInHoverBridgePolygon(point, polygon()!);
        const away = isMovingAway(point);
        lastPointer = point;

        if (!inside || away) {
          clear();
          close();
          return;
        }

        // Valid movement toward the panel - reset the idle fallback so a slow
        // but continuous traversal isn't cut off mid-corridor. Callers that want
        // a fixed cap (tooltip) opt out via resetFallbackOnMove: false.
        if (resetFallbackOnMove) {
          scheduleFallback();
        }
      },
      true,
    );

    removePointerMoveListener = () => {
      cleanup();
      removePointerMoveListener = undefined;
    };
  }

  function track({ triggerRect, targetRect, exitPoint }: HoverBridgeTrackOptions): boolean {
    const points = createHoverBridgePolygon({ triggerRect, targetRect, exitPoint });
    if (!points) {
      return false;
    }

    polygon.set(points);
    direction = getHoverBridgeDirection(triggerRect, targetRect);
    lastPointer = exitPoint;
    registerPointerMoveListener();
    scheduleFallback();
    return true;
  }

  function clear(): void {
    polygon.set(null);
    direction = null;
    lastPointer = null;
    clearTimeout(fallbackTimeoutId);
    fallbackTimeoutId = undefined;
    removePointerMoveListener?.();
  }

  return {
    polygon: polygon.asReadonly(),
    isActive: () => polygon() !== null,
    track,
    clear,
  };
}
