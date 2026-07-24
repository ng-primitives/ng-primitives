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
} from '../internal/swipe/drawer-swipe-engine';
import { DrawerTouchSession } from '../internal/swipe/drawer-touch-session';
import { shouldIgnoreSwipeTarget } from '../internal/swipe/scrollable';

interface SwipeAreaVisualSnapshot {
  readonly element: HTMLElement;
  readonly transition: string;
  readonly movementX: string;
  readonly movementY: string;
  readonly progress: string;
  readonly strength: string;
}

const SWIPE_AREA_OPEN_RATIO = 0.5;
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
  private visualSnapshot: SwipeAreaVisualSnapshot | null = null;
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
    dataBinding(this.elementRef, 'data-disabled', () => this.disabled());
    dataBinding(this.elementRef, 'data-open', () => this.state.open());
    dataBinding(this.elementRef, 'data-closed', () => !this.state.open());
    dataBinding(this.elementRef, 'data-swiping', () => this.state.swiping());
    dataBinding(this.elementRef, 'data-swipe-direction', () => this.resolvedDirection());

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

  private writeVisuals(): void {
    const pendingVisual = this.pendingVisual;
    if (!pendingVisual) {
      return;
    }
    this.pendingVisual = null;
    const popup = this.state.popup();
    if (!popup) {
      return;
    }
    const size = this.ensureGestureSize(popup);
    const update = this.resolveOpeningVisual(pendingVisual, size);
    this.state.visualStore.set({
      movementX: update.movement.x,
      movementY: update.movement.y,
      progress: update.progress,
      strength: update.strength,
    });
    this.visualSnapshot ??= {
      element: popup,
      transition: popup.style.transition,
      movementX: popup.style.getPropertyValue('--ngp-drawer-swipe-movement-x'),
      movementY: popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y'),
      progress: popup.style.getPropertyValue('--ngp-drawer-swipe-progress'),
      strength: popup.style.getPropertyValue('--ngp-drawer-swipe-strength'),
    };
    popup.style.transition = 'none';
    popup.style.setProperty('--ngp-drawer-swipe-movement-x', `${update.movement.x}px`);
    popup.style.setProperty('--ngp-drawer-swipe-movement-y', `${update.movement.y}px`);
    popup.style.setProperty('--ngp-drawer-swipe-progress', `${update.progress}`);
    popup.style.setProperty('--ngp-drawer-swipe-strength', `${update.strength}`);
  }

  private onRelease(release: DrawerSwipeRelease): void {
    const velocity = Math.max(
      getSwipeDisplacement(this.resolvedDirection(), release.velocity.recent),
      getSwipeDisplacement(this.resolvedDirection(), release.velocity.total),
    );
    const accepted =
      this.ownsProvisionalOpen &&
      (release.displacement >= (this.gestureSize ?? 40) * SWIPE_AREA_OPEN_RATIO ||
        velocity >= SWIPE_AREA_VELOCITY_THRESHOLD);
    if (accepted) {
      this.stack.suppressNextClick();
      this.resetGesture();
      return;
    }

    this.rollbackProvisionalOpen(release.nativeEvent);
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

  private restoreVisuals(): void {
    const snapshot = this.visualSnapshot;
    if (!snapshot) {
      return;
    }
    snapshot.element.style.transition = snapshot.transition;
    this.restoreProperty(snapshot.element, '--ngp-drawer-swipe-movement-x', snapshot.movementX);
    this.restoreProperty(snapshot.element, '--ngp-drawer-swipe-movement-y', snapshot.movementY);
    this.restoreProperty(snapshot.element, '--ngp-drawer-swipe-progress', snapshot.progress);
    this.restoreProperty(snapshot.element, '--ngp-drawer-swipe-strength', snapshot.strength);
    this.visualSnapshot = null;
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
    const element = this.elementRef.nativeElement;
    if (this.appliedTouchAction !== null && element.style.touchAction !== this.appliedTouchAction) {
      this.ownsTouchAction = false;
      this.appliedTouchAction = null;
      return;
    }
    const touchAction = getSwipeAxis(direction) === 'y' ? 'pan-x' : 'pan-y';
    element.style.touchAction = touchAction;
    this.appliedTouchAction = touchAction;
  }

  private restoreTouchAction(): void {
    if (!this.ownsTouchAction) {
      return;
    }
    this.elementRef.nativeElement.style.touchAction = this.initialTouchAction;
    this.appliedTouchAction = null;
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
    const horizontal = this.resolvedDirection() === 'left' || this.resolvedDirection() === 'right';
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
    this.gestureResizeObserver = new ResizeObserverConstructor(entries => {
      const entry = entries.find(candidate => candidate.target === popup);
      if (!entry || !this.engine.active) {
        return;
      }
      const borderSize = Array.isArray(entry.borderBoxSize)
        ? entry.borderBoxSize[0]
        : entry.borderBoxSize;
      const horizontal =
        this.resolvedDirection() === 'left' || this.resolvedDirection() === 'right';
      const measured = horizontal
        ? (borderSize?.inlineSize ?? entry.contentRect.width)
        : (borderSize?.blockSize ?? entry.contentRect.height);
      const nextSize = Math.max(40, measured);
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
