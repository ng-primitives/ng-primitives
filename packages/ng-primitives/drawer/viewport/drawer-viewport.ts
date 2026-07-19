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
  signal,
  untracked,
} from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding } from 'ng-primitives/state';
import { NgpDrawerSnapPoint, NgpDrawerSwipeDirection } from '../drawer.types';
import { injectDrawerState, requireDrawerState } from '../internal/drawer-state';
import {
  closestDrawerSnapPoint,
  dampSnapOvershoot,
  projectDrawerSnapPoint,
  ResolvedDrawerSnapPoint,
  resolveDrawerSnapPoints,
} from '../internal/snap-points';
import { getSwipeAxis, getSwipeDisplacement, getSwipeSign } from '../internal/swipe/direction';
import {
  DrawerSwipeEngine,
  DrawerSwipeInput,
  DrawerSwipeRelease,
  DrawerSwipeUpdate,
  MIN_DRAG_THRESHOLD,
} from '../internal/swipe/drawer-swipe-engine';
import { DrawerTouchSession } from '../internal/swipe/drawer-touch-session';
import {
  canTransferTouchToDrawer,
  findConsumingScrollable,
  findRelevantScrollable,
  findTouchScrollContext,
  isAtDismissEdge,
  shouldIgnoreSwipeTarget,
} from '../internal/swipe/scrollable';
import { injectDrawerVirtualKeyboardState } from '../internal/virtual-keyboard/keyboard-context';
import { initializeDrawerVisualProperties } from '../internal/visual-properties';

interface InlineVisualSnapshot {
  readonly element: HTMLElement;
  readonly transition: string;
  readonly transform: string;
  readonly computedTransform: DragTransform | null;
  readonly movementX: string;
  readonly movementY: string;
  readonly progress: string;
  readonly strength: string;
}

interface DragTransform {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}

interface InlineSnapSnapshot {
  readonly height: string;
  readonly offset: string;
}

interface ViewportSnapRenderState {
  readonly open: boolean;
  readonly endingStyle: boolean;
  readonly snapPoint: NgpDrawerSnapPoint | null | undefined;
  readonly snapPoints: readonly NgpDrawerSnapPoint[] | undefined;
  readonly defaultSnapPoint: NgpDrawerSnapPoint | null | undefined;
  readonly popupHeight: number;
  readonly swipeDirection: NgpDrawerSwipeDirection;
  readonly popup: HTMLElement | null;
  readonly backdrop: HTMLElement | null;
}

interface ViewportSnapElementMeasurement {
  readonly element: HTMLElement;
  readonly initialSnapshot: InlineSnapSnapshot | null;
}

interface ViewportSnapMeasurement {
  readonly renderState: ViewportSnapRenderState;
  readonly primarySize: number;
  readonly points: ResolvedDrawerSnapPoint[];
  readonly elements: readonly ViewportSnapElementMeasurement[];
}

interface ViewportKeyboardRenderState {
  readonly open: boolean;
  readonly mounted: boolean;
  readonly nestedOpen: boolean;
}

interface TouchOwnershipBase {
  readonly target: Element;
  readonly start: DrawerSwipeInput;
  readonly last: DrawerSwipeInput;
  readonly drawerAxisTarget: HTMLElement | null;
  readonly crossAxisTarget: HTMLElement | null;
}

type TouchOwnership =
  | (TouchOwnershipBase & { readonly ownership: 'pending' })
  | (TouchOwnershipBase & {
      readonly ownership: 'native-scroll';
      readonly axis: 'drawer' | 'cross';
      readonly scrollTarget: HTMLElement | null;
    })
  | (TouchOwnershipBase & { readonly ownership: 'drawer' });

const MIN_SNAP_SWIPE_DISPLACEMENT = 10;

@Directive({ selector: '[ngpDrawerViewport]', standalone: true })
export class NgpDrawerViewport {
  readonly swipeEnabled = input(true, { transform: booleanAttribute });

  private readonly elementRef = injectElementRef<HTMLElement>();
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly keyboardContextRef = injectDrawerVirtualKeyboardState({ optional: true });
  private readonly capture = true;
  private readonly touchStartOptions: AddEventListenerOptions = {
    capture: true,
    passive: true,
  };
  private readonly touchMoveOptions: AddEventListenerOptions = {
    capture: true,
    passive: false,
  };
  private readonly touchEndOptions: AddEventListenerOptions = { capture: true };
  private readonly touchSession = new DrawerTouchSession();
  private readonly engine = new DrawerSwipeEngine({
    direction: () => this.state.swipeDirection(),
    allowOppositeDirection: () => this.hasVerticalSnapGesture(),
    size: () => this.primarySize(),
    onStart: () => this.beginGesture(),
    onMove: update => this.writeVisuals(update),
    onRelease: release => this.handleRelease(release),
    onCancel: () => this.finishVisuals(),
  });
  private activePointerId: number | null = null;
  private ownedCapturePointerId: number | null = null;
  private scrollTarget: HTMLElement | null = null;
  private touchOwnership: TouchOwnership | null = null;
  private visualSnapshots: InlineVisualSnapshot[] = [];
  private gestureSnapPoints: ResolvedDrawerSnapPoint[] | null = null;
  private retainingExitVisuals = false;
  private exitEndingSeen = false;
  private readonly snapSnapshots = new Map<HTMLElement, InlineSnapSnapshot>();
  private resizeObserver: ResizeObserver | null = null;
  private startListenerAttached = false;
  private continuationListenersAttached = false;
  private touchMoveListenerAttached = false;
  private touchContinuationListenersAttached = false;
  private lastKeyboardRenderState: ViewportKeyboardRenderState | null = null;
  private readonly onWindowResize = (): void => this.refreshGestureGeometry();
  private readonly pointerCancellationRenderState = computed(() => ({
    open: this.state.open(),
  }));
  private readonly exitVisualRenderState = computed(() => ({
    open: this.state.open(),
    endingStyle: this.state.endingStyle(),
  }));
  private readonly snapRenderState = computed<ViewportSnapRenderState>(() => ({
    open: this.state.open(),
    endingStyle: this.state.endingStyle(),
    snapPoint: this.state.snapPoint(),
    snapPoints: this.state.snapPoints(),
    defaultSnapPoint: this.state.defaultSnapPoint(),
    popupHeight: this.state.popupHeight(),
    swipeDirection: this.state.swipeDirection(),
    popup: this.state.popup(),
    backdrop: this.state.backdrop(),
  }));
  private readonly snapMeasurement = signal<ViewportSnapMeasurement | null>(null);
  private readonly keyboardRenderState = computed<ViewportKeyboardRenderState>(() => ({
    open: this.state.open(),
    mounted: this.state.mounted(),
    nestedOpen: this.state.nestedOpen(),
  }));
  private readonly startListenerRenderState = computed(() => ({
    open: this.state.open(),
    swipeEnabled: this.swipeEnabled(),
    nestedOpen: this.state.nestedOpen(),
  }));

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.pointerType === 'touch' || this.touchSession.active) {
      return;
    }
    if (
      !this.state.open() ||
      !this.swipeEnabled() ||
      !event.isPrimary ||
      event.button !== 0 ||
      !this.isGestureEvent(event) ||
      shouldIgnoreSwipeTarget(this.firstTarget(event), event.pointerType)
    ) {
      return;
    }

    this.activePointerId = event.pointerId;
    this.attachContinuationListeners();
    this.scrollTarget = findRelevantScrollable(
      this.firstTarget(event),
      this.elementRef.nativeElement,
      this.state.swipeDirection(),
    );
    if (this.scrollTarget && !isAtDismissEdge(this.scrollTarget, this.state.swipeDirection())) {
      return;
    }
    if (!this.startPointer(event)) {
      this.releasePointer(event.pointerId);
    }
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') {
      return;
    }
    if (event.pointerId !== this.activePointerId) {
      return;
    }
    if (!this.engine.active) {
      if (this.scrollTarget && !isAtDismissEdge(this.scrollTarget, this.state.swipeDirection())) {
        return;
      }
      this.scrollTarget = null;
      if (!this.startPointer(event)) {
        this.releasePointer(event.pointerId);
      }
      return;
    }

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
    if (this.activePointerId !== null) {
      return;
    }
    if (this.touchSession.active) {
      if (event.touches.length !== 1) {
        this.cancelTouch(event);
      }
      return;
    }
    if (!this.state.open() || !this.swipeEnabled() || !this.isGestureEvent(event)) {
      return;
    }
    const input = this.touchSession.start(event);
    if (!input) {
      return;
    }
    const target = this.resolveTouchTarget(event, input);
    if (!target || shouldIgnoreSwipeTarget(target, 'touch')) {
      this.touchSession.reset();
      return;
    }
    const context = findTouchScrollContext(
      target,
      this.elementRef.nativeElement,
      this.state.swipeDirection(),
    );
    this.touchOwnership = {
      ownership: 'pending',
      target,
      start: input,
      last: input,
      drawerAxisTarget: context.drawerAxis,
      crossAxisTarget: context.crossAxis,
    };
    this.attachTouchContinuationListeners();
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
    const ownership = this.touchOwnership;
    if (!input || !ownership) {
      return;
    }
    if (shouldIgnoreSwipeTarget(ownership.target, 'touch')) {
      this.cancelTouch(event);
      return;
    }

    const direction = this.state.swipeDirection();
    const axis = getSwipeAxis(direction);
    const crossAxis = axis === 'x' ? 'y' : 'x';
    const drawerDelta = input[axis] - ownership.last[axis];
    const totalDrawer = input[axis] - ownership.start[axis];
    const totalCross = input[crossAxis] - ownership.start[crossAxis];
    if (ownership.ownership === 'native-scroll' && ownership.axis === 'cross') {
      this.touchOwnership = { ...ownership, last: input };
      return;
    }
    if (
      Math.max(Math.abs(totalDrawer), Math.abs(totalCross)) >= MIN_DRAG_THRESHOLD &&
      Math.abs(totalCross) > Math.abs(totalDrawer)
    ) {
      this.engine.cancel(event);
      this.touchOwnership = {
        ...ownership,
        ownership: 'native-scroll',
        axis: 'cross',
        scrollTarget: ownership.crossAxisTarget,
        last: input,
      };
      return;
    }

    if (ownership.ownership === 'drawer') {
      const update = this.engine.move(input);
      this.touchOwnership = { ...ownership, last: input };
      if (update && event.cancelable) {
        event.preventDefault();
      }
      if (!this.engine.active) {
        this.releaseTouch();
      }
      return;
    }

    if (drawerDelta === 0) {
      this.touchOwnership = { ...ownership, last: input };
      return;
    }

    const consumingScrollable = findConsumingScrollable(
      ownership.target,
      this.elementRef.nativeElement,
      direction,
      drawerDelta,
    );
    if (consumingScrollable) {
      this.touchOwnership = {
        ...ownership,
        ownership: 'native-scroll',
        axis: 'drawer',
        scrollTarget: consumingScrollable,
        last: input,
      };
      return;
    }

    const canTransfer = ownership.drawerAxisTarget
      ? canTransferTouchToDrawer(
          ownership.target,
          this.elementRef.nativeElement,
          direction,
          drawerDelta,
        )
      : true;
    if (!canTransfer) {
      this.touchOwnership = {
        ...ownership,
        ownership: 'native-scroll',
        axis: 'drawer',
        scrollTarget: ownership.drawerAxisTarget,
        last: input,
      };
      return;
    }

    if (!this.engine.start(ownership.start) || !this.engine.rebase(input)) {
      this.releaseTouch();
      return;
    }
    this.touchOwnership = { ...ownership, ownership: 'drawer', last: input };
    if (event.cancelable) {
      event.preventDefault();
    }
  };

  private readonly onTouchEnd = (event: TouchEvent): void => {
    const input = this.touchSession.end(event);
    if (!input) {
      return;
    }
    if (this.touchOwnership?.ownership === 'drawer' && this.engine.active) {
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
    'ngpDrawerViewport',
  );
  constructor() {
    initializeDrawerVisualProperties(this.elementRef.nativeElement);
    const releasePart = this.state.claimPart('viewport');
    const unregister = this.state.setPartElement('viewport', this.elementRef.nativeElement);
    const keyboardContext = this.keyboardContextRef();
    const unregisterKeyboard = keyboardContext?.register(this.state, this.elementRef.nativeElement);
    dataBinding(this.elementRef, 'data-open', () => this.state.open());
    dataBinding(this.elementRef, 'data-closed', () => !this.state.open());
    if (this.state.startingStyle()) {
      this.elementRef.nativeElement.setAttribute('data-starting-style', '');
    }
    dataBinding(this.elementRef, 'data-starting-style', () => this.state.startingStyle());
    dataBinding(this.elementRef, 'data-ending-style', () => this.state.endingStyle());
    dataBinding(this.elementRef, 'data-nested', () => this.state.nested());

    afterRenderEffect({
      write: () => {
        const renderState = this.pointerCancellationRenderState();
        untracked(() => this.syncPointerCancellation(renderState));
      },
    });

    afterRenderEffect({
      write: () => {
        const renderState = this.exitVisualRenderState();
        untracked(() => this.syncExitVisuals(renderState));
      },
    });

    afterRenderEffect({
      earlyRead: () => {
        const renderState = this.snapRenderState();
        const measurement = untracked(() => this.measureSnapGeometry(renderState));
        this.snapMeasurement.set(measurement);
      },
    });

    afterRenderEffect({
      write: () => {
        const measurement = this.snapMeasurement();
        if (!measurement) {
          return;
        }
        untracked(() => this.applySnapMeasurement(measurement));
      },
    });

    afterRenderEffect({
      mixedReadWrite: () => {
        const renderState = this.keyboardRenderState();
        untracked(() => this.syncKeyboard(keyboardContext, renderState));
      },
    });

    afterRenderEffect({
      write: () => {
        const renderState = this.startListenerRenderState();
        untracked(() => this.syncStartListener(renderState));
      },
    });

    inject(DestroyRef).onDestroy(() => {
      this.engine.destroy();
      this.resizeObserver?.disconnect();
      this.document.defaultView?.removeEventListener('resize', this.onWindowResize);
      this.restoreVisuals();
      this.state.visualStore.reset();
      this.state.swiping.set(false);
      this.state.swipeDismiss.set(null);
      this.retainingExitVisuals = false;
      this.exitEndingSeen = false;
      this.gestureSnapPoints = null;
      this.restoreSnapVisuals();
      this.detachStartListener();
      this.detachContinuationListeners();
      this.touchSession.reset();
      this.touchOwnership = null;
      this.detachTouchContinuationListeners();
      this.detachTouchMoveListener();
      unregisterKeyboard?.();
      unregister();
      releasePart();
    });
    this.observeSnapGeometry();
  }

  private syncPointerCancellation(renderState: { readonly open: boolean }): void {
    if (!renderState.open) {
      this.cancelPointer();
      this.cancelTouch();
    } else {
      this.state.swipeDismiss.set(null);
    }
  }

  private syncExitVisuals(renderState: {
    readonly open: boolean;
    readonly endingStyle: boolean;
  }): void {
    if (!this.retainingExitVisuals) {
      return;
    }
    if (renderState.endingStyle) {
      this.exitEndingSeen = true;
    } else if (renderState.open || this.exitEndingSeen) {
      this.releaseExitVisuals();
    }
  }

  private syncKeyboard(
    keyboardContext: { sync(): void } | null,
    renderState: ViewportKeyboardRenderState,
  ): void {
    if (this.lastKeyboardRenderState === renderState) {
      return;
    }
    this.lastKeyboardRenderState = renderState;
    keyboardContext?.sync();
  }

  private syncStartListener(renderState: {
    readonly open: boolean;
    readonly swipeEnabled: boolean;
    readonly nestedOpen: boolean;
  }): void {
    const shouldListen = renderState.open && renderState.swipeEnabled && !renderState.nestedOpen;
    if (!shouldListen) {
      this.cancelPointer();
      this.cancelTouch();
    }
    this.zone.runOutsideAngular(() => {
      if (shouldListen) {
        this.attachStartListener();
        this.attachTouchMoveListener();
      } else {
        this.detachStartListener();
        this.detachTouchMoveListener();
      }
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
    this.document.addEventListener('touchend', this.onTouchEnd, this.touchEndOptions);
    this.document.addEventListener('touchcancel', this.onTouchCancel, this.touchEndOptions);
  }

  private detachTouchContinuationListeners(): void {
    if (!this.touchContinuationListenersAttached) {
      return;
    }
    this.touchContinuationListenersAttached = false;
    this.document.removeEventListener('touchend', this.onTouchEnd, this.touchEndOptions);
    this.document.removeEventListener('touchcancel', this.onTouchCancel, this.touchEndOptions);
  }

  private attachTouchMoveListener(): void {
    if (this.touchMoveListenerAttached) {
      return;
    }
    this.touchMoveListenerAttached = true;
    this.document.addEventListener('touchmove', this.onTouchMove, this.touchMoveOptions);
  }

  private detachTouchMoveListener(): void {
    if (!this.touchMoveListenerAttached) {
      return;
    }
    this.touchMoveListenerAttached = false;
    this.document.removeEventListener('touchmove', this.onTouchMove, this.touchMoveOptions);
  }

  private startPointer(event: PointerEvent): boolean {
    if (!this.engine.start(this.toInput(event))) {
      return false;
    }
    this.capturePointer(event.pointerId);
    return true;
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
    this.scrollTarget = null;
    this.detachContinuationListeners();
  }

  private cancelPointer(nativeEvent?: Event): void {
    const pointerId = this.activePointerId;
    this.engine.cancel(nativeEvent);
    if (pointerId !== null) {
      this.releasePointer(pointerId);
    } else {
      this.ownedCapturePointerId = null;
      this.scrollTarget = null;
      this.detachContinuationListeners();
    }
  }

  private releaseTouch(): void {
    this.touchSession.reset();
    this.touchOwnership = null;
    this.detachTouchContinuationListeners();
  }

  private cancelTouch(nativeEvent?: Event): void {
    if (!this.touchSession.active) {
      this.touchOwnership = null;
      this.detachTouchContinuationListeners();
      return;
    }
    this.engine.cancel(nativeEvent);
    this.releaseTouch();
  }

  private isExpectedCaptureError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'NotFoundError';
  }

  private isGestureEvent(event: Event): boolean {
    const viewport = this.elementRef.nativeElement;
    const popup = this.state.popup();
    const path = event.composedPath();
    return path.includes(viewport) || Boolean(popup && path.includes(popup));
  }

  private firstTarget(event: Event): EventTarget | null {
    return event.composedPath()[0] ?? event.target;
  }

  private resolveTouchTarget(event: TouchEvent, input: DrawerSwipeInput): Element | null {
    const composed = this.firstTarget(event);
    const composedElement =
      composed instanceof Element && this.isGestureTarget(composed) ? composed : null;
    const hit = this.document.elementFromPoint?.(input.x, input.y) ?? null;
    const hitElement = hit && this.isGestureTarget(hit) ? hit : null;
    if (hitElement) {
      return hitElement;
    }
    return composedElement ?? hitElement;
  }

  private isGestureTarget(target: Element): boolean {
    const viewport = this.elementRef.nativeElement;
    const popup = this.state.popup();
    let current: Element | null = target;
    while (current) {
      if (current === viewport || current === popup) {
        return true;
      }
      if (current.assignedSlot) {
        current = current.assignedSlot;
        continue;
      }
      if (current.parentElement) {
        current = current.parentElement;
        continue;
      }
      const root = current.getRootNode();
      current = root instanceof ShadowRoot ? root.host : null;
    }
    return false;
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

  private primarySize(): number {
    const element = this.state.popup() ?? this.elementRef.nativeElement;
    const rect = element.getBoundingClientRect();
    return this.state.swipeDirection() === 'left' || this.state.swipeDirection() === 'right'
      ? rect.width
      : rect.height;
  }

  private visualElements(): HTMLElement[] {
    return [this.elementRef.nativeElement, this.state.popup(), this.state.backdrop()].filter(
      (element): element is HTMLElement => Boolean(element),
    );
  }

  private beginVisuals(): void {
    this.state.swiping.set(true);
    const popup = this.state.popup();
    const directTransform = !this.hasVerticalSnapGesture();
    this.visualSnapshots = this.visualElements().map(element => ({
      element,
      transition: element.style.transition,
      transform: element.style.transform,
      computedTransform:
        directTransform && element === popup ? this.readDragTransform(element) : null,
      movementX: element.style.getPropertyValue('--ngp-drawer-swipe-movement-x'),
      movementY: element.style.getPropertyValue('--ngp-drawer-swipe-movement-y'),
      progress: element.style.getPropertyValue('--ngp-drawer-swipe-progress'),
      strength: element.style.getPropertyValue('--ngp-drawer-swipe-strength'),
    }));
    for (const snapshot of this.visualSnapshots) {
      snapshot.element.style.transition = 'none';
    }
  }

  private beginGesture(): void {
    this.gestureSnapPoints = this.resolvedSnapPoints();
    this.beginVisuals();
  }

  private writeVisuals(rawUpdate: DrawerSwipeUpdate): void {
    const update = this.adjustSnapOvershoot(rawUpdate);
    this.state.visualStore.set({
      movementX: update.movement.x,
      movementY: update.movement.y,
      progress: update.progress,
      strength: update.strength,
    });
    for (const element of this.visualElements()) {
      element.style.setProperty('--ngp-drawer-swipe-movement-x', `${update.movement.x}px`);
      element.style.setProperty('--ngp-drawer-swipe-movement-y', `${update.movement.y}px`);
      element.style.setProperty('--ngp-drawer-swipe-progress', `${update.progress}`);
      element.style.setProperty('--ngp-drawer-swipe-strength', `${update.strength}`);
    }
    const popupSnapshot = this.visualSnapshots.find(snapshot => snapshot.computedTransform);
    if (popupSnapshot?.computedTransform) {
      const initial = popupSnapshot.computedTransform;
      popupSnapshot.element.style.transform = `translate3d(${initial.x + update.movement.x}px, ${
        initial.y + update.movement.y
      }px, 0px) scale(${initial.scale})`;
    }
  }

  private handleRelease(release: DrawerSwipeRelease): void {
    let retainForExit = false;
    const points = this.gestureSnapPoints ?? this.resolvedSnapPoints();
    const active = this.activeResolvedSnapPoint(points);
    if (active && points.length > 0 && this.isVertical()) {
      const recentVelocity = getSwipeDisplacement(
        this.state.swipeDirection(),
        release.velocity.recent,
      );
      const totalVelocity = getSwipeDisplacement(
        this.state.swipeDirection(),
        release.velocity.total,
      );
      const directionalDisplacement = getSwipeDisplacement(
        this.state.swipeDirection(),
        release.rawMovement,
      );
      let resolvedVelocity = Number.isFinite(recentVelocity) ? recentVelocity : totalVelocity;
      if (
        Math.abs(directionalDisplacement) >= MIN_SNAP_SWIPE_DISPLACEMENT &&
        Math.sign(resolvedVelocity) !== 0 &&
        Math.sign(resolvedVelocity) !== Math.sign(directionalDisplacement)
      ) {
        resolvedVelocity = totalVelocity;
      }
      const target = projectDrawerSnapPoint(
        points,
        active,
        directionalDisplacement,
        resolvedVelocity,
        this.state.snapToSequentialPoints(),
      );
      if (target) {
        this.state.requestSnapPoint(target.value, 'swipe', { nativeEvent: release.nativeEvent });
        this.syncSnapVisuals(points);
      } else {
        this.state.swipeDismiss.set(this.state.swipeDirection());
        retainForExit = this.state.requestOpen(false, 'swipe', {
          nativeEvent: release.nativeEvent,
        });
      }
    } else if (release.dismissed) {
      this.state.swipeDismiss.set(this.state.swipeDirection());
      retainForExit = this.state.requestOpen(false, 'swipe', {
        nativeEvent: release.nativeEvent,
      });
    }
    if (!retainForExit) {
      this.state.swipeDismiss.set(null);
    }
    this.finishVisuals(retainForExit);
  }

  private finishVisuals(retainForExit = false): void {
    if (retainForExit) {
      this.retainExitVisuals();
    } else {
      this.releaseExitVisuals();
    }
    this.state.swiping.set(false);
    this.gestureSnapPoints = null;
  }

  private retainExitVisuals(): void {
    for (const snapshot of this.visualSnapshots) {
      snapshot.element.style.transition = snapshot.transition;
      snapshot.element.style.transform = snapshot.transform;
    }
    this.retainingExitVisuals = true;
    this.exitEndingSeen = false;
  }

  private releaseExitVisuals(): void {
    const idleSnapProgress = this.resolveIdleSnapProgress();
    this.restoreVisuals(idleSnapProgress);
    this.state.visualStore.reset();
    if (idleSnapProgress !== null) {
      this.state.visualStore.set({ progress: idleSnapProgress });
    }
    this.state.swipeDismiss.set(null);
    this.retainingExitVisuals = false;
    this.exitEndingSeen = false;
  }

  private adjustSnapOvershoot(update: DrawerSwipeUpdate): DrawerSwipeUpdate {
    const points = this.gestureSnapPoints ?? this.resolvedSnapPoints();
    const active = this.activeResolvedSnapPoint(points);
    if (!active || !this.isVertical()) {
      return update;
    }
    const axis = getSwipeAxis(this.state.swipeDirection());
    const sign = getSwipeSign(this.state.swipeDirection());
    const signedMovement = update.rawMovement[axis] * sign;
    const adjustedMovement = dampSnapOvershoot(signedMovement, active.offset) * sign;
    return {
      ...update,
      movement: { ...update.movement, [axis]: adjustedMovement },
      progress:
        this.resolveSnapProgress(points, active.offset + update.rawMovement.y) ?? update.progress,
    };
  }

  private hasVerticalSnapGesture(): boolean {
    return this.isVertical() && this.activeResolvedSnapPoint(this.gestureSnapPoints ?? []) !== null;
  }

  private resolveIdleSnapProgress(): number | null {
    if (!this.state.open() || !this.isVertical() || !this.state.snapPoints()?.length) {
      return null;
    }
    const points = this.resolvedSnapPoints();
    const active = this.activeResolvedSnapPoint(points);
    return active ? this.resolveSnapProgress(points, active.offset) : null;
  }

  private resolveSnapProgress(
    points: readonly ResolvedDrawerSnapPoint[],
    offset: number,
  ): number | null {
    const offsets = points
      .map(point => point.offset)
      .filter(value => Number.isFinite(value))
      .sort((first, second) => first - second);
    if (offsets.length < 2) {
      return null;
    }
    const minimum = offsets[0];
    const next = offsets[1];
    const maximum = offsets[offsets.length - 1];
    const range = next - minimum > 0 ? next - minimum : maximum - minimum;
    if (range <= 0) {
      return null;
    }
    return Math.max(0, Math.min(1, (offset - minimum) / range));
  }

  private readDragTransform(element: HTMLElement): DragTransform {
    const transform = this.document.defaultView?.getComputedStyle(element).transform;
    if (!transform || transform === 'none') {
      return { x: 0, y: 0, scale: 1 };
    }
    const matrix = transform.match(/matrix(?:3d)?\(([^)]+)\)/);
    if (!matrix) {
      return { x: 0, y: 0, scale: 1 };
    }
    const values = matrix[1].split(',').map(value => Number.parseFloat(value));
    if (values.length === 6) {
      return {
        x: values[4],
        y: values[5],
        scale: Math.hypot(values[0], values[1]),
      };
    }
    if (values.length === 16) {
      return { x: values[12], y: values[13], scale: values[0] };
    }
    return { x: 0, y: 0, scale: 1 };
  }

  private measureSnapGeometry(renderState: ViewportSnapRenderState): ViewportSnapMeasurement {
    const viewport = this.elementRef.nativeElement;
    const viewportRect = viewport.getBoundingClientRect();
    const popupRect =
      renderState.popup && (renderState.popupHeight === 0 || this.engine.active)
        ? renderState.popup.getBoundingClientRect()
        : undefined;
    const primaryRect = popupRect ?? viewportRect;
    const horizontal =
      renderState.swipeDirection === 'left' || renderState.swipeDirection === 'right';
    const view = this.document.defaultView;
    const viewportHeight = viewportRect.height || view?.innerHeight || 0;
    const rootFontSize = Number.parseFloat(
      view?.getComputedStyle(this.document.documentElement).fontSize ?? '16',
    );
    const points = resolveDrawerSnapPoints(
      renderState.snapPoints,
      viewportHeight,
      renderState.popupHeight || popupRect?.height || 0,
      Number.isFinite(rootFontSize) ? rootFontSize : 16,
    );
    const elements = [viewport, renderState.popup, renderState.backdrop]
      .filter((element): element is HTMLElement => element !== null)
      .map(element => ({
        element,
        initialSnapshot: this.snapSnapshots.has(element)
          ? null
          : {
              height: element.style.getPropertyValue('--ngp-drawer-height'),
              offset: element.style.getPropertyValue('--ngp-drawer-snap-point-offset'),
            },
      }));
    return {
      renderState,
      primarySize: horizontal ? primaryRect.width : primaryRect.height,
      points,
      elements,
    };
  }

  private applySnapMeasurement(measurement: ViewportSnapMeasurement): void {
    for (const { element, initialSnapshot } of measurement.elements) {
      if (initialSnapshot) {
        this.snapSnapshots.set(element, initialSnapshot);
      }
    }
    if (this.engine.active) {
      this.engine.refreshSize(measurement.primarySize);
      this.gestureSnapPoints = measurement.points;
    }
    this.applySnapVisuals(
      measurement.points,
      measurement.elements.map(({ element }) => element),
      measurement.renderState,
    );
  }

  private observeSnapGeometry(): void {
    const view = this.document.defaultView;
    const ResizeObserverConstructor = view?.ResizeObserver;
    if (ResizeObserverConstructor) {
      this.resizeObserver = new ResizeObserverConstructor(() => this.refreshGestureGeometry());
      this.resizeObserver.observe(this.elementRef.nativeElement);
      this.resizeObserver.observe(this.document.documentElement);
    }
    view?.addEventListener('resize', this.onWindowResize);
  }

  private refreshGestureGeometry(): void {
    if (this.engine.active) {
      this.engine.refreshSize();
      this.gestureSnapPoints = this.resolvedSnapPoints();
      return;
    }
    this.syncSnapVisuals();
  }

  private resolvedSnapPoints(): ResolvedDrawerSnapPoint[] {
    const view = this.document.defaultView;
    const viewportHeight =
      this.elementRef.nativeElement.getBoundingClientRect().height || view?.innerHeight || 0;
    const rootFontSize = Number.parseFloat(
      view?.getComputedStyle(this.document.documentElement).fontSize ?? '16',
    );
    return resolveDrawerSnapPoints(
      this.state.snapPoints(),
      viewportHeight,
      this.state.popupHeight() || this.state.popup()?.getBoundingClientRect().height || 0,
      Number.isFinite(rootFontSize) ? rootFontSize : 16,
    );
  }

  private activeResolvedSnapPoint(
    points: readonly ResolvedDrawerSnapPoint[],
    current = this.state.snapPoint(),
    defaultSnapPoint = this.state.defaultSnapPoint(),
    configuredPoints = this.state.snapPoints(),
    popupHeight = this.state.popupHeight(),
  ): ResolvedDrawerSnapPoint | null {
    if (current === null) {
      return null;
    }
    const configured =
      current === undefined ? (defaultSnapPoint ?? configuredPoints?.[0]) : current;
    if (configured === null || configured === undefined) {
      return null;
    }
    return (
      points.find(point => point.value === configured) ??
      closestDrawerSnapPoint(points, popupHeight)
    );
  }

  private syncSnapVisuals(points = this.gestureSnapPoints ?? this.resolvedSnapPoints()): void {
    const elements = this.visualElements();
    for (const element of elements) {
      this.snapSnapshots.set(
        element,
        this.snapSnapshots.get(element) ?? {
          height: element.style.getPropertyValue('--ngp-drawer-height'),
          offset: element.style.getPropertyValue('--ngp-drawer-snap-point-offset'),
        },
      );
    }
    this.applySnapVisuals(points, elements, {
      open: this.state.open(),
      endingStyle: this.state.endingStyle(),
      snapPoint: this.state.snapPoint(),
      snapPoints: this.state.snapPoints(),
      defaultSnapPoint: this.state.defaultSnapPoint(),
      popupHeight: this.state.popupHeight(),
      swipeDirection: this.state.swipeDirection(),
      popup: this.state.popup(),
      backdrop: this.state.backdrop(),
    });
  }

  private applySnapVisuals(
    points: readonly ResolvedDrawerSnapPoint[],
    elements: readonly HTMLElement[],
    renderState: ViewportSnapRenderState,
  ): void {
    if (this.retainingExitVisuals && !renderState.open) {
      return;
    }
    const active = this.activeResolvedSnapPoint(
      points,
      renderState.snapPoint,
      renderState.defaultSnapPoint,
      renderState.snapPoints,
      renderState.popupHeight,
    );
    const vertical = renderState.swipeDirection === 'up' || renderState.swipeDirection === 'down';
    for (const element of elements) {
      if (active && vertical) {
        element.style.setProperty('--ngp-drawer-snap-point-offset', `${active.offset}px`);
        element.style.setProperty('--ngp-drawer-height', `${active.height}px`);
      } else {
        this.restoreSnapElement(element);
      }
    }
    if (
      !this.engine.active &&
      renderState.open &&
      !renderState.endingStyle &&
      vertical &&
      points.length >= 2
    ) {
      const progress = active
        ? this.resolveSnapProgress(points, active.offset)
        : renderState.snapPoint === null
          ? 0
          : null;
      if (progress === null) {
        return;
      }
      this.state.visualStore.set({ progress });
      for (const element of elements) {
        element.style.setProperty('--ngp-drawer-swipe-progress', `${progress}`);
      }
    }
  }

  private restoreSnapVisuals(): void {
    for (const element of this.snapSnapshots.keys()) {
      this.restoreSnapElement(element);
    }
    this.snapSnapshots.clear();
  }

  private restoreSnapElement(element: HTMLElement): void {
    const snapshot = this.snapSnapshots.get(element);
    if (!snapshot) {
      return;
    }
    this.restoreProperty(element, '--ngp-drawer-height', snapshot.height);
    this.restoreProperty(element, '--ngp-drawer-snap-point-offset', snapshot.offset);
  }

  private isVertical(): boolean {
    return this.state.swipeDirection() === 'up' || this.state.swipeDirection() === 'down';
  }

  private restoreVisuals(progressOverride: number | null = null): void {
    for (const snapshot of this.visualSnapshots) {
      snapshot.element.style.transition = snapshot.transition;
      snapshot.element.style.transform = snapshot.transform;
      this.restoreProperty(snapshot.element, '--ngp-drawer-swipe-movement-x', snapshot.movementX);
      this.restoreProperty(snapshot.element, '--ngp-drawer-swipe-movement-y', snapshot.movementY);
      this.restoreProperty(
        snapshot.element,
        '--ngp-drawer-swipe-progress',
        progressOverride === null ? snapshot.progress : `${progressOverride}`,
      );
      this.restoreProperty(snapshot.element, '--ngp-drawer-swipe-strength', snapshot.strength);
    }
    this.visualSnapshots = [];
  }

  private restoreProperty(element: HTMLElement, name: string, value: string): void {
    if (value) {
      element.style.setProperty(name, value);
    } else {
      element.style.removeProperty(name);
    }
  }
}
