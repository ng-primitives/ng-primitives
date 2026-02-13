import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  Directive,
  inject,
  Injector,
  input,
  numberAttribute,
  OnDestroy,
  output,
  signal,
  ViewContainerRef,
} from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  createOverlay,
  NgpOverlay,
  NgpOverlayConfig,
  NgpOverlayContent,
  coerceOffset,
  NgpOffset,
  NgpOffsetInput,
  coerceShift,
  NgpShift,
  NgpShiftInput,
} from 'ng-primitives/portal';
import { injectPopoverConfig } from '../config/popover-config';
import { popoverTriggerState, providePopoverTriggerState } from './popover-trigger-state';

/**
 * Apply the `ngpPopoverTrigger` directive to an element that triggers the popover to show.
 */
@Directive({
  selector: '[ngpPopoverTrigger]',
  exportAs: 'ngpPopoverTrigger',
  providers: [providePopoverTriggerState({ inherit: false })],
  host: {
    '[attr.aria-expanded]': 'open() ? "true" : "false"',
    '[attr.data-open]': 'open() ? "" : null',
    '[attr.data-placement]': 'state.placement()',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
    '[attr.aria-describedby]': 'overlay()?.ariaDescribedBy()',
    '(click)': 'toggle($event)',
  },
})
export class NgpPopoverTrigger<T = null> implements OnDestroy {
  /**
   * Access the trigger element
   */
  private readonly trigger = injectElementRef();

  /**
   * Access the injector.
   */
  private readonly injector = inject(Injector);

  /**
   * Access the view container reference.
   */
  private readonly viewContainerRef = inject(ViewContainerRef);

  /**
   * Access the global popover configuration.
   */
  private readonly config = injectPopoverConfig();

  /**
   * Access the popover template ref.
   */
  readonly popover = input<NgpOverlayContent<T>>(undefined, {
    alias: 'ngpPopoverTrigger',
  });

  /**
   * Define if the trigger should be disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPopoverTriggerDisabled',
    transform: booleanAttribute,
  });

  /**
   * Define the placement of the popover relative to the trigger.
   * @default 'top'
   */
  readonly placement = input<NgpPopoverPlacement>(this.config.placement, {
    alias: 'ngpPopoverTriggerPlacement',
  });

  /**
   * Define the offset of the popover relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 0
   */
  readonly offset = input<NgpOffset, NgpOffsetInput>(this.config.offset, {
    alias: 'ngpPopoverTriggerOffset',
    transform: coerceOffset,
  });

  /**
   * Define the delay before the popover is displayed.
   * @default 0
   */
  readonly showDelay = input<number, NumberInput>(this.config.showDelay, {
    alias: 'ngpPopoverTriggerShowDelay',
    transform: numberAttribute,
  });

  /**
   * Define the delay before the popover is hidden.
   * @default 0
   */
  readonly hideDelay = input<number, NumberInput>(this.config.hideDelay, {
    alias: 'ngpPopoverTriggerHideDelay',
    transform: numberAttribute,
  });

  /**
   * Define whether the popover should flip when there is not enough space for the popover.
   * @default true
   */
  readonly flip = input<boolean, BooleanInput>(this.config.flip, {
    alias: 'ngpPopoverTriggerFlip',
    transform: booleanAttribute,
  });

  /**
   * Configure shift behavior to keep the popover in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  readonly shift = input<NgpShift, NgpShiftInput>(this.config.shift, {
    alias: 'ngpPopoverTriggerShift',
    transform: coerceShift,
  });

  /**
   * Define the container in which the popover should be attached.
   * @default document.body
   */
  readonly container = input<HTMLElement | string | null>(this.config.container, {
    alias: 'ngpPopoverTriggerContainer',
  });

  /**
   * Define whether the popover should close when clicking outside of it.
   * @default true
   */
  readonly closeOnOutsideClick = input<boolean, BooleanInput>(this.config.closeOnOutsideClick, {
    alias: 'ngpPopoverTriggerCloseOnOutsideClick',
    transform: booleanAttribute,
  });

  /**
   * Define whether the popover should close when the escape key is pressed.
   * @default true
   */
  readonly closeOnEscape = input<boolean, BooleanInput>(this.config.closeOnEscape, {
    alias: 'ngpPopoverTriggerCloseOnEscape',
    transform: booleanAttribute,
  });

  /**
   * Defines how the popover behaves when the window is scrolled.
   * @default 'reposition'
   */
  readonly scrollBehavior = input<'reposition' | 'block'>(this.config.scrollBehavior, {
    alias: 'ngpPopoverTriggerScrollBehavior',
  });

  /**
   * Provide context to the popover. This can be used to pass data to the popover content.
   */
  readonly context = input<T>(undefined, {
    alias: 'ngpPopoverTriggerContext',
  });

  /**
   * Define an anchor element for positioning the popover.
   * If provided, the popover will be positioned relative to this element instead of the trigger.
   */
  readonly anchor = input<HTMLElement | null>(null, {
    alias: 'ngpPopoverTriggerAnchor',
  });

  /**
   * Define whether to track the trigger element position on every animation frame.
   * Useful for moving elements like slider thumbs.
   * @default false
   */
  readonly trackPosition = input<boolean, BooleanInput>(this.config.trackPosition, {
    alias: 'ngpPopoverTriggerTrackPosition',
    transform: booleanAttribute,
  });

  /**
   * Define the cooldown duration in milliseconds.
   * When moving from one popover to another within this duration,
   * the showDelay is skipped for the new popover.
   * @default 0
   */
  readonly cooldown = input<number, NumberInput>(this.config.cooldown, {
    alias: 'ngpPopoverTriggerCooldown',
    transform: numberAttribute,
  });

  /**
   * The overlay that manages the popover
   * @internal
   */
  readonly overlay = signal<NgpOverlay<T> | null>(null);

  /**
   * The open state of the popover.
   * @internal
   */
  readonly open = computed(() => this.overlay()?.isOpen() ?? false);

  /**
   * Event emitted when the popover open state changes.
   */
  readonly openChange = output<boolean>({
    alias: 'ngpPopoverTriggerOpenChange',
  });

  /**
   * The popover trigger state.
   */
  readonly state = popoverTriggerState<NgpPopoverTrigger<T>>(this);

  ngOnDestroy(): void {
    this.overlay()?.destroy();
  }

  protected toggle(event: MouseEvent): void {
    // if the trigger is disabled then do not toggle the popover
    if (this.state.disabled()) {
      return;
    }

    // determine the origin of the event, 0 is keyboard, 1 is mouse
    const origin: FocusOrigin = event.detail === 0 ? 'keyboard' : 'mouse';

    // if the popover is open then hide it
    if (this.open()) {
      this.hide(origin);
    } else {
      this.show();
    }
  }

  /**
   * Show the popover.
   * @returns A promise that resolves when the popover has been shown
   */
  async show(): Promise<void> {
    // If the trigger is disabled, don't show the popover
    if (this.state.disabled()) {
      return;
    }

    // Create the overlay if it doesn't exist yet
    if (!this.overlay()) {
      this.createOverlay();
    }

    // Show the overlay
    await this.overlay()?.show();

    if (this.open()) {
      this.openChange.emit(true);
    }
  }

  /**
   * @internal
   * Hide the popover.
   * @returns A promise that resolves when the popover has been hidden
   */
  async hide(origin: FocusOrigin = 'program'): Promise<void> {
    // If the trigger is disabled or the popover is not open, do nothing
    if (this.state.disabled() || !this.open()) {
      return;
    }

    // Hide the overlay
    await this.overlay()?.hide({ origin });
  }

  /**
   * Create the overlay that will contain the popover
   */
  private createOverlay(): void {
    const popover = this.state.popover();

    if (!popover) {
      throw new Error('Popover must be either a TemplateRef or a ComponentType');
    }

    // Create config for the overlay
    const config: NgpOverlayConfig<T> = {
      content: popover,
      triggerElement: this.trigger.nativeElement,
      anchorElement: this.state.anchor(),
      injector: this.injector,
      context: this.state.context,
      container: this.state.container(),
      placement: this.state.placement,
      offset: this.state.offset(),
      flip: this.state.flip(),
      shift: this.state.shift(),
      showDelay: this.state.showDelay(),
      hideDelay: this.state.hideDelay(),
      closeOnOutsideClick: this.state.closeOnOutsideClick(),
      closeOnEscape: this.state.closeOnEscape(),
      restoreFocus: true,
      scrollBehaviour: this.state.scrollBehavior(),
      viewContainerRef: this.viewContainerRef,
      trackPosition: this.state.trackPosition(),
      overlayType: 'popover',
      cooldown: this.state.cooldown(),
      onClose: () => {
        if (this.open()) {
          this.openChange.emit(false);
        }
      },
    };

    this.overlay.set(createOverlay(config));
  }
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
