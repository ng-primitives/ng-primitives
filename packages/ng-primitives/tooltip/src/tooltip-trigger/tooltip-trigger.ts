import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
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
  numberAttribute,
  output,
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
import { injectTooltipConfig } from '../config/tooltip-config';
import { provideTooltipTriggerState, tooltipTriggerState } from './tooltip-trigger-state';

/**
 * Apply the `ngpTooltipTrigger` directive to an element that triggers the tooltip to show.
 */
@Directive({
  selector: '[ngpTooltipTrigger]',
  exportAs: 'ngpTooltipTrigger',
  providers: [provideTooltipTriggerState()],
  host: {
    '[attr.data-open]': 'state.open() ? "" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focus)': 'show()',
    '(blur)': 'hide()',
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
   * Access the document.
   */
  private readonly document = inject(DOCUMENT);

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
  readonly open = input<boolean, BooleanInput>(false, {
    alias: 'ngpTooltipTriggerOpen',
    transform: booleanAttribute,
  });

  /**
   * Emit an event when the tooltip is opened or closed.
   */
  readonly openChange = output<boolean>({
    alias: 'ngpTooltipTriggerOpenChange',
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
  readonly container = input<HTMLElement | null>(this.config.container, {
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
    const middleware: Middleware[] = [offset(this.state.offset()), shift()];

    if (this.state.flip()) {
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
   * The dispose function to stop computing the position of the tooltip.
   */
  private dispose?: () => void;

  /**
   * @internal
   * Store the trigger width.
   */
  readonly width = signal<number | null>(null);

  /**
   * Store the state of the tooltip.
   * @internal
   */
  readonly state = tooltipTriggerState<NgpTooltipTrigger>(this);

  constructor() {
    // any time the open state changes then show or hide the tooltip
    onBooleanChange(this.state.open, this.show.bind(this), this.hide.bind(this));

    // update the width of the trigger when it resizes
    fromResizeEvent(this.trigger.nativeElement)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.width.set(this.trigger.nativeElement.offsetWidth));
  }

  ngOnDestroy(): void {
    this.destroyTooltip();
  }

  private show(): void {
    // if the trigger is disabled or the tooltip is already open then do not show the tooltip
    if (this.state.disabled() || this.state.open()) {
      return;
    }

    this.state.open.set(true);
    this.openChange.emit(true);
    this.disposables.setTimeout(() => this.createTooltip(), this.state.showDelay());
  }

  private hide(): void {
    // if the trigger is disabled or the tooltip is already closed then do not hide the tooltip
    if (this.state.disabled() || !this.state.open()) {
      return;
    }

    this.state.open.set(false);
    this.openChange.emit(false);
    this.disposables.setTimeout(() => this.destroyTooltip(), this.state.hideDelay());
  }

  private createTooltip(): void {
    const portal = new TemplatePortal(
      this.tooltip(),
      this.viewContainerRef,
      undefined,
      this.injector,
    );

    const domOutlet = new DomPortalOutlet(
      this.state.container() ?? this.document.body,
      undefined,
      undefined,
      Injector.create({
        parent: this.injector,
        providers: [],
      }),
    );

    this.viewRef = domOutlet.attach(portal);
    this.viewRef.detectChanges();

    const outletElement = this.viewRef.rootNodes[0];

    // we want to determine the strategy to use. If the tooltip has position: fixed then we want to use
    // fixed positioning. Otherwise we want to use absolute positioning.
    const strategy = getComputedStyle(outletElement).position === 'fixed' ? 'fixed' : 'absolute';

    this.dispose = autoUpdate(this.trigger.nativeElement, outletElement, async () => {
      const position = await computePosition(this.trigger.nativeElement, outletElement, {
        placement: this.state.placement(),
        middleware: this.middleware(),
        strategy,
      });

      this.position.set({ x: position.x, y: position.y });
    });
  }

  private destroyTooltip(): void {
    this.state.open.set(false);
    this.openChange.emit(false);
    this.viewRef?.destroy();
    this.viewRef = null;
    this.dispose?.();
  }
}
