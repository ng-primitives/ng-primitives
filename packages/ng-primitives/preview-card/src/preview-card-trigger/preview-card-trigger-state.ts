import { FocusMonitor } from '@angular/cdk/a11y';
import { computed, inject, Injector, signal, Signal, ViewContainerRef } from '@angular/core';
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
  listener,
  onDestroy,
  StateInjectionOptions,
} from 'ng-primitives/state';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';

export interface NgpPreviewCardTriggerState<T> {
  /**
   * The content rendered inside the preview card. Readonly so that the content has a
   * single mutation path - use `setPreviewCard`.
   */
  readonly previewCard: Signal<NgpOverlayContent<T> | undefined>;
  /**
   * The container the preview card is attached to. Readonly - use `setContainer`.
   * @default document.body
   */
  readonly container: Signal<HTMLElement | string | null>;
  /** Whether the preview card is currently open. */
  readonly open: Signal<boolean>;
  /**
   * Set the content rendered inside the preview card. This is how a reusable component
   * wires its own card component into the trigger. Takes effect the next time the card
   * is shown; it does not swap the content of a card that is already visible.
   * @param content - The template or component to render
   */
  setPreviewCard: (content: NgpOverlayContent<T> | undefined) => void;
  /**
   * Set the container the preview card is attached to. Takes effect the next time the
   * card is shown; it does not move a card that is already visible.
   * @param container - The new container
   */
  setContainer: (container: HTMLElement | string | null) => void;
  /** Show the preview card. */
  show: () => void;
  /** Hide the preview card. */
  hide: () => void;
  /**
   * Called by the preview card as the pointer enters and leaves it, so the trigger can
   * keep the card open while the pointer is inside it.
   * @internal
   */
  setPointerOverCard: (isOver: boolean) => void;
  /**
   * Called by the preview card when focus leaves it.
   * @internal
   */
  onCardFocusOut: (next: EventTarget | null) => void;
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
    const viewContainerRef = inject(ViewContainerRef);
    const injector = inject(Injector);
    const focusMonitor = inject(FocusMonitor);

    const previewCard = controlled(_previewCard);
    const container = controlled(_container, 'body');

    const overlay = signal<NgpOverlay<T> | null>(null);
    const open = computed(() => overlay()?.isOpen() ?? false);

    // The overlay tears itself down on the trigger's DestroyRef, and that teardown runs
    // its close callback. Emitting `openChange` at that point is meaningless - nobody
    // listens to a destroyed directive - and Angular warns (NG0953). This hook is
    // registered while the state is created, whereas the overlay registers its own when
    // it is first shown, so this one always runs first.
    let destroyed = false;
    onDestroy(() => {
      destroyed = true;
      // Unsubscribing does not remove the element from FocusMonitor's registry, so the
      // element info and its root-node listeners have to be released explicitly.
      focusMonitor.stopMonitoring(elementRef.nativeElement);
    });

    // Two show() calls inside the show delay both settle when that single open
    // completes, so track what has been announced rather than what was open per call.
    let announcedOpen = false;

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
    listener(elementRef, 'focusout', event => onFocusOut(event.relatedTarget));

    // Focus is how a sighted keyboard user reaches a preview card - without it they
    // get nothing at all. Only keyboard focus opens it, though: a tap on a touch
    // device focuses the link too, and a pointer press that focuses the trigger
    // would re-open a card the user has just dismissed. Deriving this from
    // FocusMonitor's origin covers both without preventing default on touchstart.
    focusMonitor
      .monitor(elementRef.nativeElement)
      .pipe(safeTakeUntilDestroyed())
      .subscribe(origin => {
        if (origin === 'keyboard') {
          show();
        }
      });

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
        triggerRect: elementRef.nativeElement.getBoundingClientRect(),
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
     * Close when focus lands outside both the trigger and the card.
     *
     * The card root is out of the tab sequence but anything focusable inside it stays
     * reachable, so tabbing into the card must not tear it out from under the user.
     * Serves the trigger's own focusout and, forwarded by the card, focus leaving the
     * card - which is portalled outside the trigger so its events never reach here.
     */
    function onFocusOut(next: EventTarget | null): void {
      if (next instanceof Node && isInsidePreviewCard(next)) {
        return;
      }

      hide();
    }

    /** Whether a node is the trigger, the card, or inside either of them. */
    function isInsidePreviewCard(node: Node): boolean {
      if (elementRef.nativeElement.contains(node)) {
        return true;
      }

      return (
        overlay()
          ?.getElements()
          .some(element => element.contains(node)) ?? false
      );
    }

    /**
     * Called by the preview card as the pointer enters and leaves it.
     * @internal
     */
    function setPointerOverCard(isOver: boolean): void {
      cardHovered.set(isOver);

      if (isOver) {
        // The pointer made it across, so the corridor has done its job.
        hoverBridge.clear();
        overlay()?.cancelPendingClose();
        return;
      }

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
        if (!previewCard()) {
          if (ngDevMode) {
            console.error(
              '[ngpPreviewCardTrigger]: Preview card must be a TemplateRef or a ComponentType.',
            );
          }

          // Hover and keyboard focus reach show() on their own, so throwing here would
          // fire on interaction - and from the focus subscription it would tear that
          // subscription down, leaving the trigger permanently inert.
          return;
        }

        createOverlayInstance(previewCard()!);
      }

      // Only announce an open that actually happened, and only once. show() is reached
      // from both the pointer and the focus path, so two calls can be waiting on the
      // same scheduled open - and it may be cancelled before it ever appears.
      overlay()
        ?.show()
        .then(() => {
          if (open() && !announcedOpen) {
            announcedOpen = true;
            onOpenChange?.(true);
          }
        });
    }

    function hide(): void {
      hoverBridge.clear();
      overlay()?.hide();
    }

    function setContainer(newContainer: HTMLElement | string | null): void {
      container.set(newContainer);
    }

    function setPreviewCard(content: NgpOverlayContent<T> | undefined): void {
      previewCard.set(content);
    }

    function createOverlayInstance(content: NgpOverlayContent<T>): void {
      const config: NgpOverlayConfig<T> = {
        content,
        triggerElement: elementRef.nativeElement,
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
        onClose: () => {
          announcedOpen = false;

          if (!destroyed) {
            onOpenChange?.(false);
          }
        },
      };

      overlay.set(createOverlay(config));
    }

    return {
      previewCard: previewCard.asReadonly(),
      container: container.asReadonly(),
      open,
      setPreviewCard,
      setContainer,
      show,
      hide,
      setPointerOverCard,
      onCardFocusOut: onFocusOut,
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
