import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute } from '@angular/core';
import { Placement } from '@floating-ui/dom';
import {
  coerceOffset,
  coerceShift,
  NgpOffset,
  NgpOffsetInput,
  NgpOverlayContent,
  NgpShift,
  NgpShiftInput,
} from 'ng-primitives/portal';
import { ngpRovingFocusItem, provideRovingFocusItemState } from 'ng-primitives/roving-focus';
import { injectNavigationMenuConfig } from '../config/navigation-menu-config';
import {
  ngpNavigationMenuTrigger,
  provideNavigationMenuTriggerState,
} from './navigation-menu-trigger-state';

/**
 * The `NgpNavigationMenuTrigger` directive is a button that opens navigation menu content.
 * It supports hover and focus interactions with configurable delays.
 */
@Directive({
  selector: '[ngpNavigationMenuTrigger]',
  exportAs: 'ngpNavigationMenuTrigger',
  providers: [provideNavigationMenuTriggerState(), provideRovingFocusItemState()],
  host: {
    type: 'button',
  },
})
export class NgpNavigationMenuTrigger {
  /**
   * Access the global navigation menu configuration.
   */
  private readonly config = injectNavigationMenuConfig();

  /**
   * The content template or component to display.
   */
  readonly content = input<NgpOverlayContent<unknown>>(undefined, {
    alias: 'ngpNavigationMenuTrigger',
  });

  /**
   * Whether the trigger is disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpNavigationMenuTriggerDisabled',
    transform: booleanAttribute,
  });

  /**
   * The placement of the content relative to the trigger.
   * @default 'bottom-start'
   */
  readonly placement = input<Placement>(this.config.placement, {
    alias: 'ngpNavigationMenuTriggerPlacement',
  });

  /**
   * The offset of the content relative to the trigger.
   * @default 4
   */
  readonly offset = input<NgpOffset, NgpOffsetInput>(this.config.offset, {
    alias: 'ngpNavigationMenuTriggerOffset',
    transform: coerceOffset,
  });

  /**
   * Whether the content should flip when there is not enough space.
   * @default true
   */
  readonly flip = input<boolean, BooleanInput>(this.config.flip, {
    alias: 'ngpNavigationMenuTriggerFlip',
    transform: booleanAttribute,
  });

  /**
   * Configure shift behavior to keep the content in view.
   * @default undefined
   */
  readonly shift = input<NgpShift, NgpShiftInput>(this.config.shift, {
    alias: 'ngpNavigationMenuTriggerShift',
    transform: coerceShift,
  });

  /**
   * The container for the content.
   * @default 'body'
   */
  readonly container = input<HTMLElement | string | null>(this.config.container, {
    alias: 'ngpNavigationMenuTriggerContainer',
  });

  /**
   * The cooldown duration in milliseconds.
   * When moving from one navigation menu item to another within this duration,
   * the showDelay is skipped for the new item.
   * @default 300
   */
  readonly cooldown = input<number, NumberInput>(this.config.cooldown, {
    alias: 'ngpNavigationMenuTriggerCooldown',
    transform: numberAttribute,
  });

  private readonly state = ngpNavigationMenuTrigger({
    content: this.content,
    disabled: this.disabled,
    placement: this.placement,
    offset: this.offset,
    flip: this.flip,
    shift: this.shift,
    container: this.container,
    cooldown: this.cooldown,
  });

  /**
   * Whether the content is currently open.
   */
  readonly open = this.state.open;

  constructor() {
    ngpRovingFocusItem({
      disabled: this.disabled,
    });
  }

  /**
   * Show the content.
   */
  show(): void {
    this.state.show();
  }

  /**
   * Hide the content.
   */
  hide(): void {
    this.state.hide();
  }
}
