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
import {
  createHoverBridge,
  HoverBridgePoint,
  injectElementRef,
  setupOverflowListener,
} from 'ng-primitives/internal';
import {
  createOverlay,
  NgpFlip,
  NgpOffset,
  NgpOverlay,
  NgpOverlayConfig,
  NgpOverlayContent,
  NgpPlacement,
  NgpPosition,
  NgpShift,
} from 'ng-primitives/portal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  listener,
  onDestroy,
  StateInjectionOptions,
} from 'ng-primitives/state';
import { isString } from 'ng-primitives/utils';
import { NgpTooltipTextContentComponent } from '../tooltip-text-content/tooltip-text-content';

export interface NgpTooltipTriggerState<T> {
  /** Access the tooltip template ref. */
  readonly tooltip: WritableSignal<NgpOverlayContent<T> | string | null>;
  /**
   * Whether the tooltip is disabled. This allows the tooltip to be enabled or disabled dynamically.
   * @default false
   */
  readonly disabled: WritableSignal<boolean>;
  /**
   * Define the placement of the tooltip relative to the trigger.
   * @default 'top'
   */
  readonly placement: WritableSignal<NgpPlacement>;
  /**
   * Define the offset of the tooltip relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 0
   */
  readonly offset: WritableSignal<NgpOffset>;
  /**
   * Define the delay before the tooltip is displayed.
   * @default 500
   */
  readonly showDelay: WritableSignal<number>;
  /**
   * Define the delay before the tooltip is hidden.
   * @default 0
   */
  readonly hideDelay: WritableSignal<number>;
  /**
   * Define whether the tooltip should flip when there is not enough space for the tooltip.
   * Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.
   * @default true
   */
  readonly flip: WritableSignal<NgpFlip>;
  /**
   * Configure shift behavior to keep the tooltip in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  readonly shift: WritableSignal<NgpShift>;
  /**
   * Define the container in which the tooltip should be attached.
   * @default document.body
   */
  readonly container: WritableSignal<HTMLElement | string | null>;
  /**
   * Define whether the tooltip should only show when the trigger element overflows.
   * @default false
   */
  readonly showOnOverflow: WritableSignal<boolean>;
  /**
   * Define an anchor element for positioning the tooltip.
   * If provided, the tooltip will be positioned relative to this element instead of the trigger.
   */
  readonly anchor: WritableSignal<HTMLElement | null>;
  /**
   * Provide context to the tooltip. This can be used to pass data to the tooltip content.
   */
  readonly context: WritableSignal<T | undefined>;
  /**
   * Define whether to use the text content of the trigger element as the tooltip content.
   * When enabled, the tooltip will display the text content of the trigger element.
   * @default true
   */
  readonly useTextContent: WritableSignal<boolean>;
  /**
   * Define whether to track the trigger element position on every animation frame.
   * Useful for moving elements like slider thumbs.
   * @default false
   */
  readonly trackPosition: WritableSignal<boolean>;
  /**
   * Programmatic position for the tooltip. When provided, the tooltip
   * will be positioned at these coordinates instead of the trigger element.
   * Use with trackPosition="true" for smooth cursor following.
   */
  readonly position: WritableSignal<NgpPosition | null>;
  /**
   * Defines how the tooltip behaves when the window is scrolled.
   * @default 'reposition'
   */
  readonly scrollBehavior: WritableSignal<'reposition' | 'close'>;
  /**
   * Define the cooldown duration in milliseconds.
   * When moving from one tooltip to another within this duration,
   * the showDelay is skipped for the new tooltip.
   * @default 300
   */
  readonly cooldown: WritableSignal<number>;
  /**
   * Whether hovering tooltip content keeps the tooltip open.
   * @default false
   */
  readonly hoverableContent: WritableSignal<boolean>;
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
  readonly hoverBridgePolygon: Signal<HoverBridgePoint[] | null>;
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
  /** Set the tooltip content. */
  setTooltip: (tooltip: NgpOverlayContent<T> | string | null) => void;
  /** Set whether the tooltip is disabled. */
  setDisabled: (disabled: boolean) => void;
  /** Set the placement of the tooltip relative to the trigger. */
  setPlacement: (placement: NgpPlacement) => void;
  /** Set the offset of the tooltip relative to the trigger. */
  setOffset: (offset: NgpOffset) => void;
  /** Set the delay before the tooltip is displayed. */
  setShowDelay: (showDelay: number) => void;
  /** Set the delay before the tooltip is hidden. */
  setHideDelay: (hideDelay: number) => void;
  /** Set the flip behaviour. */
  setFlip: (flip: NgpFlip) => void;
  /** Set the shift behaviour. */
  setShift: (shift: NgpShift) => void;
  /** Set the container in which the tooltip should be attached. */
  setContainer: (container: HTMLElement | string | null) => void;
  /** Set whether the tooltip only shows when the trigger element overflows. */
  setShowOnOverflow: (showOnOverflow: boolean) => void;
  /** Set the anchor element the tooltip is positioned against. */
  setAnchor: (anchor: HTMLElement | null) => void;
  /** Set the context passed to the tooltip content. */
  setContext: (context: T | undefined) => void;
  /** Set whether the trigger's text content is used as the tooltip content. */
  setUseTextContent: (useTextContent: boolean) => void;
  /** Set whether the trigger position is tracked on every animation frame. */
  setTrackPosition: (trackPosition: boolean) => void;
  /** Set the programmatic position the tooltip is placed at. */
  setPosition: (position: NgpPosition | null) => void;
  /** Set how the tooltip behaves when the window is scrolled. */
  setScrollBehavior: (scrollBehavior: 'reposition' | 'close') => void;
  /** Set the cooldown duration in milliseconds. */
  setCooldown: (cooldown: number) => void;
  /** Set whether hovering the tooltip content keeps it open. */
  setHoverableContent: (hoverableContent: boolean) => void;
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
}

export interface NgpTooltipTriggerProps<T> {
  /** Access the tooltip template ref. */
  readonly tooltip?: Signal<NgpOverlayContent<T> | string | null>;
  /**
   * Whether the tooltip is disabled. This allows the tooltip to be enabled or disabled dynamically.
   * @default false
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Define the placement of the tooltip relative to the trigger.
   * @default 'top'
   */
  readonly placement?: Signal<NgpPlacement>;
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
    tooltip: _tooltip,
    disabled: _disabled,
    placement: _placement,
    offset: _offset,
    showDelay: _showDelay,
    hideDelay: _hideDelay,
    flip: _flip,
    shift: _shift,
    container: _container,
    showOnOverflow: _showOnOverflow,
    anchor: _anchor,
    context: _context,
    useTextContent: _useTextContent,
    trackPosition: _trackPosition,
    position: _position,
    scrollBehavior: _scrollBehavior,
    cooldown: _cooldown,
    hoverableContent: _hoverableContent,
  }: NgpTooltipTriggerProps<T>) => {
    const elementRef = injectElementRef();
    const injector = inject(Injector);
    const viewContainerRef = inject(ViewContainerRef);
    const trigger = inject(ElementRef<HTMLElement>);
    const tooltipTriggerState = injectTooltipTriggerState<T>();

    // Every input is wrapped so the state can expose a setter for it - see the
    // setter block further down the factory.
    const tooltip = controlled<NgpOverlayContent<T> | string | null>(_tooltip, null);
    const disabled = controlled(_disabled, false);
    const placement = controlled<NgpPlacement>(_placement, 'top');
    const offset = controlled<NgpOffset>(_offset, 0);
    const showDelay = controlled(_showDelay, 500);
    const hideDelay = controlled(_hideDelay, 0);
    const flip = controlled<NgpFlip>(_flip, true);
    const shift = controlled<NgpShift>(_shift, undefined);
    const container = controlled<HTMLElement | string | null>(_container, 'body');
    const showOnOverflow = controlled(_showOnOverflow, false);
    const anchor = controlled<HTMLElement | null>(_anchor, null);
    const context = controlled<T | undefined>(_context, undefined);
    const useTextContent = controlled(_useTextContent, true);
    const trackPosition = controlled(_trackPosition, false);
    const position = controlled<NgpPosition | null>(_position, null);
    const scrollBehavior = controlled<'reposition' | 'close'>(_scrollBehavior, 'reposition');
    const cooldown = controlled(_cooldown, 300);
    const hoverableContent = controlled(_hoverableContent, false);

    const tooltipId = signal<string | undefined>(undefined);
    const triggerHovered = signal<boolean>(false);
    const contentHovered = signal<boolean>(false);
    const overlay = signal<NgpOverlay<T | string> | null>(null);
    const hasOverflow = setupOverflowListener(trigger.nativeElement, {
      disabled: computed(() => !showOnOverflow()),
    });

    const open = computed(() => overlay()?.isOpen() ?? false);

    // Safe-polygon hover intent for hoverable tooltip content. Tooltips preserve
    // their original behaviour: no direction gate (requireForwardMovement off)
    // and a fixed crossing grace rather than an idle timer that resets on move.
    const hoverBridge = createHoverBridge({
      isPointerInAnchor: () => triggerHovered() || contentHovered(),
      close: () => hide(),
      resetFallbackOnMove: false,
    });

    // Host binding
    attrBinding(elementRef, 'aria-describedby', () => overlay()?.ariaDescribedBy());
    dataBinding(elementRef, 'data-open', () => (open() ? '' : null));

    // Listeners
    listener(elementRef, 'mouseenter', showFromInteraction);
    listener(elementRef, 'focus', showFromInteraction);
    listener(elementRef, 'mouseleave', hideFromInteraction);
    listener(elementRef, 'blur', () => hideFromInteraction());

    onDestroy(() => {
      hoverBridge.clear();
      overlay()?.destroy();
    });

    function show(): void {
      performShow(true);
    }

    function hide(): void {
      hoverBridge.clear();
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
      hoverBridge.clear();
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

    function setTooltip(newTooltip: NgpOverlayContent<T> | string | null): void {
      tooltip.set(newTooltip);
    }

    function setDisabled(isDisabled: boolean): void {
      disabled.set(isDisabled);
    }

    function setPlacement(newPlacement: NgpPlacement): void {
      placement.set(newPlacement);
    }

    function setOffset(newOffset: NgpOffset): void {
      offset.set(newOffset);
    }

    function setShowDelay(delay: number): void {
      showDelay.set(delay);
    }

    function setHideDelay(delay: number): void {
      hideDelay.set(delay);
    }

    function setFlip(shouldFlip: NgpFlip): void {
      flip.set(shouldFlip);
    }

    function setShift(shouldShift: NgpShift): void {
      shift.set(shouldShift);
    }

    function setContainer(newContainer: HTMLElement | string | null): void {
      container.set(newContainer);
    }

    function setShowOnOverflow(shouldShowOnOverflow: boolean): void {
      showOnOverflow.set(shouldShowOnOverflow);
    }

    function setAnchor(newAnchor: HTMLElement | null): void {
      anchor.set(newAnchor);
    }

    function setContext(newContext: T | undefined): void {
      context.set(newContext);
    }

    function setUseTextContent(shouldUseTextContent: boolean): void {
      useTextContent.set(shouldUseTextContent);
    }

    function setTrackPosition(shouldTrack: boolean): void {
      trackPosition.set(shouldTrack);
    }

    function setPosition(newPosition: NgpPosition | null): void {
      position.set(newPosition);
    }

    function setScrollBehavior(behavior: 'reposition' | 'close'): void {
      scrollBehavior.set(behavior);
    }

    function setCooldown(duration: number): void {
      cooldown.set(duration);
    }

    function setHoverableContent(isHoverable: boolean): void {
      hoverableContent.set(isHoverable);
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
        hoverBridge.clear();
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

      const started = hoverBridge.track({
        triggerRect: trigger.nativeElement.getBoundingClientRect(),
        targetRect: tooltipElement.getBoundingClientRect(),
        exitPoint: { x: event.clientX, y: event.clientY },
      });

      if (!started) {
        hide();
        return;
      }

      overlay()?.cancelPendingClose();
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
      hoverBridge.clear();
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
     * What the overlay renders: the tooltip itself, or - when none is given - the
     * trigger's own text content wrapped in the text content component. Strings are
     * wrapped the same way. Null when there is nothing to show.
     *
     * The text content fallback reads the DOM, which is not reactive - it is resolved
     * afresh whenever the tooltip or `useTextContent` changes, but a trigger that
     * rewrites its own label keeps the text it was first shown with.
     */
    function resolveContent(): {
      content: NgpOverlayContent<T | string> | null;
      context: T | string | undefined;
    } {
      const value = tooltip();

      if (value) {
        return isString(value)
          ? { content: NgpTooltipTextContentComponent, context: value }
          : { content: value, context: tooltipTriggerState().context() };
      }

      const textContent = tooltipTriggerState().useTextContent()
        ? trigger.nativeElement.textContent?.trim() || ''
        : '';

      return textContent
        ? { content: NgpTooltipTextContentComponent, context: textContent }
        : { content: null, context: undefined };
    }

    /**
     * Create the overlay that will contain the tooltip
     */
    function createOverlayInstance(): void {
      const resolved = computed(resolveContent);
      const content = computed(() => resolved().content);
      const context = computed(() => resolved().context);

      if (!content()) {
        if (ngDevMode) {
          if (tooltipTriggerState().useTextContent()) {
            console.warn(
              '[ngpTooltipTrigger]: useTextContent is enabled but trigger element has no text content',
            );
          } else {
            console.error(
              '[ngpTooltipTrigger]: Tooltip must be a string, TemplateRef, or ComponentType. Alternatively, set useTextContent to true if none is provided.',
            );
          }
        }

        return;
      }

      // Create config for the overlay
      const config: NgpOverlayConfig<T | string> = {
        content,
        triggerElement: trigger.nativeElement,
        anchorElement: anchor(),
        injector: injector,
        context,
        container,
        placement: placement,
        offset,
        flip,
        shift,
        showDelay,
        hideDelay,
        closeOnEscape: signal(true),
        closeOnOutsideClick: signal(true),
        viewContainerRef: viewContainerRef,
        trackPosition,
        position: position,
        scrollBehavior,
        overlayType: 'tooltip',
        cooldown,
      };

      // Create the overlay instance
      overlay.set(createOverlay(config));
    }

    const state = {
      tooltip: deprecatedSetter(tooltip, 'setTooltip', setTooltip),
      disabled: deprecatedSetter(disabled, 'setDisabled', setDisabled),
      placement: deprecatedSetter(placement, 'setPlacement', setPlacement),
      offset: deprecatedSetter(offset, 'setOffset', setOffset),
      showDelay: deprecatedSetter(showDelay, 'setShowDelay', setShowDelay),
      hideDelay: deprecatedSetter(hideDelay, 'setHideDelay', setHideDelay),
      flip: deprecatedSetter(flip, 'setFlip', setFlip),
      shift: deprecatedSetter(shift, 'setShift', setShift),
      container: deprecatedSetter(container, 'setContainer', setContainer),
      showOnOverflow: deprecatedSetter(showOnOverflow, 'setShowOnOverflow', setShowOnOverflow),
      anchor: deprecatedSetter(anchor, 'setAnchor', setAnchor),
      context: deprecatedSetter(context, 'setContext', setContext),
      useTextContent: deprecatedSetter(useTextContent, 'setUseTextContent', setUseTextContent),
      trackPosition: deprecatedSetter(trackPosition, 'setTrackPosition', setTrackPosition),
      position: deprecatedSetter(position, 'setPosition', setPosition),
      scrollBehavior: deprecatedSetter(scrollBehavior, 'setScrollBehavior', setScrollBehavior),
      cooldown: deprecatedSetter(cooldown, 'setCooldown', setCooldown),
      hoverableContent: deprecatedSetter(
        hoverableContent,
        'setHoverableContent',
        setHoverableContent,
      ),
      overlay,
      tooltipId,
      open,
      hasOverflow,
      contentHovered,
      hoverBridgePolygon: hoverBridge.polygon,
      show,
      hide,
      setTooltipId,
      setTooltip,
      setDisabled,
      setPlacement,
      setOffset,
      setShowDelay,
      setHideDelay,
      setFlip,
      setShift,
      setContainer,
      setShowOnOverflow,
      setAnchor,
      setContext,
      setUseTextContent,
      setTrackPosition,
      setPosition,
      setScrollBehavior,
      setCooldown,
      setHoverableContent,
      onTooltipHoverStart,
      onTooltipHoverEnd,
    } satisfies NgpTooltipTriggerState<T>;

    return state;
  },
);

export function injectTooltipTriggerState<T>(
  options?: StateInjectionOptions,
): Signal<NgpTooltipTriggerState<T>> {
  return _injectTooltipTriggerState(options) as Signal<NgpTooltipTriggerState<T>>;
}

/**
 * Where the tooltip is placed relative to its trigger.
 * @deprecated Identical to `NgpPlacement` from `ng-primitives/portal` - use that instead.
 * Will be removed in a future major.
 */
export type NgpTooltipPlacement = NgpPlacement;
