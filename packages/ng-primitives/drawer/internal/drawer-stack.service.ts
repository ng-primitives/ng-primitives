import { ViewportRuler } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Injectable } from '@angular/core';
import {
  BlockScrollStrategy,
  NgpDismissPolicy,
  NgpOverlayRegistry,
  ScrollStrategy,
} from 'ng-primitives/portal';
import { createDrawerId } from './dom';
import { DrawerState } from './drawer-state';

interface CloseWatcherLike {
  addEventListener(type: 'close', listener: (event: Event) => void): void;
  destroy(): void;
}

interface CloseWatcherConstructor {
  new (): CloseWatcherLike;
}

type PointerLocation = 'backdrop' | 'inside' | 'outside';

const POINTER_PRESS_MOVEMENT_TOLERANCE_PX = 5;

interface PointerDownRecord {
  readonly clientX: number;
  readonly clientY: number;
  readonly location: PointerLocation;
  readonly pointerId: number;
  readonly pointerType: string;
  readonly state: DrawerState;
}

@Injectable({ providedIn: 'root' })
export class DrawerStackService {
  private readonly document = inject(DOCUMENT);
  private readonly viewportRuler = inject(ViewportRuler);
  private readonly registry = inject(NgpOverlayRegistry);
  private readonly states: DrawerState[] = [];
  /** The overlay registry id of every active drawer, so it stacks with dialogs, menus and popovers. */
  private readonly registryIds = new Map<DrawerState, string>();
  private readonly capture = true;
  private scrollStrategy: ScrollStrategy | null = null;
  private closeWatcher: CloseWatcherLike | null = null;
  private pointerDown: PointerDownRecord | null = null;
  private pendingTouchDismissal: DrawerState | null = null;
  private suppressClick = false;
  private documentListenersAttached = false;

  private readonly handlePointerDown = (event: PointerEvent): void => this.onPointerDown(event);
  private readonly handlePointerMove = (event: PointerEvent): void => this.onPointerMove(event);
  private readonly handlePointerUp = (event: PointerEvent): void => this.onPointerUp(event);
  private readonly handlePointerCancel = (): void => {
    this.pointerDown = null;
  };
  private readonly handleKeydown = (event: KeyboardEvent): void => this.onKeydown(event);
  private readonly handleFocusIn = (event: FocusEvent): void => this.onFocusIn(event);
  private readonly handleClick = (event: MouseEvent): void => {
    if (this.suppressClick) {
      this.suppressClick = false;
      this.pendingTouchDismissal = null;
      event.preventDefault();
      event.stopImmediatePropagation();
      this.syncDocumentListeners();
      return;
    }

    const pendingState = this.pendingTouchDismissal;
    this.pendingTouchDismissal = null;
    const state = this.top();
    if (
      !pendingState ||
      state !== pendingState ||
      state.disablePointerDismissal() ||
      this.hasBlockingOverlayAbove(state, 'outsidePress')
    ) {
      return;
    }

    const location = this.pointerLocation(state, event);
    if (location !== 'inside') {
      state.requestOpen(false, location === 'backdrop' ? 'backdrop-press' : 'outside-press', {
        nativeEvent: event,
      });
    }
  };
  private readonly handleCloseWatcherClose = (event: Event): void => {
    const state = this.top();
    if (!state || this.hasBlockingOverlayAbove(state, 'escapeKey')) {
      this.syncCloseWatcher();
      return;
    }
    state.requestOpen(false, 'escape-key', { nativeEvent: event });
    // A watcher is spent once it has fired, so re-arm it whenever the drawer stayed open - a
    // cancelled `beforeOpenChange` must not disable native Escape and Android back for good.
    this.syncCloseWatcher();
  };

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.detachDocumentListeners();
      this.destroyCloseWatcher();
      this.scrollStrategy?.disable();
      this.scrollStrategy = null;
      for (const state of this.states) {
        this.deregisterOverlay(state);
      }
      this.states.length = 0;
      this.pointerDown = null;
      this.pendingTouchDismissal = null;
      this.suppressClick = false;
    });
  }

  activate(state: DrawerState): void {
    if (!this.states.includes(state)) {
      this.states.push(state);
      this.registerOverlay(state);
    }
    this.syncScrollLock();
    this.syncCloseWatcher();
    this.syncDocumentListeners();
  }

  deactivate(state: DrawerState): void {
    const index = this.states.indexOf(state);
    if (index >= 0) {
      this.states.splice(index, 1);
    }
    this.deregisterOverlay(state);
    if (this.pointerDown?.state === state) {
      this.pointerDown = null;
    }
    if (this.pendingTouchDismissal === state) {
      this.pendingTouchDismissal = null;
    }
    this.syncScrollLock();
    this.syncCloseWatcher();
    this.syncDocumentListeners();
  }

  isTop(state: DrawerState): boolean {
    return this.top() === state;
  }

  suppressNextClick(): void {
    this.suppressClick = true;
    this.syncDocumentListeners();
  }

  /**
   * The most recently activated of `candidates`, or `undefined` when none of them is on the stack.
   * The stack is ordered by activation, so this is the drawer painted in front of the others.
   * @internal
   */
  frontmost(candidates: readonly DrawerState[]): DrawerState | undefined {
    for (let index = this.states.length - 1; index >= 0; index--) {
      if (candidates.includes(this.states[index])) {
        return this.states[index];
      }
    }
    return undefined;
  }

  private top(): DrawerState | undefined {
    return this.states.at(-1);
  }

  /**
   * Register the drawer in the shared overlay registry. The drawer keeps its own dismissal
   * handling, so the dismiss policy is disabled - the registration exists so that overlays
   * opened from within the drawer (menus, popovers, dialogs) stack above it correctly.
   */
  private registerOverlay(state: DrawerState): void {
    const id = createDrawerId('overlay');
    const trigger = state.activeTrigger();
    this.registryIds.set(state, id);
    this.registry.register({
      id,
      parentId: trigger ? this.registry.findContainingOverlay(trigger) : null,
      overlay: {
        hide: () => state.requestOpen(false, 'programmatic'),
        hideImmediate: () => state.requestOpen(false, 'programmatic'),
      },
      getElements: () =>
        [state.popup(), state.viewport(), state.backdrop()].filter(
          (element): element is HTMLElement => element !== null,
        ),
      triggerElement: trigger ?? this.document.body,
      dismissPolicy: { outsidePress: false, escapeKey: false },
    });
  }

  private deregisterOverlay(state: DrawerState): void {
    const id = this.registryIds.get(state);
    if (id) {
      this.registryIds.delete(state);
      this.registry.deregister(id);
    }
  }

  /**
   * Whether an overlay stacked above the drawer - a menu, popover or dialog opened from inside
   * it - handles this kind of dismissal itself, in which case the drawer must let it go first.
   * Overlays that opt out of a dismissal (tooltips, for example) never block the drawer.
   */
  private hasBlockingOverlayAbove(state: DrawerState, dismissal: keyof NgpDismissPolicy): boolean {
    const id = this.registryIds.get(state);
    if (!id) {
      return false;
    }
    const entries = this.registry.getEntries();
    const index = entries.findIndex(entry => entry.id === id);
    return (
      index >= 0 && entries.slice(index + 1).some(entry => entry.dismissPolicy[dismissal] !== false)
    );
  }

  private onPointerDown(event: PointerEvent): void {
    this.suppressClick = false;
    this.pendingTouchDismissal = null;
    this.syncDocumentListeners();
    const state = this.top();
    if (!state || event.button !== 0 || event.isPrimary === false) {
      this.pointerDown = null;
      return;
    }
    this.pointerDown = {
      clientX: event.clientX,
      clientY: event.clientY,
      state,
      pointerId: event.pointerId,
      location: this.pointerLocation(state, event),
      pointerType: event.pointerType,
    };
  }

  private onPointerMove(event: PointerEvent): void {
    const down = this.pointerDown;
    if (!down || down.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - down.clientX;
    const deltaY = event.clientY - down.clientY;
    if (
      deltaX * deltaX + deltaY * deltaY >
      POINTER_PRESS_MOVEMENT_TOLERANCE_PX * POINTER_PRESS_MOVEMENT_TOLERANCE_PX
    ) {
      this.pointerDown = null;
    }
  }

  private onPointerUp(event: PointerEvent): void {
    const down = this.pointerDown;
    this.pointerDown = null;
    const state = this.top();
    if (
      !state ||
      !down ||
      down.state !== state ||
      down.pointerId !== event.pointerId ||
      down.location === 'inside' ||
      down.location !== this.pointerLocation(state, event) ||
      state.disablePointerDismissal() ||
      this.hasBlockingOverlayAbove(state, 'outsidePress')
    ) {
      return;
    }

    if (down.pointerType === 'touch') {
      this.pendingTouchDismissal = state;
      return;
    }

    state.requestOpen(false, down.location === 'backdrop' ? 'backdrop-press' : 'outside-press', {
      nativeEvent: event,
    });
  }

  private onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || event.defaultPrevented) {
      return;
    }
    const state = this.top();
    if (!state || this.hasBlockingOverlayAbove(state, 'escapeKey')) {
      return;
    }
    state.requestOpen(false, 'escape-key', { nativeEvent: event });
  }

  private onFocusIn(event: FocusEvent): void {
    const state = this.top();
    if (
      state?.modal() === false &&
      !state.disablePointerDismissal() &&
      !state.containsEvent(event)
    ) {
      state.requestOpen(false, 'focus-out', { nativeEvent: event });
    }
  }

  private pointerLocation(state: DrawerState, event: Event): PointerLocation {
    const firstTarget = event.composedPath?.()[0] ?? event.target;
    if (firstTarget === state.backdrop()) {
      return 'backdrop';
    }
    return state.containsEvent(event) ? 'inside' : 'outside';
  }

  private syncScrollLock(): void {
    const shouldLock = this.states.some(state => state.modal() === true);
    if (shouldLock && !this.scrollStrategy) {
      this.scrollStrategy = new BlockScrollStrategy(this.viewportRuler, this.document);
      this.scrollStrategy.enable();
    } else if (!shouldLock && this.scrollStrategy) {
      this.scrollStrategy.disable();
      this.scrollStrategy = null;
    }
  }

  private syncCloseWatcher(): void {
    this.destroyCloseWatcher();
    const view = this.document.defaultView as
      | (Window & { CloseWatcher?: CloseWatcherConstructor })
      | null;
    if (!this.top() || !view?.CloseWatcher) {
      return;
    }
    this.closeWatcher = new view.CloseWatcher();
    this.closeWatcher.addEventListener('close', this.handleCloseWatcherClose);
  }

  private destroyCloseWatcher(): void {
    this.closeWatcher?.destroy();
    this.closeWatcher = null;
  }

  private syncDocumentListeners(): void {
    if (this.states.length > 0 || this.suppressClick) {
      this.attachDocumentListeners();
    } else {
      this.detachDocumentListeners();
    }
  }

  private attachDocumentListeners(): void {
    if (this.documentListenersAttached) {
      return;
    }
    this.documentListenersAttached = true;
    this.document.addEventListener('pointerdown', this.handlePointerDown, this.capture);
    this.document.addEventListener('pointermove', this.handlePointerMove, this.capture);
    this.document.addEventListener('pointerup', this.handlePointerUp, this.capture);
    this.document.addEventListener('pointercancel', this.handlePointerCancel, this.capture);
    this.document.addEventListener('keydown', this.handleKeydown, this.capture);
    this.document.addEventListener('focusin', this.handleFocusIn, this.capture);
    this.document.addEventListener('click', this.handleClick, this.capture);
  }

  private detachDocumentListeners(): void {
    if (!this.documentListenersAttached) {
      return;
    }
    this.documentListenersAttached = false;
    this.document.removeEventListener('pointerdown', this.handlePointerDown, this.capture);
    this.document.removeEventListener('pointermove', this.handlePointerMove, this.capture);
    this.document.removeEventListener('pointerup', this.handlePointerUp, this.capture);
    this.document.removeEventListener('pointercancel', this.handlePointerCancel, this.capture);
    this.document.removeEventListener('keydown', this.handleKeydown, this.capture);
    this.document.removeEventListener('focusin', this.handleFocusIn, this.capture);
    this.document.removeEventListener('click', this.handleClick, this.capture);
  }
}
