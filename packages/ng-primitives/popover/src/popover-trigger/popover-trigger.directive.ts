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
  Directive,
  ElementRef,
  EmbeddedViewRef,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  numberAttribute,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Middleware,
  Placement,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
} from '@floating-ui/dom';
import { fromResizeEvent } from 'ng-primitives/resize';
import { injectDisposables, onBooleanChange } from 'ng-primitives/utils';
import { injectPopoverConfig } from '../config/popover.config';
import { NgpPopoverTriggerToken, providePopoverTrigger } from './popover-trigger.token';

@Directive({
  standalone: true,
  selector: '[ngpPopoverTrigger]',
  exportAs: 'ngpPopoverTrigger',
  providers: [{ provide: NgpPopoverTriggerToken, useExisting: NgpPopoverTrigger }],
  host: {
    '[attr.data-state]': 'state()',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '(click)': 'toggleOpenState()',
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
   * Store the state of the popover.
   * @internal
   */
  readonly state = signal<PopoverState>('closed');

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
   * Get the scroll strategy based on the configuration.
   */
  private readonly scrollStrategy = computed(() =>
    this.scrollBehavior() === 'block'
      ? new BlockScrollStrategy(this.viewportRuler, this.document)
      : new NoopScrollStrategy(),
  );

  constructor() {
    // any time the open state changes then show or hide the popover
    onBooleanChange(this.open, this.show.bind(this), this.hide.bind(this));

    // update the width of the trigger when it resizes
    fromResizeEvent(this.trigger.nativeElement)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.width.set(this.trigger.nativeElement.offsetWidth));
  }

  ngOnDestroy(): void {
    this.destroyPopover();
  }

  toggleOpenState(): void {
    this.open.update(open => !open);
  }

  private show(): void {
    // if the trigger is disabled or the popover is already open then do not show the popover
    if (this.disabled() || this.state() === 'open' || this.state() === 'opening') {
      return;
    }

    this.state.set('opening');
    this.disposables.setTimeout(() => this.createPopover(), this.showDelay());

    // Add document click listener to detect outside clicks
    if (this.closeOnOutsideClick()) {
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
    if (this.disabled() || this.state() === 'closed' || this.state() === 'closing') {
      return;
    }

    this.state.set('closing');
    this.disposables.setTimeout(() => this.destroyPopover(), this.hideDelay());

    // Remove the document click listener when the popover is hidden
    if (this.documentClickListener) {
      this.document.removeEventListener('click', this.documentClickListener, true);
    }

    // ensure the trigger is focused after closing the popover
    // we need this delay but I can't quite figure out why?
    setTimeout(() => this.focusTrigger(origin), 1);
  }

  private onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Check if the click is outside the trigger or the popover
    const isOutside =
      !this.trigger.nativeElement.contains(target) &&
      !(this.viewRef?.rootNodes[0] as HTMLElement).contains(target);

    if (isOutside) {
      // Close the popover
      this.open.set(false);
    }
  }

  private createPopover(): void {
    const portal = new TemplatePortal(
      this.popover(),
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
        providers: [providePopoverTrigger(this)],
      }),
    );

    this.viewRef = domOutlet.attach(portal);
    this.viewRef.detectChanges();

    const outletElement = this.viewRef.rootNodes[0];

    this.dispose = autoUpdate(this.trigger.nativeElement, outletElement, async () => {
      const position = await computePosition(this.trigger.nativeElement, outletElement, {
        placement: this.placement(),
        middleware: this.middleware(),
      });

      this.position.set({ x: position.x, y: position.y });
    });

    this.state.set('open');

    // activate the scroll strategy
    this.scrollStrategy().enable();
  }

  private destroyPopover(): void {
    this.open.set(false);
    this.viewRef?.destroy();
    this.viewRef = null;
    this.dispose?.();
    this.state.set('closed');

    // deactivate the scroll strategy
    this.scrollStrategy().disable();
  }

  /**
   * @internal
   * Handle escape key press to close the popover.
   */
  handleEscapeKey(): void {
    if (this.closeOnEscape()) {
      this.hide('keyboard');
    }
  }

  private focusTrigger(origin: FocusOrigin): void {
    this.focusMonitor.focusVia(this.trigger.nativeElement, origin);
  }
}

export type PopoverState = 'closed' | 'opening' | 'open' | 'closing';
