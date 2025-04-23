import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { ComponentPortal, DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
  ComponentRef,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  Injector,
  OnDestroy,
  TemplateRef,
  Type,
  ViewContainerRef,
  booleanAttribute,
  computed,
  inject,
  input,
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
import { injectExitAnimationManager, provideExitAnimationManager } from 'ng-primitives/internal';
import { fromResizeEvent } from 'ng-primitives/resize';
import { injectDisposables } from 'ng-primitives/utils';
import { injectTooltipConfig } from '../config/tooltip-config';
import { provideTooltipContext } from '../tooltip/tooltip-token';
import { provideTooltipTriggerState, tooltipTriggerState } from './tooltip-trigger-state';

/**
 * Apply the `ngpTooltipTrigger` directive to an element that triggers the tooltip to show.
 */
@Directive({
  selector: '[ngpTooltipTrigger]',
  exportAs: 'ngpTooltipTrigger',
  providers: [provideTooltipTriggerState(), provideExitAnimationManager()],
  host: {
    '[attr.data-open]': 'viewRef !== null ? "" : null',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focus)': 'show()',
    '(blur)': 'hide()',
  },
})
export class NgpTooltipTrigger<T = null> implements OnDestroy {
  /**
   * Access the exit animation manager.
   */
  private readonly exitAnimationManager = injectExitAnimationManager();

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
  readonly tooltip = input<NgpTooltipContent<T> | null>(null, {
    alias: 'ngpTooltipTrigger',
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
   * Provide context to the tooltip.
   * @default null
   */
  readonly context = input<T | null>(null, {
    alias: 'ngpTooltipTriggerContext',
  });

  /**
   * Store the tooltip view ref.
   */
  protected viewRef: ComponentRef<unknown> | EmbeddedViewRef<T> | null = null;

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
   * @internal
   * The timeout to open the tooltip.
   */
  private openTimeout?: () => void;

  /**
   * @internal
   * The timeout to close the tooltip.
   */
  private closeTimeout?: () => void;

  /**
   * Store the state of the tooltip.
   * @internal
   */
  readonly state = tooltipTriggerState<NgpTooltipTrigger<T>>(this);

  constructor() {
    // update the width of the trigger when it resizes
    fromResizeEvent(this.trigger.nativeElement)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.width.set(this.trigger.nativeElement.offsetWidth));
  }

  ngOnDestroy(): void {
    this.destroyTooltip();
  }

  /**
   * Show the tooltip.
   */
  show(): void {
    // if closing is in progress then clear the timeout to stop the popover from closing
    if (this.closeTimeout) {
      this.closeTimeout();
      this.closeTimeout = undefined;
    }

    // if the trigger is disabled or the tooltip is already open then do not show the tooltip
    if (this.state.disabled() || this.openTimeout) {
      return;
    }

    // if the tooltip exists in the DOM then do not create it again
    if (this.viewRef) {
      return;
    }

    this.openTimeout = this.disposables.setTimeout(
      () => this.createTooltip(),
      this.state.showDelay(),
    );
  }

  /**
   * Hide the tooltip.
   */
  hide(): void {
    // if closing is in progress then clear the timeout to stop the popover from opening
    if (this.openTimeout) {
      this.openTimeout();
      this.openTimeout = undefined;
    }

    // if the trigger is disabled or the tooltip is already closed then do not hide the tooltip
    if (this.state.disabled() || this.closeTimeout) {
      return;
    }

    this.closeTimeout = this.disposables.setTimeout(
      () => this.destroyTooltip(),
      this.state.hideDelay(),
    );
  }

  private createTooltip(): void {
    this.openTimeout = undefined;
    const tooltip = this.state.tooltip();

    let portal: TemplatePortal | ComponentPortal<unknown>;

    // Create a new inject with the tooltip context
    const injector = Injector.create({
      parent: this.injector,
      providers: [provideTooltipContext(this.state.context())],
    });

    if (tooltip instanceof TemplateRef) {
      portal = new TemplatePortal<NgpTooltipTemplateContext<T>>(
        tooltip,
        this.viewContainerRef,
        { $implicit: this.state.context() } as NgpTooltipTemplateContext<T>,
        injector,
      );
    } else if (tooltip instanceof Type) {
      portal = new ComponentPortal(tooltip, this.viewContainerRef, injector);
    } else {
      throw new Error('Tooltip must be either a TemplateRef or a ComponentType');
    }

    const domOutlet = new DomPortalOutlet(
      this.state.container() ?? this.document.body,
      undefined,
      undefined,
      injector,
    );

    this.viewRef = domOutlet.attach(portal);

    let outletElement: HTMLElement | null = null;

    if (this.viewRef instanceof ComponentRef) {
      this.viewRef.changeDetectorRef.detectChanges();
      outletElement = this.viewRef.location.nativeElement;
    } else if (this.viewRef) {
      this.viewRef.detectChanges();
      outletElement = this.viewRef.rootNodes[0] as HTMLElement;
    }

    if (!outletElement) {
      throw new Error('Outlet element is not available.');
    }

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

  private async destroyTooltip(): Promise<void> {
    this.closeTimeout = undefined;
    await this.exitAnimationManager.exit();

    this.viewRef?.destroy();
    this.viewRef = null;
    this.dispose?.();
  }
}

type NgpTooltipTemplateContext<T> = {
  $implicit: T;
};
type NgpTooltipContent<T> = TemplateRef<NgpTooltipTemplateContext<T>> | Type<unknown>;
