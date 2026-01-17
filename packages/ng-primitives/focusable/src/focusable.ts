import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute } from '@angular/core';
import { ngpFocusable, provideFocusableState } from './focusable-state';

/**
 * Makes any element focusable and properly handles disabled states.
 *
 * This directive wraps the `ngpFocusable()` function, providing a template-driven
 * approach to adding focusable behavior to elements.
 *
 * Features:
 * - Focus management: Makes non-native elements focusable via `tabindex`
 * - Disabled state management: Properly blocks interactions when disabled
 * - Focus retention: Optional `focusableWhenDisabled` keeps element in tab order
 * - ARIA attributes: Automatically manages `aria-disabled` and `tabindex`
 * - Interaction states: Integrates with `ngpInteractions` for hover, press, focus-visible
 *
 * For keyboard activation (Enter/Space) on non-native elements, use `NgpButton`.
 *
 * @example
 *
 * ```html
 * <!-- Loading button that retains focus when disabled -->
 * <button
 *   ngpFocusable
 *   [ngpFocusableDisabled]="isLoading"
 *   [ngpFocusableWhenDisabled]="isLoading"
 *   (click)="submit()"
 * >
 *   {{ isLoading ? 'Saving...' : 'Save' }}
 * </button>
 *
 * <!-- Custom tab with arrow key navigation -->
 * <div
 *   role="tab"
 *   ngpFocusable
 *   [ngpFocusableDisabled]="disabled"
 *   (keydown)="handleArrowKeys($event)"
 * >
 *   Tab Label
 * </div>
 * ```
 *
 * @see {@link ngpFocusable} - for the programmatic API
 */
@Directive({
  selector: '[ngpFocusable]',
  exportAs: 'ngpFocusable',
  providers: [provideFocusableState({ inherit: false })],
})
export class NgpFocusable {
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
    alias: 'ngpFocusableDisabled',
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
    alias: 'ngpFocusableWhenDisabled',
  });

  /**
   * The tabindex attribute value to set on the element.
   * @remarks
   * A non-undefined value will override the automatically managed tabindex attribute.
   */
  readonly tabIndex = input<number | null | undefined, NumberInput>(undefined, {
    transform: value => (value == null ? value : numberAttribute(value)),
  });

  /**
   * The aria-disabled attribute value to set on the element.
   * @remarks
   * A non-undefined value will override the automatically managed aria-disabled attribute.
   */
  readonly ariaDisabled = input<boolean | string | null | undefined>(undefined, {
    alias: 'aria-disabled',
  });

  /**
   * Internal state manager created by `ngpFocusable()`.
   */
  protected readonly state = ngpFocusable({
    disabled: this.disabled,
    focusableWhenDisabled: this.focusableWhenDisabled,
    tabIndex: this.tabIndex,
    ariaDisabled: this.ariaDisabled,
  });

  /**
   * Set the disabled state.
   * @param value - The disabled state.
   */
  setDisabled(value: boolean): void {
    this.state.setDisabled(value);
  }

  /**
   * Set whether the element stays focusable when disabled.
   * @param value - The focusable state.
   */
  setFocusableWhenDisabled(value: boolean): void {
    this.state.setFocusableWhenDisabled(value);
  }
}
