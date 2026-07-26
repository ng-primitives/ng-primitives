import {
  afterRenderEffect,
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  inject,
  input,
  linkedSignal,
  output,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import { explicitEffect } from 'ng-primitives/internal';
import {
  NgpDrawerModal,
  NgpDrawerChangeReason,
  NgpDrawerOpenChangeEvent,
  NgpDrawerSnapPoint,
  NgpDrawerSnapPointChangeEvent,
  NgpDrawerSwipeDirection,
} from '../drawer.types';
import {
  NgpDrawerHandle,
  NgpDrawerHandleController,
  setDrawerHandleController,
} from '../handle/drawer-handle';
import { DrawerStackService } from '../internal/drawer-stack.service';
import {
  DrawerState,
  injectDrawerState,
  ngpDrawer,
  provideDrawerState,
} from '../internal/drawer-state';
import { injectDrawerProviderState } from '../internal/provider-state';

@Directive({
  selector: 'ng-container[ngpDrawer]',
  standalone: true,
  exportAs: 'ngpDrawer',
  providers: [provideDrawerState({ inherit: false })],
})
export class NgpDrawer {
  readonly openInput = input(false, { alias: 'open' });
  readonly open = linkedSignal(() => this.openInput());
  readonly openChange = output<boolean>();

  readonly snapPointInput = input<NgpDrawerSnapPoint | null | undefined>(undefined, {
    alias: 'snapPoint',
  });
  readonly snapPoint = linkedSignal(() => this.snapPointInput());
  readonly snapPointChange = output<NgpDrawerSnapPoint | null | undefined>();

  /**
   * Base UI keeps the raw active point in state but publishes a *resolved* one to every consumer
   * (DrawerRoot.tsx:98-115, :179). An uncontrolled drawer that was dismissed from a snap point
   * holds `null`, and rendering that literally would reopen it at full height instead of its
   * default. A controlled `null` is the consumer's explicit choice and is passed through untouched.
   */
  private readonly resolvedSnapPoint = computed(() => {
    const current = this.snapPoint();
    // `snapPointInput() !== undefined` is Base UI's `isSnapPointControlled`.
    if (this.snapPointInput() !== undefined) {
      return current;
    }
    const points = this.snapPoints();
    if (!points || points.length === 0) {
      return current;
    }
    return current === null ? (this.defaultSnapPoint() ?? points[0]) : current;
  });

  readonly triggerIdInput = input<string | null>(null, { alias: 'triggerId' });
  readonly triggerId = linkedSignal(() => this.triggerIdInput());
  readonly triggerIdChange = output<string | null>();
  readonly modal = input<NgpDrawerModal>(true);
  readonly disablePointerDismissal = input(false, { transform: booleanAttribute });
  readonly swipeDirection = input<NgpDrawerSwipeDirection>('down');
  readonly snapPoints = input<readonly NgpDrawerSnapPoint[] | undefined>();
  readonly defaultSnapPoint = input<NgpDrawerSnapPoint | null | undefined>();
  readonly snapToSequentialPoints = input(false, { transform: booleanAttribute });
  readonly handle = input<NgpDrawerHandle<unknown> | undefined>();

  readonly beforeOpenChange = output<NgpDrawerOpenChangeEvent>();
  readonly openChangeComplete = output<boolean>();
  readonly beforeSnapPointChange = output<NgpDrawerSnapPointChangeEvent>();

  private readonly payloadState = signal<unknown>(undefined);
  readonly payload: Signal<unknown> = this.payloadState.asReadonly();

  private readonly mountedState = signal(false);
  private readonly preventUnmountState = signal(false);
  private readonly destroyRef = inject(DestroyRef);
  private readonly parentStateRef = injectDrawerState({
    optional: true,
    skipSelf: true,
  });
  private readonly nested = computed(() => this.parentStateRef() !== null);
  private readonly expanded = computed(() => {
    const snapPoint = this.snapPoint();
    const effectiveSnapPoint =
      snapPoint === undefined ? (this.defaultSnapPoint() ?? this.snapPoints()?.[0]) : snapPoint;
    return effectiveSnapPoint === 1;
  });
  private readonly providerStateRef = injectDrawerProviderState({ optional: true });
  private readonly stack = inject(DrawerStackService);
  private readonly state: DrawerState;
  private readonly stackRenderState = computed(() => ({
    open: this.open(),
    modal: this.modal(),
    portalAttached: this.state.portalAttached(),
  }));
  private readonly visualStoreRenderState = computed(() => ({
    open: this.open(),
    frontmostHeight: this.state.frontmostHeight(),
  }));

  constructor() {
    this.state = ngpDrawer({
      open: this.open,
      nested: this.nested,
      expanded: this.expanded,
      snapPoint: this.resolvedSnapPoint,
      triggerId: this.triggerId,
      modal: this.modal,
      disablePointerDismissal: this.disablePointerDismissal,
      swipeDirection: this.swipeDirection,
      snapPoints: this.snapPoints,
      defaultSnapPoint: this.defaultSnapPoint,
      snapToSequentialPoints: this.snapToSequentialPoints,
      payload: this.payload,
      mounted: this.mountedState,
      preventUnmount: this.preventUnmountState,
      requestOpen: (nextOpen, reason, context, payload) =>
        this.requestOpen(nextOpen, reason, context?.nativeEvent, context?.trigger, payload),
      requestSnapPoint: (point, reason, context) =>
        this.requestSnapPoint(point, reason, context?.nativeEvent, context?.trigger),
      completeOpenChange: value => this.openChangeComplete.emit(value),
      requestUnmount: () => this.unmount(),
    });

    const unsubscribeNestedVisuals = this.state.nestedVisualStore.subscribe(snapshot => {
      if (!this.state.swiping()) {
        this.state.visualStore.set({
          movementX: snapshot.movementX,
          movementY: snapshot.movementY,
          progress: snapshot.progress,
          strength: snapshot.strength,
          frontmostHeight: this.state.frontmostHeight(),
        });
      }
    });

    const unregisterParent = this.parentStateRef()?.registerNested(this.state);
    const unregisterProvider = this.providerStateRef()?.register(this.state);
    this.destroyRef.onDestroy(() => {
      unregisterParent?.();
      unregisterProvider?.();
      unsubscribeNestedVisuals();
      this.state.visualStore.reset();
    });

    explicitEffect([this.handle], ([handle], onCleanup) => {
      if (!handle) {
        return;
      }
      const detach = setDrawerHandleController(
        handle,
        this.createHandleController() as NgpDrawerHandleController<unknown>,
      );
      onCleanup(detach);
    });

    explicitEffect([this.open], ([open]) => {
      if (open) {
        this.mountedState.set(true);
        this.preventUnmountState.set(false);
      }
    });

    afterRenderEffect({
      mixedReadWrite: () => {
        const renderState = this.stackRenderState();
        untracked(() => this.syncStack(renderState));
      },
    });

    afterRenderEffect({
      write: () => {
        const renderState = this.visualStoreRenderState();
        untracked(() => this.syncVisualStore(renderState));
      },
    });

    this.destroyRef.onDestroy(() => {
      this.state.nestedVisualStore.reset();
      this.stack.deactivate(this.state);
    });
  }

  readonly mounted = computed(() => this.mountedState());

  private syncStack(renderState: {
    readonly open: boolean;
    readonly modal: NgpDrawerModal;
    readonly portalAttached: boolean;
  }): void {
    if (renderState.open && renderState.portalAttached) {
      this.stack.activate(this.state);
    } else {
      this.stack.deactivate(this.state);
    }
  }

  private syncVisualStore(renderState: {
    readonly open: boolean;
    readonly frontmostHeight: number;
  }): void {
    this.state.visualStore.set({
      frontmostHeight: renderState.open ? renderState.frontmostHeight : 0,
      progress: renderState.open ? this.state.visualStore.getSnapshot().progress : 0,
    });
  }

  show(payload?: unknown): void {
    this.requestOpen(true, 'imperative', null, null, payload);
  }

  hide(): void {
    this.requestOpen(false, 'imperative');
  }

  toggle(): void {
    this.requestOpen(!this.open(), 'imperative');
  }

  unmount(): void {
    this.state.nextTransitionGeneration();
    this.state.unmountGeneration.update(value => value + 1);
    this.stack.deactivate(this.state);
    this.preventUnmountState.set(false);
    if (this.open()) {
      this.open.set(false);
      this.openChange.emit(false);
    }
    this.mountedState.set(false);
  }

  private requestOpen(
    nextOpen: boolean,
    reason: NgpDrawerChangeReason,
    nativeEvent: Event | null = null,
    trigger: HTMLElement | null = null,
    payload?: unknown,
    triggerId?: string,
  ): boolean {
    if (this.open() === nextOpen) {
      if (nextOpen && payload !== undefined) {
        this.payloadState.set(payload);
      }
      if (nextOpen) {
        this.setTriggerId(triggerId);
      }
      return true;
    }

    const event = new NgpDrawerOpenChangeEvent(nextOpen, reason, nativeEvent, trigger);
    this.beforeOpenChange.emit(event);
    if (event.canceled) {
      return false;
    }

    if (nextOpen) {
      this.payloadState.set(payload);
      // Only an accepted open may publish the trigger id, and it must be readable by the time
      // `openChange` fires.
      this.setTriggerId(triggerId);
      if (trigger) {
        this.state.activeTrigger.set(trigger);
      }
      this.mountedState.set(true);
      const point = this.defaultSnapPoint() ?? this.snapPoints()?.[0];
      if (this.snapPoint() === undefined && point !== undefined) {
        this.requestSnapPoint(point, reason, nativeEvent, trigger);
      }
    } else {
      this.preventUnmountState.set(event.unmountPrevented);
      const resetPoint = this.defaultSnapPoint() ?? this.snapPoints()?.[0];
      const currentSnapPoint = this.snapPoint();
      // Only a point this directive chose implicitly may be reset on close. `undefined` means
      // "never set", which the open branch above fills in; `null` is the consumer's explicit
      // "no active snap point" and collapsing it into the default would silently discard it.
      if (
        currentSnapPoint !== undefined &&
        currentSnapPoint !== null &&
        currentSnapPoint !== resetPoint
      ) {
        this.requestSnapPoint(resetPoint, reason, nativeEvent, trigger);
      }
    }

    this.open.set(nextOpen);
    this.openChange.emit(nextOpen);
    return true;
  }

  private setTriggerId(triggerId: string | undefined): void {
    if (triggerId === undefined || this.triggerId() === triggerId) {
      return;
    }
    this.triggerId.set(triggerId);
    this.triggerIdChange.emit(triggerId);
  }

  private requestSnapPoint(
    point: NgpDrawerSnapPoint | null | undefined,
    reason: NgpDrawerChangeReason,
    nativeEvent: Event | null = null,
    trigger: HTMLElement | null = null,
  ): boolean {
    if (this.snapPoint() === point) {
      return true;
    }
    const event = new NgpDrawerSnapPointChangeEvent(point, reason, nativeEvent, trigger);
    this.beforeSnapPointChange.emit(event);
    if (event.canceled) {
      return false;
    }
    this.snapPoint.set(point);
    this.snapPointChange.emit(point);
    return true;
  }

  private createHandleController(): NgpDrawerHandleController<unknown> {
    return {
      opened: () => this.open(),
      payload: () => this.payload(),
      open: (payload, triggerId) =>
        void this.requestOpen(true, 'imperative', null, null, payload, triggerId),
      close: () => this.requestOpen(false, 'imperative'),
      toggle: () => this.requestOpen(!this.open(), 'imperative'),
      unmount: () => this.unmount(),
    };
  }
}
