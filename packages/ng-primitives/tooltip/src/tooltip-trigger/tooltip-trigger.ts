import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  Injector,
  input,
  numberAttribute,
  OnDestroy,
  AfterViewInit,
  signal,
  ViewContainerRef,
} from '@angular/core';
import { Placement } from '@floating-ui/dom';
import {
  createOverlay,
  NgpOverlay,
  NgpOverlayConfig,
  NgpOverlayContent,
} from 'ng-primitives/portal';
import { fromResizeEvent } from 'ng-primitives/resize';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { injectTooltipConfig } from '../config/tooltip-config';
import { provideTooltipTriggerState, tooltipTriggerState } from './tooltip-trigger-state';

/**
 * Checks if an element is overflowing its content area.
 * This is useful for showing tooltips only when text is truncated.
 * @param element The element to check for overflow
 * @returns True if the element is overflowing, false otherwise
 */
function isElementOverflowing(element: HTMLElement): boolean {
  const hostOffsetWidth = element.offsetWidth;

  return (
    hostOffsetWidth > element.parentElement!.offsetWidth || hostOffsetWidth < element.scrollWidth
  );
}

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
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
  },
})
export class NgpTooltipTrigger<T = null> implements AfterViewInit, OnDestroy {
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
   * Access the destroy ref.
   */
  private readonly destroyRef = inject(DestroyRef);

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
   * The open state of the tooltip.
   * @internal
   */
  readonly open = computed(() => this.overlay()?.isOpen() ?? false);

  /**
   * Track whether the user is currently hovering over the trigger
   * @internal
   */
  private readonly isHovering = signal<boolean>(false);

  /**
   * Track whether the user is currently focusing the trigger
   * @internal
   */
  private readonly isFocusing = signal<boolean>(false);

  /**
   * Track the current overflow state
   * @internal
   */
  private readonly hasOverflow = signal<boolean>(false);

  /**
   * Store the state of the tooltip.
   * @internal
   */
  readonly state = tooltipTriggerState<NgpTooltipTrigger<T>>(this);

  ngAfterViewInit(): void {
    this.setupResizeMonitoring();
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
      return;
    }

    // If showOnOverflow is enabled, check overflow state
    if (this.state.showOnOverflow()) {
      // Check current overflow state and show if overflowing
      if (isElementOverflowing(this.trigger.nativeElement)) {
        this.forceShow();
      }
      return;
    }

    // Normal tooltip behavior - always show
    this.forceShow();
  }

  /**
   * Hide the tooltip.
   */
  hide(): void {
    // If the trigger is disabled, do nothing
    if (this.state.disabled()) {
      return;
    }

    // If showOnOverflow is enabled, let updateOverflowState handle the logic
    if (this.state.showOnOverflow()) {
      this.updateOverflowState();
      return;
    }

    // Normal tooltip behavior - always hide
    this.forceHide();
  }

  /**
   * Handle mouse enter event
   */
  onMouseEnter(): void {
    this.isHovering.set(true);
    this.show();
  }

  /**
   * Handle mouse leave event
   */
  onMouseLeave(): void {
    this.isHovering.set(false);
    this.hide();
  }

  /**
   * Handle focus event
   */
  onFocus(): void {
    this.isFocusing.set(true);
    this.show();
  }

  /**
   * Handle blur event
   */
  onBlur(): void {
    this.isFocusing.set(false);
    this.hide();
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
   * Setup resize monitoring to detect dimension changes
   * @internal
   */
  private setupResizeMonitoring(): void {
    // Only setup resize monitoring if showOnOverflow is enabled
    if (!this.state.showOnOverflow()) {
      return;
    }

    // Initial overflow check
    this.updateOverflowState();

    // Monitor resize events using the existing utility
    fromResizeEvent(this.trigger.nativeElement)
      .pipe(safeTakeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateOverflowState();
      });
  }

  /**
   * Update the overflow state and tooltip visibility
   * @internal
   */
  private updateOverflowState(): void {
    const currentOverflow = isElementOverflowing(this.trigger.nativeElement);
    this.hasOverflow.set(currentOverflow);

    // If showOnOverflow is enabled, update tooltip visibility based on overflow state
    if (this.state.showOnOverflow()) {
      const shouldShow = (this.isHovering() || this.isFocusing()) && currentOverflow;
      const isCurrentlyOpen = this.open();

      if (shouldShow && !isCurrentlyOpen) {
        this.forceShow();
      } else if (!shouldShow && isCurrentlyOpen) {
        this.forceHide();
      }
    }
  }

  /**
   * Force show the tooltip without checking overflow state
   * @internal
   */
  private forceShow(): void {
    if (this.state.disabled()) {
      return;
    }

    if (!this.overlay()) {
      this.createOverlay();
    }

    if (this.overlay()) {
      this.overlay()?.show();
    }
  }

  /**
   * Force hide the tooltip
   * @internal
   */
  private forceHide(): void {
    if (this.state.disabled()) {
      return;
    }

    this.overlay()?.hide();
  }
}
