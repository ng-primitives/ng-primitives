import {
  signal,
  Signal,
  WritableSignal,
  Injector,
  inject,
  ViewContainerRef,
  computed,
  ElementRef,
} from '@angular/core';
import { injectElementRef, setupOverflowListener } from 'ng-primitives/internal';
import {
  createOverlay,
  NgpFlip,
  NgpOffset,
  NgpOverlay,
  NgpOverlayConfig,
  NgpOverlayContent,
  NgpPosition,
  NgpShift,
} from 'ng-primitives/portal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  listener,
  StateInjectionOptions,
} from 'ng-primitives/state';
import { injectDisposables, isString } from 'ng-primitives/utils';
import { NgpTooltipTextContentComponent } from '../tooltip-text-content/tooltip-text-content';
import {
  createTooltipHoverBridgePolygon,
  isPointInHoverBridgePolygon,
  TooltipHoverBridgePoint,
} from './tooltip-hover-bridge';

export interface NgpTooltipTriggerState<T> {
  /** Access the tooltip template ref. */
  readonly tooltip: WritableSignal<NgpOverlayContent<T> | string | null>;
  /**
   * Define if the trigger should be disabled. This will prevent the tooltip from being shown or hidden from interactions.
   * @default false
   */
  readonly disabled: Signal<boolean>;
  /**
   * Define the placement of the tooltip relative to the trigger.
   * @default 'top'
   */
  readonly placement: Signal<NgpTooltipPlacement>;
  /**
   * Define the offset of the tooltip relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 0
   */
  readonly offset: Signal<NgpOffset>;
  /**
   * Define the delay before the tooltip is displayed.
   * @default 500
   */
  readonly showDelay: Signal<number>;
  /**
   * Define the delay before the tooltip is hidden.
   * @default 0
   */
  readonly hideDelay: Signal<number>;
  /**
   * Define whether the tooltip should flip when there is not enough space for the tooltip.
   * Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.
   * @default true
   */
  readonly flip: Signal<NgpFlip>;
  /**
   * Configure shift behavior to keep the tooltip in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  readonly shift: Signal<NgpShift>;
  /**
   * Define the container in which the tooltip should be attached.
   * @default document.body
   */
  readonly container: Signal<HTMLElement | string | null>;
  /**
   * Define whether the tooltip should only show when the trigger element overflows.
   * @default false
   */
  readonly showOnOverflow: Signal<boolean>;
  /**
   * Define an anchor element for positioning the tooltip.
   * If provided, the tooltip will be positioned relative to this element instead of the trigger.
   */
  readonly anchor: Signal<HTMLElement | null>;
  /**
   * Provide context to the tooltip. This can be used to pass data to the tooltip content.
   */
  readonly context: Signal<T | undefined>;
  /**
   * Define whether to use the text content of the trigger element as the tooltip content.
   * When enabled, the tooltip will display the text content of the trigger element.
   * @default true
   */
  readonly useTextContent: Signal<boolean>;
  /**
   * Define whether to track the trigger element position on every animation frame.
   * Useful for moving elements like slider thumbs.
   * @default false
   */
  readonly trackPosition: Signal<boolean>;
  /**
   * Programmatic position for the tooltip. When provided, the tooltip
   * will be positioned at these coordinates instead of the trigger element.
   * Use with trackPosition="true" for smooth cursor following.
   */
  readonly position: Signal<NgpPosition | null>;
  /**
   * Defines how the tooltip behaves when the window is scrolled.
   * @default 'reposition'
   */
  readonly scrollBehavior: Signal<'reposition' | 'close'>;
  /**
   * Define the cooldown duration in milliseconds.
   * When moving from one tooltip to another within this duration,
   * the showDelay is skipped for the new tooltip.
   * @default 300
   */
  readonly cooldown: Signal<number>;
  /**
   * Whether hovering tooltip content keeps the tooltip open.
   * @default false
   */
  readonly hoverableContent: Signal<boolean>;
  /**
   * The overlay that manages the tooltip
   * @internal
   */
  readonly overlay: WritableSignal<NgpOverlay<T | string> | null>;
  /**
   * The unique id of the tooltip.
   */
  readonly tooltipId: Signal<string | undefined>;
  /**
   * The open state of the tooltip.
   * @internal
   */
  readonly open: Signal<boolean>;
  /**
   * Determine if the trigger element has overflow.
   */
  readonly hasOverflow: Signal<boolean>;
  /**
   * Tracks whether pointer is currently over tooltip content.
   */
  readonly contentHovered: Signal<boolean>;
  /**
   * Current pointer grace polygon used while crossing trigger -> tooltip.
   */
  readonly hoverBridgePolygon: Signal<TooltipHoverBridgePoint[] | null>;
  /**
   * Show the tooltip programmatically (skips cooldown so multiple tooltips can coexist).
   */
  show: () => void;
  /**
   * Hide the tooltip.
   */
  hide: () => void;
  /**
   * Set the tooltip id.
   */
  setTooltipId: (id: string) => void;
  /**
   * Called by tooltip content when pointer enters the tooltip.
   * @internal
   */
  onTooltipHoverStart: () => void;
  /**
   * Called by tooltip content when pointer leaves the tooltip.
   * @internal
   */
  onTooltipHoverEnd: () => void;
  destroy: () => void;
}

export interface NgpTooltipTriggerProps<T> {
  /** Access the tooltip template ref. */
  readonly tooltip?: Signal<NgpOverlayContent<T> | string | null>;
  /**
   * Define if the trigger should be disabled. This will prevent the tooltip from being shown or hidden from interactions.
   * @default false
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Define the placement of the tooltip relative to the trigger.
   * @default 'top'
   */
  readonly placement?: Signal<NgpTooltipPlacement>;
  /**
   * Define the offset of the tooltip relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 0
   */
  readonly offset?: Signal<NgpOffset>;
  /**
   * Define the delay before the tooltip is displayed.
   * @default 500
   */
  readonly showDelay?: Signal<number>;
  /**
   * Define the delay before the tooltip is hidden.
   * @default 0
   */
  readonly hideDelay?: Signal<number>;
  /**
   * Define whether the tooltip should flip when there is not enough space for the tooltip.
   * Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.
   * @default true
   */
  readonly flip?: Signal<NgpFlip>;
  /**
   * Configure shift behavior to keep the tooltip in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  readonly shift?: Signal<NgpShift>;
  /**
   * Define the container in which the tooltip should be attached.
   * @default document.body
   */
  readonly container?: Signal<HTMLElement | string | null>;
  /**
   * Define whether the tooltip should only show when the trigger element overflows.
   * @default false
   */
  readonly showOnOverflow?: Signal<boolean>;
  /**
   * Define an anchor element for positioning the tooltip.
   * If provided, the tooltip will be positioned relative to this element instead of the trigger.
   */
  readonly anchor?: Signal<HTMLElement | null>;
  /**
   * Provide context to the tooltip. This can be used to pass data to the tooltip content.
   */
  readonly context?: Signal<T | undefined>;
  /**
   * Define whether to use the text content of the trigger element as the tooltip content.
   * When enabled, the tooltip will display the text content of the trigger element.
   * @default true
   */
  readonly useTextContent?: Signal<boolean>;
  /**
   * Define whether to track the trigger element position on every animation frame.
   * Useful for moving elements like slider thumbs.
   * @default false
   */
  readonly trackPosition?: Signal<boolean>;
  /**
   * Programmatic position for the tooltip. When provided, the tooltip
   * will be positioned at these coordinates instead of the trigger element.
   * Use with trackPosition="true" for smooth cursor following.
   */
  readonly position?: Signal<NgpPosition | null>;
  /**
   * Defines how the tooltip behaves when the window is scrolled.
   * @default 'reposition'
   */
  readonly scrollBehavior?: Signal<'reposition' | 'close'>;
  /**
   * Define the cooldown duration in milliseconds.
   * When moving from one tooltip to another within this duration,
   * the showDelay is skipped for the new tooltip.
   * @default 300
   */
  readonly cooldown?: Signal<number>;
  /**
   * Whether hovering tooltip content keeps the tooltip open.
   * @default false
   */
  readonly hoverableContent?: Signal<boolean>;
}

export const [
  NgpTooltipTriggerStateToken,
  ngpTooltipTrigger,
  _injectTooltipTriggerState,
  provideTooltipTriggerState,
] = createPrimitive(
  'NgpTooltipTrigger',
  <T>({
    tooltip: _tooltip = signal<NgpOverlayContent<T> | string | null>(null),
    disabled = signal<boolean>(false),
    placement = signal<NgpTooltipPlacement>('top'),
    offset = signal<NgpOffset>(0),
    showDelay = signal<number>(500),
    hideDelay = signal<number>(0),
    flip = signal<NgpFlip>(true),
    shift = signal<NgpShift | undefined>(undefined),
    container = signal<HTMLElement | string | null>('body'),
    showOnOverflow = signal<boolean>(false),
    anchor = signal<HTMLElement | null>(null),
    context = signal<T | undefined>(undefined),
    useTextContent = signal<boolean>(true),
    trackPosition = signal<boolean>(false),
    position = signal<NgpPosition | null>(null),
    scrollBehavior = signal<'reposition' | 'close'>('reposition'),
    cooldown = signal<number>(300),
    hoverableContent = signal<boolean>(false),
  }: NgpTooltipTriggerProps<T>) => {
    const HOVER_BRIDGE_TIMEOUT_MS = 150;
    const elementRef = injectElementRef();
    const injector = inject(Injector);
    const viewContainerRef = inject(ViewContainerRef);
    const trigger = inject(ElementRef<HTMLElement>);
    const tooltipTriggerState = injectTooltipTriggerState<T>();
    const disposables = injectDisposables();

    const tooltip = controlled(_tooltip);

    const tooltipId = signal<string | undefined>(undefined);
    const triggerHovered = signal<boolean>(false);
    const contentHovered = signal<boolean>(false);
    const hoverBridgePolygon = signal<TooltipHoverBridgePoint[] | null>(null);
    const overlay = signal<NgpOverlay<T | string> | null>(null);
    const hasOverflow = setupOverflowListener(trigger.nativeElement, {
      disabled: computed(() => !showOnOverflow()),
    });

    let removePointerMoveListener: (() => void) | undefined = undefined;
    let clearHoverBridgeTimeout: (() => void) | undefined = undefined;

    const open = computed(() => overlay()?.isOpen() ?? false);

    // Host binding
    attrBinding(elementRef, 'aria-describedby', () => overlay()?.ariaDescribedBy());
    dataBinding(elementRef, 'data-open', () => (open() ? '' : null));
    dataBinding(elementRef, 'data-disabled', () => (disabled() ? '' : null));

    // Listeners
    listener(elementRef, 'mouseenter', showFromInteraction);
    listener(elementRef, 'focus', showFromInteraction);
    listener(elementRef, 'mouseleave', hideFromInteraction);
    listener(elementRef, 'blur', () => hideFromInteraction());

    function destroy(): void {
      clearHoverBridge();
      overlay()?.destroy();
    }

    function show(): void {
      performShow(true);
    }

    function hide(): void {
      clearHoverBridge();
      overlay()?.hide();
    }

    /**
     * Show the tooltip from an interaction (respects disabled state, uses cooldown).
     * @internal
     */
    function showFromInteraction(): void {
      if (tooltipTriggerState().disabled()) {
        return;
      }
      triggerHovered.set(true);
      clearHoverBridge();
      performShow(false);
    }

    /**
     * Shared show logic.
     * @param skipCooldown When true, skip cooldown registration so multiple tooltips can coexist.
     */
    function performShow(skipCooldown: boolean): void {
      // If already open, cancel any pending close
      if (open()) {
        overlay()?.cancelPendingClose();
        return;
      }

      // if we should only show when there is overflow, check if the trigger has overflow
      if (tooltipTriggerState().showOnOverflow() && !hasOverflow()) {
        return;
      }

      // Create the overlay if it doesn't exist yet
      if (!overlay()) {
        createOverlayInstance();
      }

      overlay()?.show({ skipCooldown });
    }

    function setTooltipId(id: string): void {
      tooltipId.set(id);
    }

    /**
     * Hide the tooltip from an interaction (respects disabled state).
     * @internal
     */
    function hideFromInteraction(event?: MouseEvent): void {
      if (tooltipTriggerState().disabled()) {
        return;
      }

      triggerHovered.set(false);

      // Blur should close regardless of hover bridge or tooltip hover state.
      if (!event) {
        contentHovered.set(false);
        clearHoverBridge();
        hide();
        return;
      }

      if (!tooltipTriggerState().hoverableContent()) {
        hide();
        return;
      }

      const tooltipElement = overlay()?.getElements()[0];
      if (!tooltipElement) {
        hide();
        return;
      }

      const polygon = createTooltipHoverBridgePolygon({
        triggerRect: trigger.nativeElement.getBoundingClientRect(),
        tooltipRect: tooltipElement.getBoundingClientRect(),
        exitPoint: { x: event.clientX, y: event.clientY },
      });

      if (!polygon) {
        hide();
        return;
      }

      hoverBridgePolygon.set(polygon);
      overlay()?.cancelPendingClose();
      registerPointerMoveListener();
      scheduleHoverBridgeCloseFallback();
    }

    /**
     * Called by tooltip content when pointer enters the tooltip.
     * @internal
     */
    function onTooltipHoverStart(): void {
      if (tooltipTriggerState().disabled() || !tooltipTriggerState().hoverableContent()) {
        return;
      }

      contentHovered.set(true);
      clearHoverBridge();
      overlay()?.cancelPendingClose();
    }

    /**
     * Called by tooltip content when pointer leaves the tooltip.
     * @internal
     */
    function onTooltipHoverEnd(): void {
      if (tooltipTriggerState().disabled() || !tooltipTriggerState().hoverableContent()) {
        return;
      }

      contentHovered.set(false);

      if (!triggerHovered()) {
        hide();
      }
    }

    /**
     * Create the overlay that will contain the tooltip
     */
    function createOverlayInstance(): void {
      // Determine the content and context based on useTextContent setting
      const shouldUseTextContent = tooltipTriggerState().useTextContent();
      let content = tooltip();
      let context: Signal<T | string | undefined> = tooltipTriggerState().context;

      if (!content) {
        if (!shouldUseTextContent) {
          if (ngDevMode) {
            console.error(
              '[ngpTooltipTrigger]: Tooltip must be a string, TemplateRef, or ComponentType. Alternatively, set useTextContent to true if none is provided.',
            );
          }

          return;
        }

        const textContent = trigger.nativeElement.textContent?.trim() || '';
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
        triggerElement: trigger.nativeElement,
        anchorElement: anchor(),
        injector: injector,
        context,
        container: container(),
        placement: placement,
        offset: offset(),
        flip: flip(),
        shift: shift(),
        showDelay: showDelay(),
        hideDelay: hideDelay(),
        closeOnEscape: true,
        closeOnOutsideClick: true,
        viewContainerRef: viewContainerRef,
        trackPosition: trackPosition(),
        position: position,
        scrollBehaviour: scrollBehavior(),
        overlayType: 'tooltip',
        cooldown: cooldown(),
      };

      // Create the overlay instance
      overlay.set(createOverlay(config));
    }

    /**
     * Register document-level pointer tracking while crossing trigger -> tooltip.
     * @internal
     */
    function registerPointerMoveListener(): void {
      if (removePointerMoveListener) {
        return;
      }

      const cleanup = disposables.addEventListener(
        document,
        'pointermove' as keyof HTMLElementEventMap,
        ((event: PointerEvent): void => {
          if (triggerHovered() || contentHovered() || !hoverBridgePolygon()) {
            clearHoverBridge();
            return;
          }

          const inBridge = isPointInHoverBridgePolygon(
            { x: event.clientX, y: event.clientY },
            hoverBridgePolygon()!,
          );

          if (!inBridge) {
            clearHoverBridge();
            hide();
          }
        }) as EventListener,
        true,
      );

      removePointerMoveListener = () => {
        cleanup();
        removePointerMoveListener = undefined;
      };
    }

    /**
     * Clear hover bridge state and global listeners.
     * @internal
     */
    function clearHoverBridge(): void {
      hoverBridgePolygon.set(null);
      clearHoverBridgeTimeout?.();
      clearHoverBridgeTimeout = undefined;
      removePointerMoveListener?.();
    }

    /**
     * Close if pointer leaves trigger and does not move into tooltip soon enough.
     * @internal
     */
    function scheduleHoverBridgeCloseFallback(): void {
      clearHoverBridgeTimeout?.();

      clearHoverBridgeTimeout = disposables.setTimeout(() => {
        clearHoverBridgeTimeout = undefined;

        if (!triggerHovered() && !contentHovered() && hoverBridgePolygon()) {
          clearHoverBridge();
          hide();
        }
      }, HOVER_BRIDGE_TIMEOUT_MS);
    }

    const state = {
      tooltip,
      disabled,
      placement,
      offset,
      showDelay,
      hideDelay,
      flip,
      shift,
      container,
      showOnOverflow,
      anchor,
      context,
      useTextContent,
      trackPosition,
      position,
      scrollBehavior,
      cooldown,
      hoverableContent,
      overlay,
      tooltipId,
      open,
      hasOverflow,
      contentHovered,
      hoverBridgePolygon,
      show,
      hide,
      setTooltipId,
      onTooltipHoverStart,
      onTooltipHoverEnd,
      destroy,
    } satisfies NgpTooltipTriggerState<T>;

    return state;
  },
);

export function injectTooltipTriggerState<T>(
  options?: StateInjectionOptions,
): Signal<NgpTooltipTriggerState<T>> {
  return _injectTooltipTriggerState(options) as Signal<NgpTooltipTriggerState<T>>;
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
