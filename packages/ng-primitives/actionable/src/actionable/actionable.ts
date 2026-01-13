import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ariaDisabledAttribute, tabIndexAttribute } from 'ng-primitives/utils';
import { ngpActionable } from './actionable-state';

/**
 * Makes any element keyboard-accessible and properly handles disabled states.
 *
 * This directive wraps the `ngpActionable()` function, providing a template-driven
 * approach to adding actionable behavior to elements.
 *
 * Features:
 * - Keyboard activation: Adds Enter and Space key support to non-native elements
 * - Disabled state management: Properly blocks interactions when disabled
 * - Focus retention: Optional `focusableWhenDisabled` keeps element in tab order
 * - ARIA attributes: Automatically manages `aria-disabled` and `tabindex`
 * - Interaction states: Integrates with `ngpInteractions` for hover, press, focus-visible
 *
 * @example
 *
 * ```html
 * <!-- Basic usage on a div acting as a button -->
 * <div ngpActionable (click)="handleClick()">Click me</div>
 *
 * <!-- With disabled state -->
 * <div ngpActionable [ngpActionableDisabled]="isDisabled" (click)="handleClick()">Click me</div>
 *
 * <!-- Loading button that retains focus -->
 * <button
 *   ngpActionable
 *   [ngpActionableDisabled]="isLoading"
 *   [ngpActionableFocusableWhenDisabled]="true"
 *   (click)="submit()"
 * >
 *   {{ isLoading ? 'Loading...' : 'Submit' }}
 * </button>
 * ```
 *
 * @see {@link ngpActionable} - for the programmatic API
 */
@Directive({
  selector: '[ngpActionable]',
  exportAs: 'ngpActionable',
})
export class NgpActionable {
  /**
   * Whether the element is disabled.
   *
   * When `true`, all interactions (click, keyboard) are blocked and
   * the `data-disabled` attribute is applied for styling.
   *
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
    alias: 'ngpActionableDisabled',
  });

  /**
   * Whether the element should remain focusable when disabled.
   *
   * Essential for loading states where focus should not be lost.
   * Uses `aria-disabled` instead of `disabled` attribute to keep
   * the element in the tab order while preventing interactions.
   *
   * @default false
   */
  readonly focusableWhenDisabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
    alias: 'ngpActionableFocusableWhenDisabled',
  });

  /**
   * Override the automatic `aria-disabled` attribute management.
   *
   * By default, `aria-disabled` is automatically set based on element type
   * and disabled state. Set this to manually control the attribute.
   *
   * @default null (automatic)
   */
  readonly ariaDisabled = input<boolean | null, BooleanInput>(null, {
    transform: ariaDisabledAttribute,
    alias: 'ngpActionableAriaDisabled',
  });

  /**
   * Override the automatic `tabindex` attribute management.
   *
   * By default, non-native elements get `tabindex="0"` to be keyboard
   * focusable, and disabled elements get `tabindex="-1"`.
   *
   * @default null (automatic)
   */
  readonly tabIndex = input<number | null, NumberInput>(null, {
    transform: tabIndexAttribute,
    alias: 'ngpActionableTabIndex',
  });

  /**
   * Internal state manager created by `ngpActionable()`.
   */
  protected readonly state = ngpActionable({
    disabled: this.disabled,
    focusableWhenDisabled: this.focusableWhenDisabled,
    ariaDisabled: this.ariaDisabled,
    tabIndex: this.tabIndex,
  });

  /**
   * Imperatively set the disabled state.
   * @param value - Whether the element should be disabled
   */
  setDisabled(value: boolean): void {
    this.state.setDisabled(value);
  }

  /**
   * Imperatively set whether the element stays focusable when disabled.
   * @param value - Whether to remain focusable when disabled
   */
  setFocusableWhenDisabled(value: boolean): void {
    this.state.setFocusableWhenDisabled(value);
  }

  /**
   * Imperatively set the `aria-disabled` attribute.
   * @param value - The aria-disabled value, or null for automatic management
   */
  setAriaDisabled(value: boolean | null): void {
    this.state.setAriaDisabled(value);
  }

  /**
   * Imperatively set the `tabindex` attribute.
   * @param value - The tabindex value, or null for automatic management
   */
  setTabIndex(value: number | null): void {
    this.state.setTabIndex(value);
  }
}
