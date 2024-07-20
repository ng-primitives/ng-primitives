/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
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
import {
  Middleware,
  Placement,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
} from '@floating-ui/dom';
import { injectDisposables, onBooleanChange } from 'ng-primitives/utils';
import { injectTooltipConfig } from '../config/tooltip.config';
import { NgpTooltipTriggerToken, provideTooltipTrigger } from './tooltip-trigger.token';

@Directive({
  standalone: true,
  selector: '[ngpTooltipTrigger]',
  exportAs: 'ngpTooltipTrigger',
  providers: [{ provide: NgpTooltipTriggerToken, useExisting: NgpTooltipTrigger }],
  host: {
    '[attr.data-state]': 'state()',
    '[attr.data-disabled]': 'disabled()',
    '(mouseenter)': 'open.set(true)',
    '(mouseleave)': 'open.set(false)',
    '(focus)': 'open.set(true)',
    '(blur)': 'open.set(false)',
  },
})
export class NgpTooltipTrigger implements OnDestroy {
  /**
   * Access the trigger element
   */
  private readonly trigger = inject(ElementRef<HTMLElement>);

  /**
   * Access the view container ref.
   */
  private readonly viewContainerRef = inject(ViewContainerRef);

  /**
   * Access the injector.
   */
  private readonly injector = inject(Injector);

  /**
   * Access the global tooltip configuration.
   */
  private readonly config = injectTooltipConfig();

  /**
   * Access the disposable utilities
   */
  private readonly disposables = injectDisposables();

  /**
   * Access the tooltip template ref.
   */
  readonly tooltip = input.required<TemplateRef<void>>({
    alias: 'ngpTooltipTrigger',
  });

  /**
   * The open state of the tooltip.
   * @default false
   */
  readonly open = model<boolean>(false, {
    alias: 'ngpTooltipTriggerOpen',
  });

  /**
   * Define if the trigger should be disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpTooltipTriggerDisabled',
    transform: booleanAttribute,
  });

  /**
   * Define the placement of the tooltip relative to the trigger.
   * @default 'top'
   */
  readonly placement = input<Placement>(this.config.placement, {
    alias: 'ngpTooltipTriggerPlacement',
  });

  /**
   * Define the offset of the tooltip relative to the trigger.
   * @default 0
   */
  readonly offset = input<number, NumberInput>(this.config.offset, {
    alias: 'ngpTooltipTriggerOffset',
    transform: numberAttribute,
  });

  /**
   * Define the delay before the tooltip is displayed.
   * @default 0
   */
  readonly showDelay = input<number, NumberInput>(this.config.showDelay, {
    alias: 'ngpTooltipTriggerShowDelay',
    transform: numberAttribute,
  });

  /**
   * Define the delay before the tooltip is hidden.
   * @default 0
   */
  readonly hideDelay = input<number, NumberInput>(this.config.hideDelay, {
    alias: 'ngpTooltipTriggerHideDelay',
    transform: numberAttribute,
  });

  /**
   * Define whether the tooltip should flip when there is not enough space for the tooltip.
   * @default true
   */
  readonly flip = input<boolean, BooleanInput>(this.config.flip, {
    alias: 'ngpTooltipTriggerFlip',
    transform: booleanAttribute,
  });

  /**
   * Define the container in which the tooltip should be attached.
   * @default document.body
   */
  readonly container = input<HTMLElement>(this.config.container, {
    alias: 'ngpTooltipTriggerContainer',
  });

  /**
   * Store the tooltip view ref.
   */
  private viewRef: EmbeddedViewRef<void> | null = null;

  /**
   * Derive the tooltip middleware from the provided configuration.
   */
  private readonly middleware = computed(() => {
    const middleware: Middleware[] = [offset(this.offset()), shift()];

    if (this.flip()) {
      middleware.push(flip());
    }

    return middleware;
  });

  /**
   * Store the computed position of the tooltip.
   * @internal
   */
  readonly position = signal<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  /**
   * Store the state of the tooltip.
   * @internal
   */
  readonly state = signal<TooltipState>('closed');

  /**
   * The dispose function to stop computing the position of the tooltip.
   */
  private dispose?: () => void;

  constructor() {
    // any time the open state changes then show or hide the tooltip
    onBooleanChange(this.open, this.show.bind(this), this.hide.bind(this));
  }

  ngOnDestroy(): void {
    this.destroyTooltip();
  }

  private show(): void {
    // if the trigger is disabled or the tooltip is already open then do not show the tooltip
    if (this.disabled() || this.state() === 'open' || this.state() === 'opening') {
      return;
    }

    this.state.set('opening');
    this.disposables.setTimeout(() => this.createTooltip(), this.showDelay());
  }

  private hide(): void {
    // if the trigger is disabled or the tooltip is already closed then do not hide the tooltip
    if (this.disabled() || this.state() === 'closed' || this.state() === 'closing') {
      return;
    }

    this.state.set('closing');
    this.disposables.setTimeout(() => this.destroyTooltip(), this.hideDelay());
  }

  private createTooltip(): void {
    const portal = new TemplatePortal(
      this.tooltip(),
      this.viewContainerRef,
      undefined,
      this.injector,
    );

    const domOutlet = new DomPortalOutlet(
      this.container(),
      undefined,
      undefined,
      Injector.create({
        parent: this.injector,
        providers: [provideTooltipTrigger(this)],
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
  }

  private destroyTooltip(): void {
    this.viewRef?.destroy();
    this.viewRef = null;
    this.dispose?.();
    this.state.set('closed');
  }
}

export type TooltipState = 'closed' | 'opening' | 'open' | 'closing';
