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
  coerceFlip,
  coerceOffset,
  coerceShift,
  createOverlay,
  NgpFlip,
  NgpFlipInput,
  NgpOffset,
  NgpOffsetInput,
  NgpOverlay,
  NgpOverlayConfig,
  NgpOverlayContent,
  NgpPosition,
  NgpShift,
  NgpShiftInput,
} from 'ng-primitives/portal';
import { injectDisposables, isString } from 'ng-primitives/utils';
import { injectTooltipConfig } from '../config/tooltip-config';
import { NgpTooltipTextContentComponent } from '../tooltip-text-content/tooltip-text-content.component';
import {
  createTooltipHoverBridgePolygon,
  isPointInHoverBridgePolygon,
  TooltipHoverBridgePoint,
} from './tooltip-hover-bridge';
import { provideTooltipTriggerState, tooltipTriggerState } from './tooltip-trigger-state';

type TooltipInput<T> = NgpOverlayContent<T> | string | null | undefined;

/**
 * Apply the `ngpTooltipTrigger` directive to an element that triggers the tooltip to show.
 */
@Directive({
  selector: '[ngpTooltipTrigger]',
  exportAs: 'ngpTooltipTrigger',
  providers: [provideTooltipTriggerState({ inherit: false })],
  host: {
    '[attr.data-open]': 'open() ? "" : null',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
    '[attr.aria-describedby]': 'overlay()?.ariaDescribedBy()',
    '(mouseenter)': 'showFromInteraction()',
    '(mouseleave)': 'hideFromInteraction($event)',
    '(focus)': 'showFromInteraction()',
    '(blur)': 'hideFromInteraction()',
  },
})
export class NgpTooltipTrigger<T = null> implements OnDestroy {
  /**
   * Maximum time allowed to cross from trigger to tooltip without pointer movement.
   */
  private static readonly HOVER_BRIDGE_TIMEOUT_MS = 150;

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
   * Disposables for managing event listeners and timers with automatic teardown.
   */
  private readonly disposables = injectDisposables();

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
   * Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.
   * @default true
   */
  readonly flip = input<NgpFlip, NgpFlipInput>(this.config.flip, {
    alias: 'ngpTooltipTriggerFlip',
    transform: coerceFlip,
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
   * Defines how the tooltip behaves when the window is scrolled.
   * @default 'reposition'
   */
  readonly scrollBehavior = input<'reposition' | 'close'>(this.config.scrollBehavior, {
    alias: 'ngpTooltipTriggerScrollBehavior',
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
   * Whether hovering tooltip content keeps the tooltip open.
   * @default false
   */
  readonly hoverableContent = input<boolean, BooleanInput>(this.config.hoverableContent, {
    alias: 'ngpTooltipTriggerHoverableContent',
    transform: booleanAttribute,
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
   * Tracks whether pointer is currently over trigger.
   */
  private triggerHovered = false;

  /**
   * Tracks whether pointer is currently over tooltip content.
   */
  private contentHovered = false;

  /**
   * Current pointer grace polygon used while crossing trigger -> tooltip.
   */
  private hoverBridgePolygon: TooltipHoverBridgePoint[] | null = null;

  /**
   * Cleanup callback for the document pointermove listener.
   */
  private removePointerMoveListener?: () => void;

  /**
   * Cleanup callback for the hover bridge timeout.
   */
  private clearHoverBridgeTimeout?: () => void;

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
    this.clearHoverBridge();
    this.overlay()?.destroy();
  }

  /**
   * Show the tooltip programmatically (skips cooldown so multiple tooltips can coexist).
   */
  show(): void {
    this.performShow(true);
  }

  /**
   * Hide the tooltip.
   */
  hide(): void {
    this.clearHoverBridge();
    this.overlay()?.hide();
  }

  /**
   * Show the tooltip from an interaction (respects disabled state, uses cooldown).
   * @internal
   */
  protected showFromInteraction(): void {
    if (this.state.disabled()) {
      return;
    }
    this.triggerHovered = true;
    this.clearHoverBridge();
    this.performShow(false);
  }

  /**
   * Shared show logic.
   * @param skipCooldown When true, skip cooldown registration so multiple tooltips can coexist.
   */
  private performShow(skipCooldown: boolean): void {
    // If already open, cancel any pending close
    if (this.open()) {
      this.overlay()?.cancelPendingClose();
      return;
    }

    // if we should only show when there is overflow, check if the trigger has overflow
    if (this.state.showOnOverflow() && !this.hasOverflow()) {
      return;
    }

    // Create the overlay if it doesn't exist yet
    if (!this.overlay()) {
      this.createOverlay();
    }

    this.overlay()?.show({ skipCooldown });
  }

  /**
   * Hide the tooltip from an interaction (respects disabled state).
   * @internal
   */
  protected hideFromInteraction(event?: MouseEvent): void {
    if (this.state.disabled()) {
      return;
    }

    this.triggerHovered = false;

    // Blur should close regardless of hover bridge or tooltip hover state.
    if (!event) {
      this.contentHovered = false;
      this.clearHoverBridge();
      this.hide();
      return;
    }

    if (!this.state.hoverableContent()) {
      this.hide();
      return;
    }

    const tooltipElement = this.overlay()?.getElements()[0];
    if (!tooltipElement) {
      this.hide();
      return;
    }

    const polygon = createTooltipHoverBridgePolygon({
      triggerRect: this.trigger.nativeElement.getBoundingClientRect(),
      tooltipRect: tooltipElement.getBoundingClientRect(),
      exitPoint: { x: event.clientX, y: event.clientY },
    });

    if (!polygon) {
      this.hide();
      return;
    }

    this.hoverBridgePolygon = polygon;
    this.overlay()?.cancelPendingClose();
    this.registerPointerMoveListener();
    this.scheduleHoverBridgeCloseFallback();
  }

  /**
   * Called by tooltip content when pointer enters the tooltip.
   * @internal
   */
  onTooltipHoverStart(): void {
    if (this.state.disabled() || !this.state.hoverableContent()) {
      return;
    }

    this.contentHovered = true;
    this.clearHoverBridge();
    this.overlay()?.cancelPendingClose();
  }

  /**
   * Called by tooltip content when pointer leaves the tooltip.
   * @internal
   */
  onTooltipHoverEnd(): void {
    if (this.state.disabled() || !this.state.hoverableContent()) {
      return;
    }

    this.contentHovered = false;

    if (!this.triggerHovered) {
      this.hide();
    }
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
      scrollBehaviour: this.state.scrollBehavior(),
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

  /**
   * Register document-level pointer tracking while crossing trigger -> tooltip.
   */
  private registerPointerMoveListener(): void {
    if (this.removePointerMoveListener) {
      return;
    }

    const cleanup = this.disposables.addEventListener(
      document,
      'pointermove' as keyof HTMLElementEventMap,
      ((event: PointerEvent): void => {
        if (this.triggerHovered || this.contentHovered || !this.hoverBridgePolygon) {
          this.clearHoverBridge();
          return;
        }

        const inBridge = isPointInHoverBridgePolygon(
          { x: event.clientX, y: event.clientY },
          this.hoverBridgePolygon,
        );

        if (!inBridge) {
          this.clearHoverBridge();
          this.hide();
        }
      }) as EventListener,
      true,
    );

    this.removePointerMoveListener = () => {
      cleanup();
      this.removePointerMoveListener = undefined;
    };
  }

  /**
   * Clear hover bridge state and global listeners.
   */
  private clearHoverBridge(): void {
    this.hoverBridgePolygon = null;
    this.clearHoverBridgeTimeout?.();
    this.clearHoverBridgeTimeout = undefined;
    this.removePointerMoveListener?.();
  }

  /**
   * Close if pointer leaves trigger and does not move into tooltip soon enough.
   */
  private scheduleHoverBridgeCloseFallback(): void {
    this.clearHoverBridgeTimeout?.();

    this.clearHoverBridgeTimeout = this.disposables.setTimeout(() => {
      this.clearHoverBridgeTimeout = undefined;

      if (!this.triggerHovered && !this.contentHovered && this.hoverBridgePolygon) {
        this.clearHoverBridge();
        this.hide();
      }
    }, NgpTooltipTrigger.HOVER_BRIDGE_TIMEOUT_MS);
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
