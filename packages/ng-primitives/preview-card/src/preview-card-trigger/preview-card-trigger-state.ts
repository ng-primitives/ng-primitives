import {
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  Signal,
  ViewContainerRef,
  WritableSignal,
} from '@angular/core';
import { createHoverBridge, injectElementRef } from 'ng-primitives/internal';
import {
  createOverlay,
  NgpFlip,
  NgpOffset,
  NgpOverlay,
  NgpOverlayConfig,
  NgpOverlayContent,
  NgpShift,
} from 'ng-primitives/portal';
import {
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  listener,
  StateInjectionOptions,
} from 'ng-primitives/state';

export interface NgpPreviewCardTriggerState<T> {
  /** Access the preview card template ref. */
  readonly previewCard: WritableSignal<NgpOverlayContent<T> | undefined>;
  /**
   * Whether the preview card is disabled. This allows the preview card to be enabled or disabled dynamically.
   * @default false
   */
  readonly disabled: Signal<boolean>;
  /**
   * Define the placement of the preview card relative to the trigger.
   * @default 'bottom'
   */
  readonly placement: Signal<NgpPreviewCardPlacement>;
  /**
   * Define the offset of the preview card relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 4
   */
  readonly offset: Signal<NgpOffset>;
  /**
   * Define the delay before the preview card is displayed.
   * @default 600
   */
  readonly showDelay: Signal<number>;
  /**
   * Define the delay before the preview card is hidden.
   * @default 300
   */
  readonly hideDelay: Signal<number>;
  /**
   * Define whether the preview card should flip when there is not enough space.
   * Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.
   * @default true
   */
  readonly flip: Signal<NgpFlip>;
  /**
   * Configure shift behavior to keep the preview card in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  readonly shift: Signal<NgpShift>;
  /**
   * Define the container in which the preview card should be attached.
   * @default document.body
   */
  readonly container: WritableSignal<HTMLElement | string | null>;
  /**
   * Define an anchor element for positioning the preview card.
   * If provided, the preview card will be positioned relative to this element instead of the trigger.
   */
  readonly anchor: Signal<HTMLElement | null>;
  /**
   * Provide context to the preview card. This can be used to pass data to the preview card content.
   */
  readonly context: Signal<T | undefined>;
  /**
   * Defines how the preview card behaves when the window is scrolled.
   * @default 'reposition'
   */
  readonly scrollBehavior: Signal<'reposition' | 'close'>;
  /**
   * Define the cooldown duration in milliseconds.
   * When moving from one preview card to another within this duration,
   * the showDelay is skipped for the new card.
   * @default 300
   */
  readonly cooldown: Signal<number>;
  /**
   * The overlay that manages the preview card.
   * @internal
   */
  readonly overlay: Signal<NgpOverlay<T> | null>;
  /**
   * The open state of the preview card.
   * @internal
   */
  readonly open: Signal<boolean>;
  /** Show the preview card. */
  show: () => void;
  /** Hide the preview card. */
  hide: () => void;
  /**
   * Called by the preview card when the pointer enters it.
   * @internal
   */
  onCardHoverStart: () => void;
  /**
   * Called by the preview card when the pointer leaves it.
   * @internal
   */
  onCardHoverEnd: () => void;
  /**
   * Set the container in which the preview card should be attached. Takes effect the
   * next time the card is shown; it does not move a card that is already visible.
   * @param container - The new container
   */
  setContainer: (container: HTMLElement | string | null) => void;
  /** @internal onDestroy callback */
  destroy: () => void;
}

export interface NgpPreviewCardTriggerProps<T> {
  /** Access the preview card template ref. */
  readonly previewCard?: Signal<NgpOverlayContent<T> | undefined>;
  /**
   * Whether the preview card is disabled. This allows the preview card to be enabled or disabled dynamically.
   * @default false
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Define the placement of the preview card relative to the trigger.
   * @default 'bottom'
   */
  readonly placement?: Signal<NgpPreviewCardPlacement>;
  /**
   * Define the offset of the preview card relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 4
   */
  readonly offset?: Signal<NgpOffset>;
  /**
   * Define the delay before the preview card is displayed.
   * @default 600
   */
  readonly showDelay?: Signal<number>;
  /**
   * Define the delay before the preview card is hidden.
   * @default 300
   */
  readonly hideDelay?: Signal<number>;
  /**
   * Define whether the preview card should flip when there is not enough space.
   * Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.
   * @default true
   */
  readonly flip?: Signal<NgpFlip>;
  /**
   * Configure shift behavior to keep the preview card in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  readonly shift?: Signal<NgpShift>;
  /**
   * Define the container in which the preview card should be attached.
   * @default document.body
   */
  readonly container?: Signal<HTMLElement | string | null>;
  /**
   * Define an anchor element for positioning the preview card.
   * If provided, the preview card will be positioned relative to this element instead of the trigger.
   */
  readonly anchor?: Signal<HTMLElement | null>;
  /**
   * Provide context to the preview card. This can be used to pass data to the preview card content.
   */
  readonly context?: Signal<T | undefined>;
  /**
   * Defines how the preview card behaves when the window is scrolled.
   * @default 'reposition'
   */
  readonly scrollBehavior?: Signal<'reposition' | 'close'>;
  /**
   * Define the cooldown duration in milliseconds.
   * When moving from one preview card to another within this duration,
   * the showDelay is skipped for the new card.
   * @default 300
   */
  readonly cooldown?: Signal<number>;
  /** Callback fired when the open state changes. */
  readonly onOpenChange?: (value: boolean) => void;
}

export const [
  NgpPreviewCardTriggerStateToken,
  ngpPreviewCardTrigger,
  _injectPreviewCardTriggerState,
  providePreviewCardTriggerState,
] = createPrimitive(
  'NgpPreviewCardTrigger',
  <T>({
    previewCard: _previewCard = signal<NgpOverlayContent<T> | undefined>(undefined),
    disabled = signal<boolean>(false),
    placement = signal<NgpPreviewCardPlacement>('bottom'),
    offset = signal<NgpOffset>(4),
    showDelay = signal<number>(600),
    hideDelay = signal<number>(300),
    flip = signal<NgpFlip>(true),
    shift = signal<NgpShift>(undefined),
    container: _container,
    anchor = signal<HTMLElement | null>(null),
    context = signal<T | undefined>(undefined),
    scrollBehavior = signal<'reposition' | 'close'>('reposition'),
    cooldown = signal<number>(300),
    onOpenChange,
  }: NgpPreviewCardTriggerProps<T>): NgpPreviewCardTriggerState<T> => {
    const elementRef = injectElementRef<HTMLElement>();
    const trigger = inject(ElementRef<HTMLElement>);
    const viewContainerRef = inject(ViewContainerRef);
    const injector = inject(Injector);

    const previewCard = controlled(_previewCard);
    const container = controlled(_container, 'body');

    const overlay = signal<NgpOverlay<T> | null>(null);
    const open = computed(() => overlay()?.isOpen() ?? false);

    const triggerHovered = signal<boolean>(false);
    const cardHovered = signal<boolean>(false);

    // Hoverable content is inherent to a preview card - the point of the pattern is
    // to move into the card and read or click through it. The shared safe-polygon
    // bridge keeps the card open while the pointer crosses the gap between the
    // trigger and the card, and closes it promptly once the pointer leaves that
    // corridor rather than lingering for the full hide delay.
    const hoverBridge = createHoverBridge({
      isPointerInAnchor: () => triggerHovered() || cardHovered(),
      close: () => hide(),
    });

    // Host bindings.
    //
    // A preview card is deliberately invisible to assistive technology: the content
    // carries no role and is not linked to the trigger, and the trigger gets no
    // aria-expanded/aria-haspopup/aria-controls/aria-describedby. Announcing a rich,
    // interactive card as a link's *description* is worse than silence, and
    // aria-expanded would advertise a disclosure that cannot be operated by
    // keyboard. Only data attributes are exposed, for styling.
    dataBinding(elementRef, 'data-open', open);
    dataBinding(elementRef, 'data-placement', placement);
    dataBinding(elementRef, 'data-disabled', disabled);

    // Event listeners
    listener(elementRef, 'pointerenter', onPointerEnter);
    listener(elementRef, 'pointerleave', onPointerLeave);

    /**
     * Touch has no hover state, so a tap would otherwise reveal a card over the
     * page the user is navigating to. Ignore touch pointers entirely.
     */
    function isTouch(event: PointerEvent): boolean {
      return event.pointerType === 'touch';
    }

    function onPointerEnter(event: PointerEvent): void {
      if (isTouch(event)) {
        return;
      }

      triggerHovered.set(true);
      hoverBridge.clear();
      show();
    }

    function onPointerLeave(event: PointerEvent): void {
      if (isTouch(event)) {
        return;
      }

      triggerHovered.set(false);

      const cardElement = overlay()?.getElements()[0];

      if (!cardElement) {
        hide();
        return;
      }

      // Build a corridor from where the pointer left the trigger toward the card. If
      // one can't be built (e.g. the card is not positioned yet) fall back to
      // closing, so the card can never be stranded open.
      const started = hoverBridge.track({
        triggerRect: trigger.nativeElement.getBoundingClientRect(),
        targetRect: cardElement.getBoundingClientRect(),
        exitPoint: { x: event.clientX, y: event.clientY },
      });

      if (!started) {
        hide();
        return;
      }

      overlay()?.cancelPendingClose();
    }

    /**
     * Called by the preview card when the pointer enters it.
     * @internal
     */
    function onCardHoverStart(): void {
      cardHovered.set(true);
      hoverBridge.clear();
      overlay()?.cancelPendingClose();
    }

    /**
     * Called by the preview card when the pointer leaves it.
     * @internal
     */
    function onCardHoverEnd(): void {
      cardHovered.set(false);

      if (!triggerHovered()) {
        hide();
      }
    }

    function show(): void {
      if (disabled()) {
        return;
      }

      // Create the overlay if it doesn't exist yet
      if (!overlay()) {
        createOverlayInstance();
      }

      overlay()?.show();
    }

    function hide(): void {
      hoverBridge.clear();
      overlay()?.hide();
    }

    function setContainer(newContainer: HTMLElement | string | null): void {
      container.set(newContainer);
    }

    function destroy(): void {
      hoverBridge.clear();
      overlay()?.destroy();
    }

    function createOverlayInstance(): void {
      const content = previewCard();

      if (!content) {
        throw new Error('Preview card must be either a TemplateRef or a ComponentType');
      }

      const config: NgpOverlayConfig<T> = {
        content,
        triggerElement: trigger.nativeElement,
        anchorElement: anchor(),
        injector,
        context,
        container: container(),
        placement,
        offset: offset(),
        flip: flip(),
        shift: shift(),
        showDelay: showDelay(),
        hideDelay: hideDelay(),
        closeOnEscape: true,
        closeOnOutsideClick: true,
        // A preview card never takes focus away from the trigger, so there is
        // nothing to restore and no focus to trap.
        restoreFocus: false,
        scrollBehaviour: scrollBehavior(),
        viewContainerRef,
        overlayType: 'preview-card',
        cooldown: cooldown(),
        onClose: () => onOpenChange?.(false),
      };

      overlay.set(createOverlay(config));
    }

    return {
      previewCard,
      disabled,
      placement,
      offset,
      showDelay,
      hideDelay,
      flip,
      shift,
      container: deprecatedSetter(container, 'setContainer', setContainer),
      anchor,
      context,
      scrollBehavior,
      cooldown,
      overlay,
      open,
      show,
      hide,
      onCardHoverStart,
      onCardHoverEnd,
      setContainer,
      destroy,
    } satisfies NgpPreviewCardTriggerState<T>;
  },
);

export function injectPreviewCardTriggerState<T>(
  options?: StateInjectionOptions,
): Signal<NgpPreviewCardTriggerState<T>> {
  return _injectPreviewCardTriggerState(options) as Signal<NgpPreviewCardTriggerState<T>>;
}

export type NgpPreviewCardPlacement =
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
