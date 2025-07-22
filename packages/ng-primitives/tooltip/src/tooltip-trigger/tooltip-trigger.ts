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
  Signal,
  signal,
  ViewContainerRef,
} from '@angular/core';
import { Placement } from '@floating-ui/dom';
import { setupOverflowListener } from 'ng-primitives/internal';
import {
  createOverlay,
  NgpOverlay,
  NgpOverlayConfig,
  NgpOverlayContent,
} from 'ng-primitives/portal';
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
    '[attr.data-open]': 'open() ? "" : null',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
    '[attr.aria-describedby]': 'overlay()?.ariaDescribedBy()',
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
   * Access the view container reference.
   */
  private readonly viewContainerRef = inject(ViewContainerRef);

  /**
   * Access the global tooltip configuration.
   */
  private readonly config = injectTooltipConfig();

  /**
   * Access the tooltip template ref.
   */
  readonly tooltip = input<NgpOverlayContent<T>>(undefined, {
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
   * Define whether the tooltip should only show when the trigger element overflows.
   * @default false
   */
  readonly showOnOverflow = input<boolean, BooleanInput>(this.config.showOnOverflow, {
    alias: 'ngpTooltipTriggerShowOnOverflow',
    transform: booleanAttribute,
  });

  /**
   * Provide context to the tooltip. This can be used to pass data to the tooltip content.
   */
  readonly context = input<T>(undefined, {
    alias: 'ngpTooltipTriggerContext',
  });

  /**
   * The overlay that manages the tooltip
   * @internal
   */
  readonly overlay = signal<NgpOverlay<T> | null>(null);

  /**
   * The unique id of the tooltip.
   */
  readonly tooltipId = signal<string | undefined>(undefined);

  /**
   * The open state of the tooltip.
   * @internal
   */
  readonly open = computed(() => this.overlay()?.isOpen() ?? false);

  /**
   * Determine if the trigger element has overflow.
   */
  private readonly hasOverflow: Signal<boolean>;

  /**
   * Store the state of the tooltip.
   * @internal
   */
  readonly state = tooltipTriggerState<NgpTooltipTrigger<T>>(this);

  constructor() {
    this.hasOverflow = setupOverflowListener(this.trigger.nativeElement, {
      disabled: computed(() => !this.state.showOnOverflow()),
    });
  }

  ngOnDestroy(): void {
    this.overlay()?.destroy();
  }

  /**
   * Show the tooltip.
   */
  show(): void {
    // If the trigger is disabled, do not show the tooltip
    if (this.state.disabled() || this.open()) {
      // we mark this as show again to stop it dismissing
      this.overlay()?.cancelPendingClose();
      return;
    }

    // if we should only show when there is overflow, check if the trigger has overflow
    if (this.state.showOnOverflow() && !this.hasOverflow()) {
      // If the trigger does not have overflow, do not show the tooltip
      return;
    }

    // Create the overlay if it doesn't exist yet
    if (!this.overlay()) {
      this.createOverlay();
    }

    this.overlay()?.show();
  }

  /**
   * Hide the tooltip.
   */
  hide(): void {
    // If the trigger is disabled, do nothing
    if (this.state.disabled()) {
      return;
    }

    this.overlay()?.hide();
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
      context: this.state.context,
      container: this.state.container(),
      placement: this.state.placement(),
      offset: this.state.offset(),
      flip: this.state.flip(),
      showDelay: this.state.showDelay(),
      hideDelay: this.state.hideDelay(),
      closeOnEscape: true,
      closeOnOutsideClick: true,
      viewContainerRef: this.viewContainerRef,
    };

    // Create the overlay instance
    this.overlay.set(createOverlay(config));
  }

  /**
   * Set the tooltip id.
   */
  setTooltipId(id: string): void {
    this.tooltipId.set(id);
  }
}
