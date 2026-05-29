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
  NgpShift,
} from 'ng-primitives/portal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  listener,
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
  readonly disabled: Signal<boolean>;
  /**
   * Define the placement of the popover relative to the trigger.
   * @default 'top'
   */
  readonly placement: Signal<NgpPopoverPlacement>;
  /**
   * Define the offset of the popover relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 0
   */
  readonly offset: Signal<NgpOffset>;
  /**
   * Define the delay before the popover is displayed.
   * @default 0
   */
  readonly showDelay: Signal<number>;
  /**
   * Define the delay before the popover is hidden.
   * @default 0
   */
  readonly hideDelay: Signal<number>;
  /**
   * Define whether the popover should flip when there is not enough space for the popover.
   * Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.
   * @default true
   */
  readonly flip: Signal<NgpFlip>;
  /**
   * Configure shift behavior to keep the popover in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  readonly shift: Signal<NgpShift>;
  /**
   * Define the container in which the popover should be attached.
   * @default document.body
   */
  readonly container: Signal<HTMLElement | string | null>;
  /**
   * Define whether the popover should close when clicking outside of it, or a guard function.
   * @default true
   */
  readonly closeOnOutsideClick: Signal<NgpDismissGuard<Element>>;
  /**
   * Define whether the popover should close when the escape key is pressed, or a guard function.
   * @default true
   */
  readonly closeOnEscape: Signal<NgpDismissGuard<KeyboardEvent>>;
  /**
   * Defines how the popover behaves when the window is scrolled.
   * @default 'reposition'
   */
  readonly scrollBehavior: Signal<'reposition' | 'block' | 'close'>;
  /**
   * Provide context to the popover. This can be used to pass data to the popover content.
   */
  readonly context: Signal<T | undefined>;
  /**
   * Define an anchor element for positioning the popover.
   * If provided, the popover will be positioned relative to this element instead of the trigger.
   */
  readonly anchor: Signal<HTMLElement | null>;
  /**
   * Define whether to track the trigger element position on every animation frame.
   * Useful for moving elements like slider thumbs.
   * @default false
   */
  readonly trackPosition: Signal<boolean>;
  /**
   * Define the cooldown duration in milliseconds.
   * When moving from one popover to another within this duration,
   * the showDelay is skipped for the new popover.
   * @default 0
   */
  readonly cooldown: Signal<number>;
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
  /** @internal onDestroy callback */
  destroy: () => void;
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
  hide: (origin: FocusOrigin) => Promise<void>;
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
   * @default 'top'
   */
  readonly placement?: Signal<NgpPopoverPlacement>;
  /**
   * Define the offset of the popover relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 0
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
    popover: _popover = signal<NgpOverlayContent<T> | undefined>(undefined),
    disabled = signal<boolean>(false),
    placement = signal<NgpPopoverPlacement>('bottom'),
    offset = signal<NgpOffset>(4),
    showDelay = signal<number>(0),
    hideDelay = signal<number>(0),
    flip = signal<NgpFlip>(true),
    shift = signal<NgpShift>(undefined),
    container = signal<HTMLElement | string | null>('body'),
    closeOnOutsideClick = signal<NgpDismissGuard<Element>>(true),
    closeOnEscape = signal<NgpDismissGuard<KeyboardEvent>>(true),
    scrollBehavior = signal<'reposition' | 'block' | 'close'>('reposition'),
    context = signal<T | undefined>(undefined),
    anchor = signal<HTMLElement | null>(null),
    trackPosition = signal<boolean>(false),
    cooldown = signal<number>(0),
    onOpenChange,
  }: NgpPopoverTriggerProps<T>): NgpPopoverTriggerState<T> => {
    const elementRef = injectElementRef<HTMLElement>();
    const viewContainerRef = inject(ViewContainerRef);
    const injector = inject(Injector);

    const popover = controlled(_popover);

    const overlay = signal<NgpOverlay<T> | null>(null);
    const open = computed(() => overlay()?.isOpen() ?? false);

    // Host binding
    attrBinding(elementRef, 'aria-expanded', () => (open() ? 'true' : 'false'));
    attrBinding(elementRef, 'aria-describedby', () => overlay()?.ariaDescribedBy());
    dataBinding(elementRef, 'data-open', open);
    dataBinding(elementRef, 'data-placement', placement);
    dataBinding(elementRef, 'data-disabled', disabled);

    // Event listener
    listener(elementRef, 'click', toggle);

    function destroy(): void {
      overlay()?.destroy();
    }

    function createOverlayInstance(): void {
      const popoverInstance = popover();

      if (!popoverInstance) {
        throw new Error('Popover must be either a TemplateRef or a ComponentType');
      }

      // Create config for the overlay
      const config: NgpOverlayConfig<T> = {
        content: popoverInstance,
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
        onClose: () => onOpenChange?.(false),
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

    async function hide(origin: FocusOrigin): Promise<void> {
      // If the trigger is disabled or the popover is not open, do nothing
      if (disabled() || !open()) {
        return;
      }

      // Hide the overlay
      await overlay()?.hide({ origin });
    }

    return {
      elementRef,
      popover,
      disabled,
      placement,
      offset,
      showDelay,
      hideDelay,
      flip,
      shift,
      container,
      closeOnOutsideClick,
      closeOnEscape,
      scrollBehavior,
      context,
      anchor,
      trackPosition,
      cooldown,
      overlay,
      open,
      destroy,
      show,
      hide,
    } satisfies NgpPopoverTriggerState<T>;
  },
);

export function injectPopoverTriggerState<T>(): Signal<NgpPopoverTriggerState<T>>;
export function injectPopoverTriggerState<T>(options?: {
  hoisted?: boolean;
  optional?: boolean;
  skipSelf?: boolean;
}): Signal<NgpPopoverTriggerState<T>>;
export function injectPopoverTriggerState<T>(
  options?:
    | {
        hoisted?: boolean;
        optional?: boolean;
        skipSelf?: boolean;
      }
    | undefined,
): Signal<NgpPopoverTriggerState<T>> {
  return _injectPopoverTriggerState(options) as Signal<NgpPopoverTriggerState<T>>;
}

export type NgpPopoverPlacement =
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
