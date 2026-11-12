import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute, output, Signal } from '@angular/core';
import {
  coerceFlip,
  coerceOffset,
  coerceShift,
  NgpFlip,
  NgpFlipInput,
  NgpOffset,
  NgpOffsetInput,
  NgpOverlayContent,
  NgpPlacement,
  NgpShift,
  NgpShiftInput,
} from 'ng-primitives/portal';
import { coerceBooleanOrUndefined } from 'ng-primitives/utils';
import { injectMenuConfig, NgpMenuTriggerType } from '../config/menu-config';
import { ngpMenuTrigger, provideMenuTriggerState } from './menu-trigger-state';

/**
 * The `NgpMenuTrigger` directive allows you to turn an element into a menu trigger.
 */
@Directive({
  selector: '[ngpMenuTrigger]',
  exportAs: 'ngpMenuTrigger',
  providers: [provideMenuTriggerState()],
})
export class NgpMenuTrigger<T = unknown> {
  /**
   * Access the global menu configuration.
   */
  private readonly config = injectMenuConfig();

  /**
   * Access the menu template ref or ComponentType.
   */
  readonly menu = input<NgpOverlayContent<T>>(undefined, {
    alias: 'ngpMenuTrigger',
  });

  /**
   * Whether the menu is open. Bind it to control the menu: a click, Escape, an outside press
   * or a selected item then emits `ngpMenuTriggerOpenChange` and the menu waits for the
   * binding to change, so `[(ngpMenuTriggerOpen)]` keeps both in step. Leave unset to let the
   * trigger manage it.
   */
  readonly open = input<boolean | undefined, BooleanInput>(undefined, {
    alias: 'ngpMenuTriggerOpen',
    transform: coerceBooleanOrUndefined,
  });

  /**
   * Whether the menu opens on first render when `ngpMenuTriggerOpen` is unset.
   * @default false
   */
  readonly defaultOpen = input<boolean, BooleanInput>(false, {
    alias: 'ngpMenuTriggerDefaultOpen',
    transform: booleanAttribute,
  });

  /**
   * Define if the trigger should be disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpMenuTriggerDisabled',
    transform: booleanAttribute,
  });

  /**
   * Define the placement of the menu relative to the trigger.
   * @default 'bottom-start'
   */
  readonly placement = input<NgpPlacement>(this.config.placement, {
    alias: 'ngpMenuTriggerPlacement',
  });

  /**
   * Define the offset of the menu relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 4
   */
  readonly offset = input<NgpOffset, NgpOffsetInput>(this.config.offset, {
    alias: 'ngpMenuTriggerOffset',
    transform: coerceOffset,
  });

  /**
   * Define whether the menu should flip when there is not enough space for the menu.
   * Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.
   * @default true
   */
  readonly flip = input<NgpFlip, NgpFlipInput>(this.config.flip, {
    alias: 'ngpMenuTriggerFlip',
    transform: coerceFlip,
  });

  /**
   * Configure shift behavior to keep the menu in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  readonly shift = input<NgpShift, NgpShiftInput>(this.config.shift, {
    alias: 'ngpMenuTriggerShift',
    transform: coerceShift,
  });

  /**
   * Define the container in which the menu should be attached.
   * @default document.body
   */
  readonly container = input<HTMLElement | string | null>(this.config.container, {
    alias: 'ngpMenuTriggerContainer',
  });

  /**
   * Defines how the menu behaves when the window is scrolled.
   * @default 'block'
   */
  readonly scrollBehavior = input<'reposition' | 'block' | 'close'>(this.config.scrollBehavior, {
    alias: 'ngpMenuTriggerScrollBehavior',
  });

  /**
   * Define the cooldown duration in milliseconds.
   * When moving from one menu to another within this duration,
   * the showDelay is skipped for the new menu.
   * @default 0
   */
  readonly cooldown = input<number, NumberInput>(this.config.cooldown, {
    alias: 'ngpMenuTriggerCooldown',
    transform: numberAttribute,
  });

  /**
   * Provide context to the menu. This can be used to pass data to the menu content.
   */
  readonly context = input<T>(undefined, {
    alias: 'ngpMenuTriggerContext',
  });

  /**
   * Define an anchor element for positioning the menu.
   * If provided, the menu will be positioned relative to this element instead of the trigger.
   *
   * The anchor is live, so rebinding it moves an open menu.
   *
   * An input only reaches this directive on the next change detection pass, which a press
   * can outrun - use `setAnchor()` instead when the anchor is claimed during one.
   */
  readonly anchor = input<HTMLElement | null>(null, {
    alias: 'ngpMenuTriggerAnchor',
  });

  /**
   * Define which trigger types are enabled for the menu.
   * @default ['click']
   */
  readonly triggers = input<NgpMenuTriggerType[]>(this.config.triggers, {
    alias: 'ngpMenuTriggerOpenTriggers',
  });

  /**
   * Define the delay before the menu is displayed (hover/focus triggers).
   * @default 0
   */
  readonly showDelay = input<number, NumberInput>(this.config.showDelay, {
    alias: 'ngpMenuTriggerShowDelay',
    transform: numberAttribute,
  });

  /**
   * Define the delay before the menu is hidden (hover/focus triggers).
   * @default 0
   */
  readonly hideDelay = input<number, NumberInput>(this.config.hideDelay, {
    alias: 'ngpMenuTriggerHideDelay',
    transform: numberAttribute,
  });

  /**
   * Event emitted when the user or a `show()` call opens or closes the menu, not when
   * `ngpMenuTriggerDefaultOpen` opens it. While `ngpMenuTriggerOpen` is bound, it emits when
   * the menu asks to open or close instead, and not for changes the binding made. A close the
   * binding cannot hold back, such as another menu taking over, is emitted as it happens.
   */
  readonly openChange = output<boolean>({
    alias: 'ngpMenuTriggerOpenChange',
  });

  /**
   * The menu trigger state.
   */
  private readonly state = ngpMenuTrigger<T>({
    open: this.open,
    defaultOpen: this.defaultOpen,
    disabled: this.disabled,
    menu: this.menu,
    placement: this.placement,
    offset: this.offset,
    flip: this.flip,
    shift: this.shift,
    container: this.container,
    scrollBehavior: this.scrollBehavior,
    cooldown: this.cooldown,
    context: this.context as Signal<T>,
    anchor: this.anchor,
    triggers: this.triggers,
    showDelay: this.showDelay,
    hideDelay: this.hideDelay,
    onOpenChange: value => this.openChange.emit(value),
  });

  /**
   * Show the menu, or, while `ngpMenuTriggerOpen` is bound, ask the binding to open it.
   */
  show(): void {
    this.state.show();
  }

  /**
   * Hide the menu.
   * @param origin - The focus origin
   * @internal
   */
  hide(origin?: FocusOrigin): void {
    this.state.hide(origin);
  }

  /**
   * Toggle the menu.
   * @param event - The mouse event
   */
  toggle(event: MouseEvent): void {
    this.state.toggle(event);
  }

  /**
   * Set the anchor the menu is positioned against, taking effect immediately rather than
   * on the next change detection pass.
   *
   * Reach for this over `ngpMenuTriggerAnchor` when the anchor is claimed during a press.
   * Outside-press dismissal is decided on a capture-phase `mouseup`, which a fast tap can
   * deliver in the same frame as the `pointerdown` that claimed the anchor - before the
   * binding has reached this directive, so the press dismisses the menu instead of moving
   * it. Writing the anchor here is visible to that check straight away.
   * @param anchor - The new anchor element
   */
  setAnchor(anchor: HTMLElement | null): void {
    this.state.setAnchor(anchor);
  }
}

/**
 * Where the menu is placed relative to its trigger.
 * @deprecated Identical to `NgpPlacement` from `ng-primitives/portal` - use that instead.
 * Will be removed in a future major.
 */
export type NgpMenuPlacement = NgpPlacement;
