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
import { setupOverflowListener } from 'ng-primitives/internal';
import {
  coerceOffset,
  coerceShift,
  createOverlay,
  NgpOffset,
  NgpOffsetInput,
  NgpOverlay,
  NgpOverlayConfig,
  NgpOverlayContent,
  NgpPosition,
  NgpShift,
  NgpShiftInput,
} from 'ng-primitives/portal';
import { isString } from 'ng-primitives/utils';
import { injectTooltipConfig } from '../config/tooltip-config';
import { NgpTooltipTextContentComponent } from '../tooltip-text-content/tooltip-text-content.component';
import { provideTooltipTriggerState, tooltipTriggerState } from './tooltip-trigger-state';

type TooltipInput<T> = NgpOverlayContent<T> | string | null | undefined;

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
    '(mouseenter)': 'showFromInteraction()',
    '(mouseleave)': 'hideFromInteraction()',
    '(focus)': 'showFromInteraction()',
    '(blur)': 'hideFromInteraction()',
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
  readonly tooltip = input<NgpOverlayContent<T> | string | null, TooltipInput<T>>(null, {
    alias: 'ngpTooltipTrigger',
    transform: (value: TooltipInput<T>) => (value && !isString(value) ? value : null),
  });

  /**
   * Define if the trigger should be disabled. This will prevent the tooltip from being shown or hidden from interactions.
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
  readonly placement = input<NgpTooltipPlacement>(this.config.placement, {
    alias: 'ngpTooltipTriggerPlacement',
  });

  /**
   * Define the offset of the tooltip relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 0
   */
  readonly offset = input<NgpOffset, NgpOffsetInput>(this.config.offset, {
    alias: 'ngpTooltipTriggerOffset',
    transform: coerceOffset,
  });

  /**
   * Define the delay before the tooltip is displayed.
   * @default 500
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
   * Configure shift behavior to keep the tooltip in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  readonly shift = input<NgpShift, NgpShiftInput>(this.config.shift, {
    alias: 'ngpTooltipTriggerShift',
    transform: coerceShift,
  });

  /**
   * Define the container in which the tooltip should be attached.
   * @default document.body
   */
  readonly container = input<HTMLElement | string | null>(this.config.container, {
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
   * Define whether to use the text content of the trigger element as the tooltip content.
   * When enabled, the tooltip will display the text content of the trigger element.
   * @default true
   */
  readonly useTextContent = input<boolean, BooleanInput>(this.config.useTextContent, {
    alias: 'ngpTooltipTriggerUseTextContent',
    transform: booleanAttribute,
  });

  /**
   * Define whether to track the trigger element position on every animation frame.
   * Useful for moving elements like slider thumbs.
   * @default false
   */
  readonly trackPosition = input<boolean, BooleanInput>(this.config.trackPosition, {
    alias: 'ngpTooltipTriggerTrackPosition',
    transform: booleanAttribute,
  });

  /**
   * Programmatic position for the tooltip. When provided, the tooltip
   * will be positioned at these coordinates instead of the trigger element.
   * Use with trackPosition="true" for smooth cursor following.
   */
  readonly position = input<NgpPosition | null>(null, {
    alias: 'ngpTooltipTriggerPosition',
  });

  /**
   * Define the cooldown duration in milliseconds.
   * When moving from one tooltip to another within this duration,
   * the showDelay is skipped for the new tooltip.
   * @default 300
   */
  readonly cooldown = input<number, NumberInput>(this.config.cooldown, {
    alias: 'ngpTooltipTriggerCooldown',
    transform: numberAttribute,
  });

  /**
   * The overlay that manages the tooltip
   * @internal
   */
  readonly overlay = signal<NgpOverlay<T | string> | null>(null);

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
    // If already open, cancel any pending close
    if (this.open()) {
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
    this.overlay()?.hide();
  }

  /**
   * Show the tooltip from an interaction (respects disabled state).
   * @internal
   */
  protected showFromInteraction(): void {
    if (this.state.disabled()) {
      return;
    }
    this.show();
  }

  /**
   * Hide the tooltip from an interaction (respects disabled state).
   * @internal
   */
  protected hideFromInteraction(): void {
    if (this.state.disabled()) {
      return;
    }
    this.hide();
  }

  /**
   * Create the overlay that will contain the tooltip
   */
  private createOverlay(): void {
    // Determine the content and context based on useTextContent setting
    const shouldUseTextContent = this.state.useTextContent();
    let content = this.state.tooltip();
    let context: Signal<T | string | undefined> = this.state.context;

    if (!content) {
      if (!shouldUseTextContent) {
        if (ngDevMode) {
          console.error(
            '[ngpTooltipTrigger]: Tooltip must be a string, TemplateRef, or ComponentType. Alternatively, set useTextContent to true if none is provided.',
          );
        }

        return;
      }

      const textContent = this.trigger.nativeElement.textContent?.trim() || '';
      if (ngDevMode && !textContent) {
        console.warn(
          '[ngpTooltipTrigger]: useTextContent is enabled but trigger element has no text content',
        );
        return;
      }
      content = NgpTooltipTextContentComponent;
      context = signal(textContent);
    } else if (isString(content)) {
      context = signal(content);
      content = NgpTooltipTextContentComponent;
    }

    // Create config for the overlay
    const config: NgpOverlayConfig<T | string> = {
      content,
      triggerElement: this.trigger.nativeElement,
      injector: this.injector,
      context,
      container: this.state.container(),
      placement: this.state.placement,
      offset: this.state.offset(),
      flip: this.state.flip(),
      shift: this.state.shift(),
      showDelay: this.state.showDelay(),
      hideDelay: this.state.hideDelay(),
      closeOnEscape: true,
      closeOnOutsideClick: true,
      viewContainerRef: this.viewContainerRef,
      trackPosition: this.state.trackPosition(),
      position: this.state.position,
      overlayType: 'tooltip',
      cooldown: this.state.cooldown(),
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

export type NgpTooltipPlacement =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top-start'
  | 'top-end'
  | 'right-start'
  | 'right-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end';
