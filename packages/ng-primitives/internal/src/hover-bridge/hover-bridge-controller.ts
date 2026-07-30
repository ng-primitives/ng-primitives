import { DestroyRef, ElementRef, inject, signal, Signal } from '@angular/core';
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
  /**
   * Element containing this trigger's siblings. While the bridge is active,
   * pointer-events are suppressed on it so a sibling can't receive its own
   * pointerenter mid-transit toward the open panel - the browser's hit-testing
   * withholds the event entirely rather than the sibling needing to know
   * anything about this bridge. The trigger itself is exempted. Omit for
   * triggers with no siblings to protect.
   */
  siblingContainer?: () => HTMLElement | null;
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
  siblingContainer,
}: HoverBridgeOptions): HoverBridgeController {
  const disposables = injectDisposables();
  const destroyRef = inject(DestroyRef);
  // Optional so the controller can still be created outside an element
  // injection context; every real caller is a trigger's state factory.
  const trigger = inject<ElementRef<HTMLElement>>(ElementRef, { optional: true });
  const polygon = signal<HoverBridgePoint[] | null>(null);
  let direction: HoverBridgeDirection | null = null;
  let lastPointer: HoverBridgePoint | null = null;
  let removePointerMoveListener: (() => void) | undefined = undefined;
  let fallbackTimeoutId: ReturnType<typeof setTimeout> | undefined = undefined;
  let suppressedElement: HTMLElement | null = null;
  let previousContainerPointerEvents = '';
  let previousTriggerPointerEvents = '';
  let removePressGuards: (() => void) | undefined = undefined;

  // One reusable timer with a single destroy hook. The fallback reschedules on
  // every in-corridor pointermove, and going through disposables.setTimeout would
  // register a new DestroyRef cleanup per move that is never released.
  destroyRef.onDestroy(() => clearTimeout(fallbackTimeoutId));

  // The inline style mutation below is a raw DOM write, not something
  // disposables tracks, so it needs its own explicit restore on destroy in
  // case the injector is torn down mid-corridor without clear() running first.
  destroyRef.onDestroy(() => restoreSiblingPointerEvents());

  /**
   * Suppress hit-testing on the sibling container for the duration of the
   * corridor, so a sibling's own pointerenter is never delivered mid-transit -
   * the browser withholds the event entirely rather than the sibling needing
   * to know anything about this bridge. The trigger is exempted: the corridor
   * is latched, so a pointer returning to an inert trigger would read as
   * leaving the corridor and close the overlay instead of cancelling the
   * bridge. Paired with capture-phase press guards, since a press while the
   * container is inert would otherwise reach whatever is now hit-testable
   * underneath.
   */
  function suppressSiblingPointerEvents(): void {
    // Idempotent, like registerPointerMoveListener - a second track() without an
    // intervening clear() would otherwise orphan the guards registered here.
    if (suppressedElement) {
      return;
    }

    const element = siblingContainer?.();
    if (!element) {
      return;
    }

    suppressedElement = element;
    previousContainerPointerEvents = element.style.pointerEvents;
    element.style.pointerEvents = 'none';

    if (trigger) {
      previousTriggerPointerEvents = trigger.nativeElement.style.pointerEvents;
      trigger.nativeElement.style.pointerEvents = 'auto';
    }

    // Only presses over the inert container are blocked - anywhere else on the
    // page keeps its normal focus and activation behaviour.
    const removePointerDown = disposables.addEventListener(
      document,
      'pointerdown',
      (event: PointerEvent) => {
        if (isPressOnInertSibling(event)) {
          event.preventDefault();
        }
      },
      true,
    );

    // Cancelling pointerdown stops focus moving but not the click: click is not
    // a compatibility mouse event, so it still activates whatever the inert
    // container was covering. Stop it in capture, before it reaches a target.
    const removeClick = disposables.addEventListener(
      document,
      'click',
      (event: MouseEvent) => {
        if (isPressOnInertSibling(event)) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      true,
    );

    removePressGuards = () => {
      removePointerDown();
      removeClick();
    };
  }

  /**
   * The trigger keeps its own presses: it sits inside the container's rect but
   * is exempt from the suppression, so a coordinate test alone would cancel the
   * presses the exemption exists to preserve.
   */
  function isPressOnInertSibling(event: PointerEvent | MouseEvent): boolean {
    if (trigger && event.composedPath().includes(trigger.nativeElement)) {
      return false;
    }

    return isPointOverSuppressedElement(event.clientX, event.clientY);
  }

  function isPointOverSuppressedElement(x: number, y: number): boolean {
    if (!suppressedElement) {
      return false;
    }

    const { left, right, top, bottom } = suppressedElement.getBoundingClientRect();
    return x >= left && x <= right && y >= top && y <= bottom;
  }

  /**
   * Restore exactly the element suppression was applied to, not whatever
   * siblingContainer() resolves to now, and put back whatever inline value it
   * carried rather than blanking a consumer's own pointer-events.
   */
  function restoreSiblingPointerEvents(): void {
    if (suppressedElement) {
      suppressedElement.style.pointerEvents = previousContainerPointerEvents;
      suppressedElement = null;

      if (trigger) {
        trigger.nativeElement.style.pointerEvents = previousTriggerPointerEvents;
      }
    }

    removePressGuards?.();
    removePressGuards = undefined;
  }

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
    suppressSiblingPointerEvents();
    return true;
  }

  function clear(): void {
    polygon.set(null);
    direction = null;
    lastPointer = null;
    clearTimeout(fallbackTimeoutId);
    fallbackTimeoutId = undefined;
    removePointerMoveListener?.();
    restoreSiblingPointerEvents();
  }

  return {
    polygon: polygon.asReadonly(),
    isActive: () => polygon() !== null,
    track,
    clear,
  };
}
