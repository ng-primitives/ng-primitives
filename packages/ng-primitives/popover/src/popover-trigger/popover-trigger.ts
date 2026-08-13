import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute, output } from '@angular/core';
import {
  coerceFlip,
  dismissGuardAttribute,
  NgpDismissGuard,
  NgpDismissGuardInput,
  NgpFlip,
  NgpFlipInput,
  NgpOverlayContent,
  NgpPlacement,
  coerceOffset,
  NgpOffset,
  NgpOffsetInput,
  coerceShift,
  NgpShift,
  NgpShiftInput,
} from 'ng-primitives/portal';
import { injectPopoverConfig } from '../config/popover-config';
import { ngpPopoverTrigger, providePopoverTriggerState } from './popover-trigger-state';

/**
 * Apply the `ngpPopoverTrigger` directive to an element that triggers the popover to show.
 */
@Directive({
  selector: '[ngpPopoverTrigger]',
  exportAs: 'ngpPopoverTrigger',
  providers: [providePopoverTriggerState({ inherit: false })],
})
export class NgpPopoverTrigger<T = null> {
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
  readonly placement = input<NgpPlacement>(this.config.placement, {
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
   * Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.
   * @default true
   */
  readonly flip = input<NgpFlip, NgpFlipInput>(this.config.flip, {
    alias: 'ngpPopoverTriggerFlip',
    transform: coerceFlip,
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
   * Define whether the popover should close when clicking outside of it, or a guard function.
   * @default true
   */
  readonly closeOnOutsideClick = input<NgpDismissGuard<Element>, NgpDismissGuardInput<Element>>(
    this.config.closeOnOutsideClick,
    {
      alias: 'ngpPopoverTriggerCloseOnOutsideClick',
      transform: dismissGuardAttribute,
    },
  );

  /**
   * Define whether the popover should close when the escape key is pressed, or a guard function.
   * @default true
   */
  readonly closeOnEscape = input<
    NgpDismissGuard<KeyboardEvent>,
    NgpDismissGuardInput<KeyboardEvent>
  >(this.config.closeOnEscape, {
    alias: 'ngpPopoverTriggerCloseOnEscape',
    transform: dismissGuardAttribute,
  });

  /**
   * Defines how the popover behaves when the window is scrolled.
   * @default 'reposition'
   */
  readonly scrollBehavior = input<'reposition' | 'block' | 'close'>(this.config.scrollBehavior, {
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
   *
   * The anchor is live, so rebinding it moves an open popover. When the new anchor comes
   * from a press, bind it on `mousedown` rather than `click` - outside-press dismissal is
   * decided on a capture-phase `mouseup`, so an anchor arriving with `click` is too late.
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
   * When true, hiding the popover removes its content from the DOM but keeps the
   * underlying component/view instance alive in memory instead of destroying it - a
   * later show reuses the same instance rather than creating a new one, so the content
   * is not re-instantiated and any one-time setup (e.g. a network fetch) is not repeated.
   * The kept-alive view stays attached to change detection while it is hidden.
   * @default false
   */
  readonly keepMounted = input<boolean, BooleanInput>(this.config.keepMounted, {
    alias: 'ngpPopoverTriggerKeepMounted',
    transform: booleanAttribute,
  });

  /**
   * Event emitted when the popover open state changes.
   */
  readonly openChange = output<boolean>({
    alias: 'ngpPopoverTriggerOpenChange',
  });

  /**
   * The popover trigger state.
   */
  protected readonly state = ngpPopoverTrigger({
    popover: this.popover,
    disabled: this.disabled,
    placement: this.placement,
    offset: this.offset,
    showDelay: this.showDelay,
    hideDelay: this.hideDelay,
    flip: this.flip,
    shift: this.shift,
    container: this.container,
    closeOnOutsideClick: this.closeOnOutsideClick,
    closeOnEscape: this.closeOnEscape,
    scrollBehavior: this.scrollBehavior,
    context: this.context,
    anchor: this.anchor,
    trackPosition: this.trackPosition,
    cooldown: this.cooldown,
    keepMounted: this.keepMounted,
    onOpenChange: (value: boolean) => this.openChange.emit(value),
  });

  /**
   * Show the popover.
   * @returns A promise that resolves when the popover has been shown
   */
  show(): Promise<void> {
    return this.state.show();
  }

  /**
   * @internal
   * Hide the popover.
   * @returns A promise that resolves when the popover has been hidden
   */
  hide(origin: FocusOrigin = 'program'): Promise<void> {
    return this.state.hide(origin);
  }
}
