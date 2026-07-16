import { Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Injectable } from '@angular/core';
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
  private readonly overlay = inject(Overlay, { optional: true });
  private readonly states: DrawerState[] = [];
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
    if (!pendingState || state !== pendingState || state.disablePointerDismissal()) {
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
    this.top()?.requestOpen(false, 'escape-key', { nativeEvent: event });
  };

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.detachDocumentListeners();
      this.destroyCloseWatcher();
      this.scrollStrategy?.disable();
      this.scrollStrategy = null;
      this.states.length = 0;
      this.pointerDown = null;
      this.pendingTouchDismissal = null;
      this.suppressClick = false;
    });
  }

  activate(state: DrawerState): void {
    if (!this.states.includes(state)) {
      this.states.push(state);
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

  private top(): DrawerState | undefined {
    return this.states.at(-1);
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
      state.disablePointerDismissal()
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
    this.top()?.requestOpen(false, 'escape-key', { nativeEvent: event });
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
    if (shouldLock && !this.scrollStrategy && this.overlay) {
      this.scrollStrategy = this.overlay.scrollStrategies.block();
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
