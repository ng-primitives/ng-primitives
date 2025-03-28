/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { BlockScrollStrategy, NoopScrollStrategy, ViewportRuler } from '@angular/cdk/overlay';
import { DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  inject,
  Injector,
  input,
  model,
  numberAttribute,
  OnDestroy,
  signal,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  autoUpdate,
  computePosition,
  flip,
  Middleware,
  offset,
  Placement,
  shift,
} from '@floating-ui/dom';
import { fromResizeEvent } from 'ng-primitives/resize';
import { NgpRovingFocusGroupToken } from 'ng-primitives/roving-focus';
import { injectDisposables, onBooleanChange } from 'ng-primitives/utils';
import { injectPopoverConfig } from '../config/popover-config';
import type { NgpPopover } from '../popover/popover';
import {
  NgpPopoverTriggerStateToken,
  popoverTriggerState,
  providePopoverTriggerState,
} from './popover-trigger-state';
import { providePopoverTrigger } from './popover-trigger-token';

@Directive({
  selector: '[ngpPopoverTrigger]',
  exportAs: 'ngpPopoverTrigger',
  providers: [providePopoverTrigger(NgpPopoverTrigger), providePopoverTriggerState()],
  host: {
    '[attr.data-open]': 'state.open() ? "" : null',
    '[attr.data-placement]': 'state.placement()',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
    '(click)': 'toggleOpenState($event)',
    '(keydown.escape)': 'handleEscapeKey()',
  },
})
export class NgpPopoverTrigger implements OnDestroy {
  /**
   * Access the trigger element
   */
  private readonly trigger = inject(ElementRef<HTMLElement>);

  /**
   * Access the view container ref.
   */
  private readonly viewContainerRef = inject(ViewContainerRef);

  /**
   * Access the document.
   */
  private readonly document = inject(DOCUMENT);

  /**
   * Access the viewport ruler.
   */
  private readonly viewportRuler = inject(ViewportRuler);

  /**
   * Access the injector.
   */
  private readonly injector = inject(Injector);

  /**
   * Access the global popover configuration.
   */
  private readonly config = injectPopoverConfig();

  /**
   * Access the disposable utilities
   */
  private readonly disposables = injectDisposables();

  /**
   * Access the focus monitor.
   */
  private readonly focusMonitor = inject(FocusMonitor);

  /**
   * Access the popover template ref.
   */
  readonly popover = input.required<TemplateRef<void>>({
    alias: 'ngpPopoverTrigger',
  });

  /**
   * The open state of the popover.
   * @default false
   */
  readonly open = model<boolean>(false, {
    alias: 'ngpPopoverTriggerOpen',
  });

  /**
   * Define if the trigger should be disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPopoverTriggerDisabled',
    transform: booleanAttribute,
  });

  /**
   * Define the placement of the popover relative to the trigger.
   * @default 'top'
   */
  readonly placement = input<Placement>(this.config.placement, {
    alias: 'ngpPopoverTriggerPlacement',
  });

  /**
   * Define the offset of the popover relative to the trigger.
   * @default 0
   */
  readonly offset = input<number, NumberInput>(this.config.offset, {
    alias: 'ngpPopoverTriggerOffset',
    transform: numberAttribute,
  });

  /**
   * Define the delay before the popover is displayed.
   * @default 0
   */
  readonly showDelay = input<number, NumberInput>(this.config.showDelay, {
    alias: 'ngpPopoverTriggerShowDelay',
    transform: numberAttribute,
  });

  /**
   * Define the delay before the popover is hidden.
   * @default 0
   */
  readonly hideDelay = input<number, NumberInput>(this.config.hideDelay, {
    alias: 'ngpPopoverTriggerHideDelay',
    transform: numberAttribute,
  });

  /**
   * Define whether the popover should flip when there is not enough space for the popover.
   * @default true
   */
  readonly flip = input<boolean, BooleanInput>(this.config.flip, {
    alias: 'ngpPopoverTriggerFlip',
    transform: booleanAttribute,
  });

  /**
   * Define the container in which the popover should be attached.
   * @default document.body
   */
  readonly container = input<HTMLElement | null>(this.config.container, {
    alias: 'ngpPopoverTriggerContainer',
  });

  /**
   * Define whether the popover should close when clicking outside of it.
   * @default true
   */
  readonly closeOnOutsideClick = input<boolean, BooleanInput>(this.config.closeOnOutsideClick, {
    alias: 'ngpPopoverTriggerCloseOnOutsideClick',
    transform: booleanAttribute,
  });

  /**
   * Define whether the popover should close when the escape key is pressed.
   * @default true
   */
  readonly closeOnEscape = input<boolean, BooleanInput>(this.config.closeOnEscape, {
    alias: 'ngpPopoverTriggerCloseOnEscape',
    transform: booleanAttribute,
  });

  /**
   * Defines how the popover behaves when the window is scrolled.
   * @default 'reposition'
   */
  readonly scrollBehavior = input<'reposition' | 'block'>(this.config.scrollBehavior, {
    alias: 'ngpPopoverTriggerScrollBehavior',
  });

  /**
   * The popover trigger state.
   */
  protected readonly state = popoverTriggerState<NgpPopoverTrigger>(this);

  /**
   * Store the popover view ref.
   */
  private viewRef: EmbeddedViewRef<void> | null = null;

  /**
   * Derive the popover middleware from the provided configuration.
   */
  private readonly middleware = computed(() => {
    const middleware: Middleware[] = [offset(this.offset()), shift()];

    if (this.flip()) {
      middleware.push(flip());
    }

    return middleware;
  });

  /**
   * Store the computed position of the popover.
   * @internal
   */
  readonly position = signal<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  /**
   * @internal
   * Store the trigger width.
   */
  readonly width = signal<number | null>(null);

  /**
   * The dispose function to stop computing the position of the popover.
   */
  private dispose?: () => void;

  /**
   * A document-wide click listener that checks if the click
   * occurred outside of the popover and trigger elements.
   */
  private documentClickListener?: (event: MouseEvent) => void;

  /**
   * Store the popover instance.
   * @internal
   */
  private popoverInstance: NgpPopover | null = null;

  /**
   * Get the scroll strategy based on the configuration.
   */
  private readonly scrollStrategy = computed(() =>
    this.state.scrollBehavior() === 'block'
      ? new BlockScrollStrategy(this.viewportRuler, this.document)
      : new NoopScrollStrategy(),
  );

  constructor() {
    // any time the open state changes then show or hide the popover
    onBooleanChange(this.open, this.show.bind(this, 'program'), this.hide.bind(this, 'program'));

    // update the width of the trigger when it resizes
    fromResizeEvent(this.trigger.nativeElement)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.width.set(this.trigger.nativeElement.offsetWidth));
  }

  ngOnDestroy(): void {
    this.destroyPopover();
  }

  protected toggleOpenState(event: MouseEvent): void {
    // if the trigger is disabled then do not toggle the popover
    if (this.state.disabled()) {
      return;
    }

    // determine the origin of the event, 0 is keyboard, 1 is mouse
    const origin: FocusOrigin = event.detail === 0 ? 'keyboard' : 'mouse';

    // if the popover is open then hide it
    if (this.state.open()) {
      this.hide(origin);
    } else {
      this.show(origin);
    }
  }

  /**
   * @internal
   * Show the popover.
   */
  show(origin: FocusOrigin): void {
    // if the trigger is disabled or the popover is already open then do not show the popover
    if (this.state.disabled() || this.state.open()) {
      return;
    }

    this.state.open.set(true);
    this.disposables.setTimeout(() => this.createPopover(origin), this.showDelay());

    // Add document click listener to detect outside clicks
    if (this.state.closeOnOutsideClick()) {
      this.documentClickListener = this.onDocumentClick.bind(this);
      this.document.addEventListener('click', this.documentClickListener, true);
    }
  }

  /**
   * @internal
   * Hide the popover.
   */
  hide(origin: FocusOrigin = 'program'): void {
    // if the trigger is disabled or the popover is already closed then do not hide the popover
    if (this.state.disabled() || !this.state.open()) {
      return;
    }

    this.state.open.set(false);

    this.disposables.setTimeout(() => {
      this.destroyPopover();
      // ensure the trigger is focused after closing the popover
      this.disposables.setTimeout(() => this.focusTrigger(origin), 0);
    }, this.hideDelay());

    // Remove the document click listener when the popover is hidden
    if (this.documentClickListener) {
      this.document.removeEventListener('click', this.documentClickListener, true);
    }
  }

  private onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Check if the click is outside the trigger or the popover
    const isOutside =
      !this.trigger.nativeElement.contains(target) &&
      !(this.viewRef?.rootNodes[0] as HTMLElement).contains(target);

    if (isOutside) {
      // Close the popover
      this.hide('mouse');
    }
  }

  private createPopover(origin: FocusOrigin): void {
    const portal = new TemplatePortal(
      this.state.popover(),
      this.viewContainerRef,
      undefined,
      this.injector,
    );

    const domOutlet = new DomPortalOutlet(
      this.container() ?? this.document.body,
      undefined,
      undefined,
      Injector.create({
        parent: this.injector,
        providers: [
          { provide: NgpPopoverTrigger, useValue: this },
          { provide: NgpPopoverTriggerStateToken, useValue: signal(this.state) },
          { provide: NgpRovingFocusGroupToken, useValue: null },
        ],
      }),
    );

    this.viewRef = domOutlet.attach(portal);
    this.viewRef.detectChanges();

    const outletElement = this.viewRef.rootNodes[0];

    this.dispose = autoUpdate(this.trigger.nativeElement, outletElement, async () => {
      const position = await computePosition(this.trigger.nativeElement, outletElement, {
        placement: this.state.placement(),
        middleware: this.middleware(),
      });

      this.position.set({ x: position.x, y: position.y });
      this.viewRef?.detectChanges();
    });

    // activate the scroll strategy
    this.scrollStrategy().enable();

    // set the initial focus to the first tabbable element in the popover
    this.popoverInstance?.setInitialFocus(origin);
  }

  private destroyPopover(): void {
    this.open.set(false);
    this.viewRef?.destroy();
    this.viewRef = null;
    this.dispose?.();

    // deactivate the scroll strategy
    this.scrollStrategy().disable();
  }

  /**
   * @internal
   * Handle escape key press to close the popover.
   */
  protected handleEscapeKey(): void {
    if (this.state.closeOnEscape()) {
      this.hide('keyboard');
    }
  }

  private focusTrigger(origin: FocusOrigin): void {
    this.focusMonitor.focusVia(this.trigger.nativeElement, origin);
  }

  /**
   * Set the popover instance.
   * @internal
   */
  setPopover(instance: NgpPopover): void {
    this.popoverInstance = instance;
  }
}

export type PopoverState = 'closed' | 'opening' | 'open' | 'closing';
