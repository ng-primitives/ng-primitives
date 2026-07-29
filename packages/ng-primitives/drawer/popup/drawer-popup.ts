import { ConfigurableFocusTrapFactory, InteractivityChecker } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import {
  afterRenderEffect,
  computed,
  DestroyRef,
  Directive,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding } from 'ng-primitives/state';
import { NgpDrawerFocusTarget, NgpDrawerModal } from '../drawer.types';
import { createDrawerId } from '../internal/dom';
import { DrawerStackService } from '../internal/drawer-stack.service';
import { injectDrawerState, requireDrawerState } from '../internal/drawer-state';
import { DrawerFocusManager } from '../internal/focus-manager';
import { bindDrawerNestedVisuals } from '../internal/nested-visuals';
import { initializeDrawerVisualProperties } from '../internal/visual-properties';

interface PopupRenderState {
  readonly open: boolean;
  readonly modal: NgpDrawerModal;
  readonly backdrop: HTMLElement | null;
}

interface PopupRenderMeasurement {
  readonly renderState: PopupRenderState;
  readonly height: number | null;
}

@Directive({
  selector: '[ngpDrawerPopup]',
  standalone: true,
  host: {
    '[attr.id]': 'resolvedId()',
    tabindex: '-1',
  },
})
export class NgpDrawerPopup {
  readonly id = input<string | undefined>(undefined, { alias: 'id' });
  readonly role = input<'dialog' | 'alertdialog'>('dialog');
  readonly initialFocus = input<NgpDrawerFocusTarget>(undefined);
  readonly finalFocus = input<NgpDrawerFocusTarget>(undefined);

  private readonly generatedId = createDrawerId('popup');
  readonly resolvedId = computed(() => this.id() || this.generatedId);
  private readonly elementRef = injectElementRef<HTMLElement>();
  private readonly document = inject(DOCUMENT);
  private readonly focusTrapFactory = inject(ConfigurableFocusTrapFactory);
  private readonly interactivityChecker = inject(InteractivityChecker);
  private readonly stack = inject(DrawerStackService);
  private readonly destroyRef = inject(DestroyRef);
  private resizeObserver: ResizeObserver | null = null;
  private readonly focusManager: DrawerFocusManager;
  private readonly focusRenderState = computed<PopupRenderState>(() => ({
    open: this.state.open(),
    modal: this.state.modal(),
    backdrop: this.state.backdrop(),
  }));
  private readonly focusMeasurement = signal<PopupRenderMeasurement | null>(null);

  private readonly state = requireDrawerState(
    injectDrawerState({ optional: true }),
    'ngpDrawerPopup',
  );
  constructor() {
    initializeDrawerVisualProperties(this.elementRef.nativeElement);
    const releasePart = this.state.claimPart('popup');
    const unregister = this.state.setPartElement('popup', this.elementRef.nativeElement);
    attrBinding(this.elementRef, 'role', () => this.role());
    attrBinding(this.elementRef, 'aria-modal', () => (this.state.modal() === true ? 'true' : null));
    attrBinding(this.elementRef, 'aria-labelledby', () => this.state.titleIds().join(' ') || null);
    attrBinding(
      this.elementRef,
      'aria-describedby',
      () => this.state.descriptionIds().join(' ') || null,
    );
    dataBinding(this.elementRef, 'data-open', () => this.state.open());
    dataBinding(this.elementRef, 'data-closed', () => !this.state.open());
    if (this.state.startingStyle()) {
      this.elementRef.nativeElement.setAttribute('data-starting-style', '');
    }
    dataBinding(this.elementRef, 'data-starting-style', () => this.state.startingStyle());
    dataBinding(this.elementRef, 'data-ending-style', () => this.state.endingStyle());
    dataBinding(this.elementRef, 'data-expanded', () => this.state.expanded());
    dataBinding(this.elementRef, 'data-nested-drawer-open', () => this.state.nestedOpen());
    dataBinding(this.elementRef, 'data-nested-drawer-swiping', () => this.state.nestedSwiping());
    dataBinding(this.elementRef, 'data-swipe-dismiss', () => this.state.swipeDismiss() !== null);
    dataBinding(this.elementRef, 'data-swipe-direction', () => this.state.swipeDirection());
    dataBinding(this.elementRef, 'data-swiping', () => this.state.swiping());
    bindDrawerNestedVisuals(this.elementRef, this.state, this.destroyRef);

    this.focusManager = new DrawerFocusManager(
      this.state,
      this.elementRef.nativeElement,
      this.initialFocus,
      this.finalFocus,
      this.document,
      this.focusTrapFactory,
      this.interactivityChecker,
      this.stack,
    );

    afterRenderEffect({
      earlyRead: () => {
        const renderState = this.focusRenderState();
        const measurement = untracked<PopupRenderMeasurement>(() => ({
          renderState,
          height: renderState.open ? this.measurePopupHeight() : null,
        }));
        this.focusMeasurement.set(measurement);
      },
    });
    afterRenderEffect({
      mixedReadWrite: () => {
        const measurement = this.focusMeasurement();
        if (!measurement) {
          return;
        }
        untracked(() => this.syncFocusLifecycle(measurement));
      },
    });
    this.observeSize();

    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
      this.focusManager.destroy();
      unregister();
      releasePart();
    });
  }

  private observeSize(): void {
    const ResizeObserverConstructor = this.document.defaultView?.ResizeObserver;
    if (!ResizeObserverConstructor) {
      return;
    }
    this.resizeObserver = new ResizeObserverConstructor(() => {
      this.state.popupHeight.set(this.measurePopupHeight());
    });
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  private measurePopupHeight(): number {
    const currentHeight = this.state.popupHeight();
    if (this.state.nestedPresent() && currentHeight > 0) {
      return currentHeight;
    }
    return this.elementRef.nativeElement.getBoundingClientRect().height;
  }

  private syncFocusLifecycle(measurement: PopupRenderMeasurement): void {
    if (measurement.renderState.open) {
      this.state.popupHeight.set(measurement.height ?? 0);
      this.focusManager.activate();
    } else {
      this.focusManager.deactivate();
    }
  }
}
