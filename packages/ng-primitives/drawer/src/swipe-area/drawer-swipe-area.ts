import { DOCUMENT } from '@angular/common';
import {
  afterRenderEffect,
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  inject,
  input,
  NgZone,
  untracked,
} from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding } from 'ng-primitives/state';
import { NGP_DRAWER_CSS_VARIABLES, NGP_DRAWER_DATA_ATTRIBUTES } from '../drawer.constants';
import { NgpDrawerSwipeDirection } from '../drawer.types';
import { DrawerStackService } from '../internal/drawer-stack.service';
import { injectDrawerState, requireDrawerState } from '../internal/drawer-state';
import {
  getSwipeAxis,
  getSwipeDisplacement,
  getSwipeSign,
  oppositeSwipeDirection,
} from '../internal/swipe/direction';
import {
  DrawerSwipeEngine,
  DrawerSwipeInput,
  DrawerSwipeRelease,
  DrawerSwipeUpdate,
  MIN_DRAG_THRESHOLD,
} from '../internal/swipe/drawer-swipe-engine';
import { DrawerTouchSession } from '../internal/swipe/drawer-touch-session';
import { shouldIgnoreSwipeTarget } from '../internal/swipe/scrollable';

interface SwipeAreaVisualSnapshot {
  readonly transition: string;
  readonly movementX: string;
  readonly movementY: string;
  readonly progress: string;
  readonly strength: string;
}

const SWIPE_AREA_OPEN_RATIO = 0.5;
/** Distance that opens the drawer when the popup has not rendered yet and cannot be measured. */
const SWIPE_AREA_FALLBACK_OPEN_THRESHOLD = 40;
const SWIPE_AREA_VELOCITY_THRESHOLD = 0.1;

@Directive({ selector: '[ngpDrawerSwipeArea]', standalone: true })
export class NgpDrawerSwipeArea {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly direction = input<NgpDrawerSwipeDirection | undefined>(undefined, {
    alias: 'ngpDrawerSwipeAreaDirection',
  });

  private readonly elementRef = injectElementRef<HTMLElement>();
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly stack = inject(DrawerStackService);
  private readonly capture = true;
  private readonly touchStartOptions: AddEventListenerOptions = {
    capture: true,
    passive: true,
  };
  private readonly touchMoveOptions: AddEventListenerOptions = {
    capture: true,
    passive: false,
  };
  private readonly touchEndOptions: AddEventListenerOptions = {
    capture: true,
    passive: true,
  };
  private readonly touchSession = new DrawerTouchSession();
  private readonly initialTouchAction = this.elementRef.nativeElement.style.touchAction;
  private ownsTouchAction = this.initialTouchAction === '';
  private appliedTouchAction: string | null = null;
  private activePointerId: number | null = null;
  private ownedCapturePointerId: number | null = null;
  private ownsProvisionalOpen = false;
  private provisionalOpenRequested = false;
  private gestureNativeEvent: Event | undefined;
  private animationFrame = 0;
  private pendingVisual: DrawerSwipeUpdate | null = null;
  private readonly visualSnapshots = new Map<HTMLElement, SwipeAreaVisualSnapshot>();
  private gestureSize: number | null = null;
  private gestureResizeObserver: ResizeObserver | null = null;
  private startListenerAttached = false;
  private continuationListenersAttached = false;
  private touchContinuationListenersAttached = false;
  private readonly startListenerRenderState = computed(() => ({
    disabled: this.disabled(),
    open: this.state.open(),
  }));
  private readonly cancellationRenderState = computed(() => ({
    open: this.state.open(),
    mounted: this.state.mounted(),
  }));
  private readonly engine = new DrawerSwipeEngine({
    direction: () => this.resolvedDirection(),
    size: () => this.drawerSize(),
    trackDrag: false,
    // The swipe area is a dedicated edge strip: there is nothing to scroll under it, so the drawer
    // may start following the finger immediately. The cross-axis bias in the engine still hands a
    // genuine sideways drag back to the platform.
    axisSlop: MIN_DRAG_THRESHOLD,
    onStart: () => {
      this.state.swiping.set(true);
      this.ownsProvisionalOpen = false;
      this.provisionalOpenRequested = false;
      this.gestureSize = null;
    },
    onMove: update => this.onMove(update),
    onRelease: release => this.onRelease(release),
    onCancel: nativeEvent => this.rollbackProvisionalOpen(nativeEvent),
  });

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') {
      return;
    }
    if (
      // A mouse and a pen are each primary for their own type, so a second press can land while a
      // gesture is live. Taking it over would orphan the first pointer's gesture.
      this.engine.active ||
      this.state.open() ||
      this.disabled() ||
      event.button !== 0 ||
      !event.isPrimary ||
      !event.composedPath().includes(this.elementRef.nativeElement) ||
      shouldIgnoreSwipeTarget(event.composedPath()[0] ?? event.target, event.pointerType)
    ) {
      return;
    }
    this.activePointerId = event.pointerId;
    this.attachContinuationListeners();
    if (!this.engine.start(this.toInput(event))) {
      this.releasePointer(event.pointerId);
      return;
    }
    this.capturePointer(event.pointerId);
    event.preventDefault();
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') {
      return;
    }
    if (event.pointerId !== this.activePointerId) {
      return;
    }
    this.gestureNativeEvent = event;
    const update = this.engine.move(this.toInput(event));
    if (update) {
      event.preventDefault();
    }
    if (!this.engine.active) {
      this.releasePointer(event.pointerId);
    }
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') {
      return;
    }
    if (event.pointerId !== this.activePointerId) {
      return;
    }
    if (this.engine.active) {
      this.engine.release(this.toInput(event));
    }
    this.releasePointer(event.pointerId);
  };

  private readonly onPointerCancel = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') {
      return;
    }
    if (event.pointerId === this.activePointerId) {
      this.cancelPointer(event);
    }
  };

  private readonly onContextMenu = (event: Event): void => {
    if (this.activePointerId !== null) {
      this.cancelPointer(event);
    }
  };

  private readonly onTouchStart = (event: TouchEvent): void => {
    if (this.touchSession.active) {
      if (event.touches.length !== 1) {
        this.cancelTouch(event);
      }
      return;
    }
    if (
      this.activePointerId !== null ||
      this.state.open() ||
      this.disabled() ||
      event.touches.length !== 1 ||
      !event.composedPath().includes(this.elementRef.nativeElement) ||
      shouldIgnoreSwipeTarget(event.composedPath()[0] ?? event.target, 'touch')
    ) {
      return;
    }
    const input = this.touchSession.start(event);
    if (!input) {
      return;
    }
    this.attachTouchContinuationListeners();
    if (!this.engine.start(input)) {
      this.releaseTouch();
    }
  };

  private readonly onTouchMove = (event: TouchEvent): void => {
    if (!this.touchSession.active) {
      return;
    }
    if (event.touches.length !== 1) {
      this.cancelTouch(event);
      return;
    }
    const input = this.touchSession.move(event);
    if (!input) {
      this.cancelTouch(event);
      return;
    }
    this.gestureNativeEvent = event;
    const update = this.engine.move(input);
    if (update && event.cancelable) {
      event.preventDefault();
    }
    if (!this.engine.active) {
      this.releaseTouch();
    }
  };

  private readonly onTouchEnd = (event: TouchEvent): void => {
    const input = this.touchSession.end(event);
    if (!input) {
      return;
    }
    if (this.engine.active) {
      this.engine.release(input);
    }
    this.releaseTouch();
  };

  private readonly onTouchCancel = (event: TouchEvent): void => {
    if (!this.touchSession.cancel(event)) {
      return;
    }
    this.engine.cancel(event);
    this.releaseTouch();
  };

  private readonly state = requireDrawerState(
    injectDrawerState({ optional: true }),
    'ngpDrawerSwipeArea',
  );
  constructor() {
    const unregister = this.state.registerElement(this.elementRef.nativeElement);
    dataBinding(this.elementRef, NGP_DRAWER_DATA_ATTRIBUTES.disabled, () => this.disabled());
    dataBinding(this.elementRef, NGP_DRAWER_DATA_ATTRIBUTES.open, () => this.state.open());
    dataBinding(this.elementRef, NGP_DRAWER_DATA_ATTRIBUTES.closed, () => !this.state.open());
    dataBinding(this.elementRef, NGP_DRAWER_DATA_ATTRIBUTES.swiping, () => this.state.swiping());
    dataBinding(this.elementRef, NGP_DRAWER_DATA_ATTRIBUTES.swipeDirection, () =>
      this.resolvedDirection(),
    );

    afterRenderEffect({
      write: () => {
        const renderState = this.startListenerRenderState();
        untracked(() => this.syncStartListener(renderState));
      },
    });

    afterRenderEffect({
      write: () => {
        const renderState = this.cancellationRenderState();
        untracked(() => this.syncGestureCancellation(renderState));
      },
    });

    afterRenderEffect({
      write: () => this.syncTouchAction(this.resolvedDirection()),
    });

    afterRenderEffect({
      write: () => {
        const popup = this.state.popup();
        untracked(() => this.flushPendingVisuals(popup));
      },
    });

    inject(DestroyRef).onDestroy(() => {
      this.cancelActiveGesture();
      this.engine.destroy();
      this.gestureResizeObserver?.disconnect();
      this.cancelAnimationFrame();
      this.restoreVisuals();
      this.detachStartListener();
      this.detachContinuationListeners();
      this.detachTouchContinuationListeners();
      this.restoreTouchAction();
      unregister();
    });
  }

  private attachStartListener(): void {
    if (this.startListenerAttached) {
      return;
    }
    this.startListenerAttached = true;
    this.elementRef.nativeElement.addEventListener('pointerdown', this.onPointerDown, this.capture);
    this.elementRef.nativeElement.addEventListener(
      'touchstart',
      this.onTouchStart,
      this.touchStartOptions,
    );
  }

  private syncStartListener(renderState: {
    readonly disabled: boolean;
    readonly open: boolean;
  }): void {
    if (renderState.disabled) {
      this.cancelActiveGesture();
    } else if (renderState.open && this.engine.active && !this.ownsProvisionalOpen) {
      this.cancelActiveGesture();
    }
    const shouldListen =
      !renderState.disabled &&
      (!renderState.open || this.activePointerId !== null || this.touchSession.active);
    this.zone.runOutsideAngular(() => {
      if (shouldListen) {
        this.attachStartListener();
      } else {
        this.detachStartListener();
      }
    });
  }

  private syncGestureCancellation(renderState: {
    readonly open: boolean;
    readonly mounted: boolean;
  }): void {
    if (
      this.engine.active &&
      this.ownsProvisionalOpen &&
      (!renderState.open || !renderState.mounted)
    ) {
      this.cancelActiveGesture();
    }
  }

  private detachStartListener(): void {
    if (!this.startListenerAttached) {
      return;
    }
    this.startListenerAttached = false;
    this.elementRef.nativeElement.removeEventListener(
      'pointerdown',
      this.onPointerDown,
      this.capture,
    );
    this.elementRef.nativeElement.removeEventListener(
      'touchstart',
      this.onTouchStart,
      this.touchStartOptions,
    );
  }

  private attachContinuationListeners(): void {
    if (this.continuationListenersAttached) {
      return;
    }
    this.continuationListenersAttached = true;
    this.document.addEventListener('pointermove', this.onPointerMove, this.capture);
    this.document.addEventListener('pointerup', this.onPointerUp, this.capture);
    this.document.addEventListener('pointercancel', this.onPointerCancel, this.capture);
    this.document.addEventListener('contextmenu', this.onContextMenu, this.capture);
  }

  private detachContinuationListeners(): void {
    if (!this.continuationListenersAttached) {
      return;
    }
    this.continuationListenersAttached = false;
    this.document.removeEventListener('pointermove', this.onPointerMove, this.capture);
    this.document.removeEventListener('pointerup', this.onPointerUp, this.capture);
    this.document.removeEventListener('pointercancel', this.onPointerCancel, this.capture);
    this.document.removeEventListener('contextmenu', this.onContextMenu, this.capture);
  }

  private attachTouchContinuationListeners(): void {
    if (this.touchContinuationListenersAttached) {
      return;
    }
    this.touchContinuationListenersAttached = true;
    this.document.addEventListener('touchmove', this.onTouchMove, this.touchMoveOptions);
    this.document.addEventListener('touchend', this.onTouchEnd, this.touchEndOptions);
    this.document.addEventListener('touchcancel', this.onTouchCancel, this.touchEndOptions);
  }

  private detachTouchContinuationListeners(): void {
    if (!this.touchContinuationListenersAttached) {
      return;
    }
    this.touchContinuationListenersAttached = false;
    this.document.removeEventListener('touchmove', this.onTouchMove, this.touchMoveOptions);
    this.document.removeEventListener('touchend', this.onTouchEnd, this.touchEndOptions);
    this.document.removeEventListener('touchcancel', this.onTouchCancel, this.touchEndOptions);
  }

  private onMove(update: DrawerSwipeUpdate): void {
    // The provisional open is requested at most once per gesture: a cancelled `beforeOpenChange`
    // must not be re-emitted on every move, and ownership follows the accepted request rather than
    // `open()`, which a controlled input only reflects after the change has propagated.
    if (!this.provisionalOpenRequested && update.displacement >= 1 && !this.state.open()) {
      this.provisionalOpenRequested = true;
      this.ownsProvisionalOpen = this.state.requestOpen(true, 'swipe-area', {
        nativeEvent: this.gestureNativeEvent,
      });
    }
    this.queueVisuals(update);
  }

  private queueVisuals(update: DrawerSwipeUpdate): void {
    this.pendingVisual = update;
    if (this.animationFrame) {
      return;
    }
    const view = this.document.defaultView;
    if (!view?.requestAnimationFrame) {
      this.writeVisuals();
      return;
    }
    this.animationFrame = view.requestAnimationFrame(() => {
      this.animationFrame = 0;
      this.writeVisuals();
    });
  }

  private flushPendingVisuals(popup: HTMLElement | null): void {
    if (!popup || !this.pendingVisual || !this.engine.active) {
      return;
    }
    // The swipe movement is re-asserted on every commit the swipe area takes part in, because the
    // commit that opens the drawer resets the movement
    // custom properties. Writing here, in the render write phase, lands the value before paint.
    this.writeVisuals();
  }

  private writeVisuals(): void {
    const pendingVisual = this.pendingVisual;
    if (!pendingVisual) {
      return;
    }
    const popup = this.state.popup();
    if (!popup) {
      // Keep the update pending. The provisional open was requested during this same move, so the
      // portal has not rendered yet; clearing it here painted the popup at its resting open
      // position for a frame before it snapped to the finger. `flushPendingVisuals` writes it as
      // soon as the popup element exists, and `cancelAnimationFrame` discards it if the gesture
      // ends first.
      return;
    }
    this.pendingVisual = null;
    const size = this.ensureGestureSize(popup);
    const update = this.resolveOpeningVisual(pendingVisual, size);
    // `--ngp-drawer-swipe-progress` is dismissal progress everywhere else in the drawer — 0 is
    // fully open, 1 is gone — which is why every example fades its backdrop with
    // `calc(1 - progress)`. A swipe that *opens* the drawer therefore has to count down.
    const progress = 1 - update.progress;
    this.state.visualStore.set({
      movementX: update.movement.x,
      movementY: update.movement.y,
      progress,
      strength: update.strength,
    });

    // The backdrop and the viewport track the gesture too. Writing only to the popup left the
    // backdrop running its own entrance fade while the popup followed the finger.
    const progressElements = [popup, this.state.viewport(), this.state.backdrop()].filter(
      (element): element is HTMLElement => element !== null,
    );
    for (const element of progressElements) {
      this.snapshotVisuals(element);
      element.style.transition = 'none';
      element.style.setProperty(NGP_DRAWER_CSS_VARIABLES.swipeProgress, `${progress}`);
    }

    popup.style.setProperty(NGP_DRAWER_CSS_VARIABLES.swipeMovementX, `${update.movement.x}px`);
    popup.style.setProperty(NGP_DRAWER_CSS_VARIABLES.swipeMovementY, `${update.movement.y}px`);
    popup.style.setProperty(NGP_DRAWER_CSS_VARIABLES.swipeStrength, `${update.strength}`);
  }

  private onRelease(release: DrawerSwipeRelease): void {
    const direction = this.resolvedDirection();
    // A gesture that backed off from its furthest point is a change of mind, not a fling, and its
    // whole-gesture average stays positive through the reversal. Only distance may still open it.
    const flung =
      !release.reversed &&
      Math.max(
        getSwipeDisplacement(direction, release.velocity.recent),
        getSwipeDisplacement(direction, release.velocity.total),
      ) >= SWIPE_AREA_VELOCITY_THRESHOLD;
    const accepted =
      this.ownsProvisionalOpen && (release.displacement >= this.openThreshold() || flung);
    if (accepted) {
      this.stack.suppressNextClick();
      this.resetGesture();
      return;
    }

    this.rollbackProvisionalOpen(release.nativeEvent);
  }

  private openThreshold(): number {
    // A release can beat the first visual write, which is what measures the popup.
    const popup = this.state.popup();
    const size = this.gestureSize ?? (popup ? this.drawerSize(popup) : null);
    return size === null ? SWIPE_AREA_FALLBACK_OPEN_THRESHOLD : size * SWIPE_AREA_OPEN_RATIO;
  }

  private rollbackProvisionalOpen(nativeEvent?: Event): void {
    const ownsProvisionalOpen = this.ownsProvisionalOpen;
    if (ownsProvisionalOpen) {
      this.state.requestOpen(false, 'swipe-area', { nativeEvent });
    }
    this.resetGesture();
  }

  private resetGesture(): void {
    this.cancelAnimationFrame();
    this.state.swiping.set(false);
    this.state.visualStore.reset();
    this.restoreVisuals();
    this.ownsProvisionalOpen = false;
    this.provisionalOpenRequested = false;
    this.gestureNativeEvent = undefined;
    this.gestureSize = null;
    this.gestureResizeObserver?.disconnect();
    this.gestureResizeObserver = null;
  }

  private snapshotVisuals(element: HTMLElement): void {
    if (this.visualSnapshots.has(element)) {
      return;
    }
    this.visualSnapshots.set(element, {
      transition: element.style.transition,
      movementX: element.style.getPropertyValue(NGP_DRAWER_CSS_VARIABLES.swipeMovementX),
      movementY: element.style.getPropertyValue(NGP_DRAWER_CSS_VARIABLES.swipeMovementY),
      progress: element.style.getPropertyValue(NGP_DRAWER_CSS_VARIABLES.swipeProgress),
      strength: element.style.getPropertyValue(NGP_DRAWER_CSS_VARIABLES.swipeStrength),
    });
  }

  private restoreVisuals(): void {
    if (this.visualSnapshots.size === 0) {
      return;
    }
    for (const [element, snapshot] of this.visualSnapshots) {
      element.style.transition = snapshot.transition;
      // The state binding drops `data-swiping` asynchronously; until then a consumer's
      // `[data-swiping]` zero-duration rule would turn the settle into a jump.
      element.removeAttribute(NGP_DRAWER_DATA_ATTRIBUTES.swiping);
    }
    // Resolve the released position under the restored transition before the movement resets,
    // so the browser has a start point to animate from.
    void this.state.popup()?.offsetWidth;
    for (const [element, snapshot] of this.visualSnapshots) {
      this.restoreProperty(element, NGP_DRAWER_CSS_VARIABLES.swipeMovementX, snapshot.movementX);
      this.restoreProperty(element, NGP_DRAWER_CSS_VARIABLES.swipeMovementY, snapshot.movementY);
      this.restoreProperty(element, NGP_DRAWER_CSS_VARIABLES.swipeProgress, snapshot.progress);
      this.restoreProperty(element, NGP_DRAWER_CSS_VARIABLES.swipeStrength, snapshot.strength);
    }
    this.visualSnapshots.clear();
  }

  private restoreProperty(element: HTMLElement, name: string, value: string): void {
    if (value) {
      element.style.setProperty(name, value);
    } else {
      element.style.removeProperty(name);
    }
  }

  private capturePointer(pointerId: number): void {
    const element = this.elementRef.nativeElement;
    if (typeof element.setPointerCapture !== 'function') {
      return;
    }
    try {
      element.setPointerCapture(pointerId);
      this.ownedCapturePointerId = pointerId;
    } catch (error) {
      this.ownedCapturePointerId = null;
      if (!this.isExpectedCaptureError(error)) {
        throw error;
      }
    }
  }

  private releasePointer(pointerId: number): void {
    const element = this.elementRef.nativeElement;
    if (
      this.ownedCapturePointerId === pointerId &&
      typeof element.releasePointerCapture === 'function'
    ) {
      try {
        element.releasePointerCapture(pointerId);
      } catch (error) {
        if (!this.isExpectedCaptureError(error)) {
          throw error;
        }
      } finally {
        this.ownedCapturePointerId = null;
      }
    } else if (this.ownedCapturePointerId === pointerId) {
      this.ownedCapturePointerId = null;
    }
    this.activePointerId = null;
    this.detachContinuationListeners();
    if (this.state.open()) {
      this.detachStartListener();
    }
  }

  private cancelPointer(nativeEvent?: Event): void {
    const pointerId = this.activePointerId;
    if (pointerId !== null) {
      this.engine.cancel(nativeEvent);
      this.releasePointer(pointerId);
    } else {
      this.ownedCapturePointerId = null;
      this.detachContinuationListeners();
    }
  }

  private releaseTouch(): void {
    this.touchSession.reset();
    this.detachTouchContinuationListeners();
    if (this.state.open()) {
      this.detachStartListener();
    }
  }

  private cancelTouch(nativeEvent?: Event): void {
    if (this.touchSession.active) {
      this.engine.cancel(nativeEvent);
    }
    this.releaseTouch();
  }

  private cancelActiveGesture(nativeEvent?: Event): void {
    if (this.activePointerId !== null) {
      this.cancelPointer(nativeEvent);
    } else if (this.touchSession.active) {
      this.cancelTouch(nativeEvent);
    }
  }

  private isExpectedCaptureError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'NotFoundError';
  }

  private cancelAnimationFrame(): void {
    if (this.animationFrame) {
      this.document.defaultView?.cancelAnimationFrame(this.animationFrame);
      this.animationFrame = 0;
    }
    this.pendingVisual = null;
  }

  private resolvedDirection(): NgpDrawerSwipeDirection {
    return this.direction() ?? oppositeSwipeDirection(this.state.swipeDirection());
  }

  private syncTouchAction(direction: NgpDrawerSwipeDirection): void {
    if (!this.ownsTouchAction) {
      return;
    }
    if (this.touchActionChangedExternally()) {
      this.ownsTouchAction = false;
      this.appliedTouchAction = null;
      return;
    }
    const element = this.elementRef.nativeElement;
    const touchAction = getSwipeAxis(direction) === 'y' ? 'pan-x' : 'pan-y';
    element.style.touchAction = touchAction;
    this.appliedTouchAction = touchAction;
  }

  private restoreTouchAction(): void {
    if (!this.ownsTouchAction || this.touchActionChangedExternally()) {
      return;
    }
    this.elementRef.nativeElement.style.touchAction = this.initialTouchAction;
    this.appliedTouchAction = null;
  }

  /** Whether a consumer has replaced the inline `touch-action` this directive last wrote. */
  private touchActionChangedExternally(): boolean {
    return (
      this.appliedTouchAction !== null &&
      this.elementRef.nativeElement.style.touchAction !== this.appliedTouchAction
    );
  }

  private resolveOpeningVisual(update: DrawerSwipeUpdate, closedOffset: number): DrawerSwipeUpdate {
    const direction = this.resolvedDirection();
    const displacement = Math.max(0, update.displacement);
    const dampedDisplacement =
      displacement > closedOffset
        ? closedOffset + Math.sqrt(displacement - closedOffset)
        : displacement;
    const movementValue = -getSwipeSign(direction) * (closedOffset - dampedDisplacement);
    const movement =
      getSwipeAxis(direction) === 'x' ? { x: movementValue, y: 0 } : { x: 0, y: movementValue };
    return {
      ...update,
      movement,
      progress: Math.min(1, displacement / closedOffset),
    };
  }

  private drawerSize(popup = this.state.popup()): number {
    const rect = popup?.getBoundingClientRect();
    const horizontal = getSwipeAxis(this.resolvedDirection()) === 'x';
    return Math.max(40, horizontal ? (rect?.width ?? 0) : (rect?.height ?? 0));
  }

  private ensureGestureSize(popup: HTMLElement): number {
    if (this.gestureSize !== null) {
      return this.gestureSize;
    }
    this.gestureSize = this.drawerSize(popup);
    this.engine.refreshSize(this.gestureSize);
    this.observeGestureSize(popup);
    return this.gestureSize;
  }

  private observeGestureSize(popup: HTMLElement): void {
    const ResizeObserverConstructor = this.document.defaultView?.ResizeObserver;
    if (!ResizeObserverConstructor) {
      return;
    }
    this.gestureResizeObserver?.disconnect();
    this.gestureResizeObserver = new ResizeObserverConstructor(() => {
      if (!this.engine.active) {
        return;
      }
      // The entry's box sizes are logical, so a vertical writing mode swaps them against the
      // physical swipe axis. Offset sizes are physical, and layout is already clean here.
      const horizontal = getSwipeAxis(this.resolvedDirection()) === 'x';
      const nextSize = Math.max(40, horizontal ? popup.offsetWidth : popup.offsetHeight);
      if (nextSize === this.gestureSize) {
        return;
      }
      this.gestureSize = nextSize;
      this.engine.refreshSize(nextSize);
    });
    this.gestureResizeObserver.observe(popup);
  }

  private toInput(event: PointerEvent): DrawerSwipeInput {
    return {
      x: event.clientX,
      y: event.clientY,
      time: event.timeStamp,
      buttons: event.buttons,
      nativeEvent: event,
    };
  }
}
