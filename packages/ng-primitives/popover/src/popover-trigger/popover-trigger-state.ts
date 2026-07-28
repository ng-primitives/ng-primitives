import { FocusOrigin } from '@angular/cdk/a11y';
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
import { injectElementRef } from 'ng-primitives/internal';
import {
  createOverlay,
  NgpDismissGuard,
  NgpFlip,
  NgpOffset,
  NgpOverlay,
  NgpOverlayConfig,
  NgpOverlayContent,
  NgpPlacement,
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

export interface NgpPopoverTriggerState<T> {
  /** Access the trigger element. */
  readonly elementRef: ElementRef;
  /** Access the popover template ref. */
  readonly popover: WritableSignal<NgpOverlayContent<T> | undefined>;
  /**
   * Define if the trigger should be disabled.
   * @default false
   */
  readonly disabled: WritableSignal<boolean>;
  /**
   * Define the placement of the popover relative to the trigger.
   * @default 'bottom'
   */
  readonly placement: WritableSignal<NgpPlacement>;
  /**
   * Define the offset of the popover relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 4
   */
  readonly offset: WritableSignal<NgpOffset>;
  /**
   * Define the delay before the popover is displayed.
   * @default 0
   */
  readonly showDelay: WritableSignal<number>;
  /**
   * Define the delay before the popover is hidden.
   * @default 0
   */
  readonly hideDelay: WritableSignal<number>;
  /**
   * Define whether the popover should flip when there is not enough space for the popover.
   * Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.
   * @default true
   */
  readonly flip: WritableSignal<NgpFlip>;
  /**
   * Configure shift behavior to keep the popover in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  readonly shift: WritableSignal<NgpShift>;
  /**
   * Define the container in which the popover should be attached.
   * @default document.body
   */
  readonly container: WritableSignal<HTMLElement | string | null>;
  /**
   * Define whether the popover should close when clicking outside of it, or a guard function.
   * @default true
   */
  readonly closeOnOutsideClick: WritableSignal<NgpDismissGuard<Element>>;
  /**
   * Define whether the popover should close when the escape key is pressed, or a guard function.
   * @default true
   */
  readonly closeOnEscape: WritableSignal<NgpDismissGuard<KeyboardEvent>>;
  /**
   * Defines how the popover behaves when the window is scrolled.
   * @default 'reposition'
   */
  readonly scrollBehavior: WritableSignal<'reposition' | 'block' | 'close'>;
  /**
   * Provide context to the popover. This can be used to pass data to the popover content.
   */
  readonly context: WritableSignal<T | undefined>;
  /**
   * Define an anchor element for positioning the popover.
   * If provided, the popover will be positioned relative to this element instead of the trigger.
   */
  readonly anchor: WritableSignal<HTMLElement | null>;
  /**
   * Define whether to track the trigger element position on every animation frame.
   * Useful for moving elements like slider thumbs.
   * @default false
   */
  readonly trackPosition: WritableSignal<boolean>;
  /**
   * Define the cooldown duration in milliseconds.
   * When moving from one popover to another within this duration,
   * the showDelay is skipped for the new popover.
   * @default 0
   */
  readonly cooldown: WritableSignal<number>;
  /**
   * The overlay that manages the popover
   * @internal
   */
  readonly overlay: Signal<NgpOverlay<T> | null>;
  /**
   * The open state of the popover.
   * @internal
   */
  readonly open: Signal<boolean>;
  /** Set the popover content. */
  setPopover: (popover: NgpOverlayContent<T> | undefined) => void;
  /** Set whether the trigger is disabled. */
  setDisabled: (disabled: boolean) => void;
  /** Set the placement of the popover relative to the trigger. */
  setPlacement: (placement: NgpPlacement) => void;
  /** Set the offset of the popover relative to the trigger. */
  setOffset: (offset: NgpOffset) => void;
  /** Set the delay before the popover is displayed. */
  setShowDelay: (showDelay: number) => void;
  /** Set the delay before the popover is hidden. */
  setHideDelay: (hideDelay: number) => void;
  /** Set the flip behaviour. */
  setFlip: (flip: NgpFlip) => void;
  /** Set the shift behaviour. */
  setShift: (shift: NgpShift) => void;
  /** Set the container in which the popover should be attached. */
  setContainer: (container: HTMLElement | string | null) => void;
  /** Set whether the popover closes when clicking outside of it, or a guard function. */
  setCloseOnOutsideClick: (closeOnOutsideClick: NgpDismissGuard<Element>) => void;
  /** Set whether the popover closes when the escape key is pressed, or a guard function. */
  setCloseOnEscape: (closeOnEscape: NgpDismissGuard<KeyboardEvent>) => void;
  /** Set how the popover behaves when the window is scrolled. */
  setScrollBehavior: (scrollBehavior: 'reposition' | 'block' | 'close') => void;
  /** Set the context passed to the popover content. */
  setContext: (context: T | undefined) => void;
  /** Set the anchor element the popover is positioned against. */
  setAnchor: (anchor: HTMLElement | null) => void;
  /** Set whether the trigger position is tracked on every animation frame. */
  setTrackPosition: (trackPosition: boolean) => void;
  /** Set the cooldown duration in milliseconds. */
  setCooldown: (cooldown: number) => void;
  /**
   * Show the popover.
   * @returns A promise that resolves when the popover has been shown
   */
  show: () => Promise<void>;
  /**
   * @internal
   * Hide the popover.
   * @returns A promise that resolves when the popover has been hidden
   */
  hide: (origin?: FocusOrigin) => Promise<void>;
}

export interface NgpPopoverTriggerProps<T> {
  /** Access the popover template ref. */
  readonly popover?: Signal<NgpOverlayContent<T> | undefined>;
  /**
   * Define if the trigger should be disabled.
   * @default false
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Define the placement of the popover relative to the trigger.
   * @default 'bottom'
   */
  readonly placement?: Signal<NgpPlacement>;
  /**
   * Define the offset of the popover relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 4
   */
  readonly offset?: Signal<NgpOffset>;
  /**
   * Define the delay before the popover is displayed.
   * @default 0
   */
  readonly showDelay?: Signal<number>;
  /**
   * Define the delay before the popover is hidden.
   * @default 0
   */
  readonly hideDelay?: Signal<number>;
  /**
   * Define whether the popover should flip when there is not enough space for the popover.
   * Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.
   * @default true
   */
  readonly flip?: Signal<NgpFlip>;
  /**
   * Configure shift behavior to keep the popover in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  readonly shift?: Signal<NgpShift>;
  /**
   * Define the container in which the popover should be attached.
   * @default document.body
   */
  readonly container?: Signal<HTMLElement | string | null>;
  /**
   * Define whether the popover should close when clicking outside of it, or a guard function.
   * @default true
   */
  readonly closeOnOutsideClick?: Signal<NgpDismissGuard<Element>>;
  /**
   * Define whether the popover should close when the escape key is pressed, or a guard function.
   * @default true
   */
  readonly closeOnEscape?: Signal<NgpDismissGuard<KeyboardEvent>>;
  /**
   * Defines how the popover behaves when the window is scrolled.
   * @default 'reposition'
   */
  readonly scrollBehavior?: Signal<'reposition' | 'block' | 'close'>;
  /**
   * Provide context to the popover. This can be used to pass data to the popover content.
   */
  readonly context?: Signal<T | undefined>;
  /**
   * Define an anchor element for positioning the popover.
   * If provided, the popover will be positioned relative to this element instead of the trigger.
   */
  readonly anchor?: Signal<HTMLElement | null>;
  /**
   * Define whether to track the trigger element position on every animation frame.
   * Useful for moving elements like slider thumbs.
   * @default false
   */
  readonly trackPosition?: Signal<boolean>;
  /**
   * Define the cooldown duration in milliseconds.
   * When moving from one popover to another within this duration,
   * the showDelay is skipped for the new popover.
   * @default 0
   */
  readonly cooldown?: Signal<number>;
  /** Callback fired when the open state changes.  */
  readonly onOpenChange?: (value: boolean) => void;
}

export const [
  NgpPopoverTriggerStateToken,
  ngpPopoverTrigger,
  _injectPopoverTriggerState,
  providePopoverTriggerState,
] = createPrimitive(
  'NgpPopoverTrigger',
  <T>({
    popover: _popover,
    disabled: _disabled,
    placement: _placement,
    offset: _offset,
    showDelay: _showDelay,
    hideDelay: _hideDelay,
    flip: _flip,
    shift: _shift,
    container: _container,
    closeOnOutsideClick: _closeOnOutsideClick,
    closeOnEscape: _closeOnEscape,
    scrollBehavior: _scrollBehavior,
    context: _context,
    anchor: _anchor,
    trackPosition: _trackPosition,
    cooldown: _cooldown,
    onOpenChange,
  }: NgpPopoverTriggerProps<T>): NgpPopoverTriggerState<T> => {
    const elementRef = injectElementRef<HTMLElement>();
    const viewContainerRef = inject(ViewContainerRef);
    const injector = inject(Injector);

    // Every input is wrapped so the state can expose a setter for it - see the
    // setter block at the bottom of the factory.
    const popover = controlled<NgpOverlayContent<T> | undefined>(_popover, undefined);
    const disabled = controlled(_disabled, false);
    const placement = controlled<NgpPlacement>(_placement, 'bottom');
    const offset = controlled<NgpOffset>(_offset, 4);
    const showDelay = controlled(_showDelay, 0);
    const hideDelay = controlled(_hideDelay, 0);
    const flip = controlled<NgpFlip>(_flip, true);
    const shift = controlled<NgpShift>(_shift, undefined);
    const container = controlled<HTMLElement | string | null>(_container, 'body');
    const closeOnOutsideClick = controlled<NgpDismissGuard<Element>>(_closeOnOutsideClick, true);
    const closeOnEscape = controlled<NgpDismissGuard<KeyboardEvent>>(_closeOnEscape, true);
    const scrollBehavior = controlled<'reposition' | 'block' | 'close'>(
      _scrollBehavior,
      'reposition',
    );
    const context = controlled<T | undefined>(_context, undefined);
    const anchor = controlled<HTMLElement | null>(_anchor, null);
    const trackPosition = controlled(_trackPosition, false);
    const cooldown = controlled(_cooldown, 0);

    const overlay = signal<NgpOverlay<T> | null>(null);
    const open = computed(() => overlay()?.isOpen() ?? false);

    // Host binding
    attrBinding(elementRef, 'aria-expanded', () => (open() ? 'true' : 'false'));
    // the popover is a focus-trapped, dialog-like overlay, so advertise the popup type
    attrBinding(elementRef, 'aria-haspopup', 'dialog');
    attrBinding(elementRef, 'aria-describedby', () => overlay()?.ariaDescribedBy());
    // reference the controlled popover by id while it is open (it does not exist when closed)
    attrBinding(elementRef, 'aria-controls', () => (open() ? (overlay()?.id() ?? null) : null));
    dataBinding(elementRef, 'data-open', open);
    dataBinding(elementRef, 'data-placement', placement);
    dataBinding(elementRef, 'data-disabled', disabled);

    // Event listener
    listener(elementRef, 'click', toggle);

    // Tearing the overlay down closes it, but a destroyed directive can no longer
    // emit through `openChange` (Angular NG0953), so skip the notification.
    let destroyed = false;

    onDestroy(() => {
      destroyed = true;
      overlay()?.destroy();
    });

    function createOverlayInstance(): void {
      const popoverInstance = popover();

      if (!popoverInstance) {
        throw new Error('Popover must be either a TemplateRef or a ComponentType');
      }

      // Create config for the overlay
      const config: NgpOverlayConfig<T> = {
        content: popover,
        triggerElement: elementRef.nativeElement,
        anchorElement: anchor(),
        injector: injector,
        context: context,
        container: container(),
        placement: placement,
        offset: offset(),
        flip: flip(),
        shift: shift(),
        showDelay: showDelay(),
        hideDelay: hideDelay(),
        closeOnOutsideClick: closeOnOutsideClick(),
        closeOnEscape: closeOnEscape(),
        restoreFocus: true,
        scrollBehaviour: scrollBehavior(),
        viewContainerRef: viewContainerRef,
        trackPosition: trackPosition(),
        overlayType: 'popover',
        cooldown: cooldown(),
        onClose: () => {
          if (!destroyed) {
            onOpenChange?.(false);
          }
        },
      };

      overlay.set(createOverlay(config));
    }

    function toggle(event: MouseEvent): void {
      // if the trigger is disabled then do not toggle the popover
      if (disabled()) {
        return;
      }

      // determine the origin of the event, 0 is keyboard, 1 is mouse
      const origin: FocusOrigin = event.detail === 0 ? 'keyboard' : 'mouse';

      // if the popover is open then hide it
      if (open()) {
        hide(origin);
      } else {
        show();
      }
    }

    async function show(): Promise<void> {
      // If the trigger is disabled, don't show the popover
      if (disabled()) {
        return;
      }

      // Create the overlay if it doesn't exist yet
      if (!overlay()) {
        createOverlayInstance();
      }

      // Show the overlay
      await overlay()?.show();

      if (open()) {
        onOpenChange?.(true);
      }
    }

    async function hide(origin: FocusOrigin = 'program'): Promise<void> {
      // If the trigger is disabled or the popover is not open, do nothing
      if (disabled() || !open()) {
        return;
      }

      // Hide the overlay
      await overlay()?.hide({ origin });
    }

    function setPopover(newPopover: NgpOverlayContent<T> | undefined): void {
      popover.set(newPopover);
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

    function setCloseOnOutsideClick(guard: NgpDismissGuard<Element>): void {
      closeOnOutsideClick.set(guard);
    }

    function setCloseOnEscape(guard: NgpDismissGuard<KeyboardEvent>): void {
      closeOnEscape.set(guard);
    }

    function setScrollBehavior(behavior: 'reposition' | 'block' | 'close'): void {
      scrollBehavior.set(behavior);
    }

    function setContext(newContext: T | undefined): void {
      context.set(newContext);
    }

    function setAnchor(newAnchor: HTMLElement | null): void {
      anchor.set(newAnchor);
    }

    function setTrackPosition(shouldTrack: boolean): void {
      trackPosition.set(shouldTrack);
    }

    function setCooldown(duration: number): void {
      cooldown.set(duration);
    }

    return {
      elementRef,
      popover: deprecatedSetter(popover, 'setPopover', setPopover),
      disabled: deprecatedSetter(disabled, 'setDisabled', setDisabled),
      placement: deprecatedSetter(placement, 'setPlacement', setPlacement),
      offset: deprecatedSetter(offset, 'setOffset', setOffset),
      showDelay: deprecatedSetter(showDelay, 'setShowDelay', setShowDelay),
      hideDelay: deprecatedSetter(hideDelay, 'setHideDelay', setHideDelay),
      flip: deprecatedSetter(flip, 'setFlip', setFlip),
      shift: deprecatedSetter(shift, 'setShift', setShift),
      container: deprecatedSetter(container, 'setContainer', setContainer),
      closeOnOutsideClick: deprecatedSetter(
        closeOnOutsideClick,
        'setCloseOnOutsideClick',
        setCloseOnOutsideClick,
      ),
      closeOnEscape: deprecatedSetter(closeOnEscape, 'setCloseOnEscape', setCloseOnEscape),
      scrollBehavior: deprecatedSetter(scrollBehavior, 'setScrollBehavior', setScrollBehavior),
      context: deprecatedSetter(context, 'setContext', setContext),
      anchor: deprecatedSetter(anchor, 'setAnchor', setAnchor),
      trackPosition: deprecatedSetter(trackPosition, 'setTrackPosition', setTrackPosition),
      cooldown: deprecatedSetter(cooldown, 'setCooldown', setCooldown),
      overlay,
      open,
      setPopover,
      setDisabled,
      setPlacement,
      setOffset,
      setShowDelay,
      setHideDelay,
      setFlip,
      setShift,
      setContainer,
      setCloseOnOutsideClick,
      setCloseOnEscape,
      setScrollBehavior,
      setContext,
      setAnchor,
      setTrackPosition,
      setCooldown,
      show,
      hide,
    } satisfies NgpPopoverTriggerState<T>;
  },
);

export function injectPopoverTriggerState<T>(
  options?: StateInjectionOptions,
): Signal<NgpPopoverTriggerState<T>> {
  return _injectPopoverTriggerState(options) as Signal<NgpPopoverTriggerState<T>>;
}

/**
 * Where the popover is placed relative to its trigger.
 * @deprecated Identical to `NgpPlacement` from `ng-primitives/portal` - use that instead.
 * Will be removed in a future major.
 */
export type NgpPopoverPlacement = NgpPlacement;
