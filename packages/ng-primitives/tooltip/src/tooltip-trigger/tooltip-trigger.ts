import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  inject,
  Injector,
  input,
  numberAttribute,
  OnDestroy,
  signal,
  TemplateRef,
  Type,
} from '@angular/core';
import { Placement } from '@floating-ui/dom';
import { provideExitAnimationManager } from 'ng-primitives/internal';
import { createOverlay, NgpOverlay, NgpOverlayConfig } from 'ng-primitives/portal';
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
    '[attr.data-open]': 'open() ? "" : null',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focus)': 'show()',
    '(blur)': 'hide()',
  },
})
export class NgpTooltipTrigger<T = null> implements OnDestroy {
  /**
   * Access the trigger element
   */
  private readonly trigger = inject(ElementRef<HTMLElement>);

  /**
   * Access the injector.
   */
  private readonly injector = inject(Injector);

  /**
   * Access the global tooltip configuration.
   */
  private readonly config = injectTooltipConfig();

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
   * The overlay that manages the tooltip
   * @internal
   */
  readonly overlay = signal<NgpOverlay<T> | null>(null);

  /**
   * The open state of the tooltip.
   * @internal
   */
  readonly open = computed(() => this.overlay()?.isOpen() ?? false);

  /**
   * Store the state of the tooltip.
   * @internal
   */
  readonly state = tooltipTriggerState<NgpTooltipTrigger<T>>(this);

  ngOnDestroy(): void {
    this.overlay()?.destroy();
  }

  /**
   * Show the tooltip.
   */
  show(): void {
    // If the trigger is disabled, do not show the tooltip
    if (this.state.disabled() || this.open()) {
      return;
    }

    // Create the overlay if it doesn't exist yet
    if (!this.overlay()) {
      this.createOverlay();
    }

    this.overlay()?.show(this.state.showDelay());
  }

  /**
   * Hide the tooltip.
   */
  hide(): void {
    // If the trigger is disabled, do nothing
    if (this.state.disabled()) {
      return;
    }

    this.overlay()?.hide(this.state.hideDelay());
  }

  /**
   * Create the overlay that will contain the tooltip
   */
  private createOverlay(): void {
    const tooltip = this.state.tooltip();

    if (!tooltip) {
      throw new Error('Tooltip must be either a TemplateRef or a ComponentType');
    }

    // Create config for the overlay
    const config: NgpOverlayConfig<T> = {
      content: tooltip,
      triggerElement: this.trigger.nativeElement,
      injector: this.injector,
      context: this.state.context(),
      container: this.state.container(),
      placement: this.state.placement(),
      offset: this.state.offset(),
      flip: this.state.flip(),
      showDelay: this.state.showDelay(),
      hideDelay: this.state.hideDelay(),
      providers: [provideTooltipContext(this.state.context())],
    };

    // Create the overlay instance
    this.overlay.set(createOverlay(config));
  }
}

type NgpTooltipTemplateContext<T> = {
  $implicit: T;
};
type NgpTooltipContent<T> = TemplateRef<NgpTooltipTemplateContext<T>> | Type<unknown>;
