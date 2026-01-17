import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute } from '@angular/core';
import { provideFocusableState } from 'ng-primitives/focusable';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { NgpButtonConfig } from './button-config';
import { ngpButton, provideButtonState } from './button-state';

/**
 * A button primitive that enhances any element with button-like behavior.
 *
 * This directive wraps the `ngpButton()` function, providing a template-driven
 * approach to creating accessible, interactive buttons.
 *
 * Features:
 * - Keyboard activation: Adds Enter and Space key support to non-native elements
 * - Disabled state management: Properly blocks interactions when disabled
 * - Focus retention: Optional `focusableWhenDisabled` keeps element in tab order
 * - ARIA attributes: Automatically manages `aria-disabled`, `tabindex`, `role`, and `type`
 * - Interaction states: Integrates with `ngpInteractions` for hover, press, focus-visible
 *
 * Built on `NgpFocusable` for foundational focus and disabled state management.
 *
 * @example
 *
 * ```html
 * <!-- Native button with enhanced interactions -->
 * <button ngpButton>Click me</button>
 *
 * <!-- Non-native element as a button -->
 * <div ngpButton (click)="handleClick()">Click me</div>
 *
 * <!-- Loading button that retains focus -->
 * <button
 *   ngpButton
 *   [disabled]="isLoading"
 *   [focusableWhenDisabled]="true"
 * >
 *   {{ isLoading ? 'Loading...' : 'Submit' }}
 * </button>
 * ```
 *
 * @see {@link ngpButton} - for the programmatic API
 */
@Directive({
  selector: '[ngpButton]',
  exportAs: 'ngpButton',
  providers: [provideButtonState({ inherit: false }), provideFocusableState({ inherit: false })],
})
export class NgpButton {
  /**
   * Whether the button is disabled.
   *
   * When `true`:
   * - Click events are blocked via `preventDefault()` and `stopImmediatePropagation()`
   * - Keyboard interactions are blocked (except Tab when `focusableWhenDisabled` is true)
   * - `data-disabled` attribute is applied for styling
   * - Native `disabled` attribute is set (if button supports it and not focusable when disabled)
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * Whether the button should remain focusable when disabled.
   *
   * This is essential for loading states where focus should not be lost.
   * When `true`:
   * - Button stays in the tab order
   * - `aria-disabled="true"` is used instead of `disabled` attribute
   * - Only Tab key is allowed for keyboard navigation
   * - Focus is not lost when transitioning to disabled state
   *
   * @remarks
   * Use this for submit buttons that show a loading spinner after click.
   * Without this, focus jumps away when the button becomes disabled,
   * which is disorienting for keyboard and screen readers.
   */
  readonly focusableWhenDisabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * The tabindex attribute value to set on the button.
   * @remarks
   * A non-undefined value will override the automatically managed tabindex attribute.
   */
  readonly tabIndex = input<number | null | undefined, NumberInput>(undefined, {
    transform: value => (value == null ? value : numberAttribute(value)),
  });

  /**
   * The aria-disabled attribute value to set on the button.
   * @remarks
   * A non-undefined value will override the automatically managed aria-disabled attribute.
   */
  readonly ariaDisabled = input<boolean | string | null | undefined>(undefined, {
    alias: 'aria-disabled',
  });

  /**
   * The role attribute value to set on the button.
   * @remarks
   * A non-undefined value will override the automatically managed role attribute
   * but only if the provided button configuration {@link NgpButtonConfig.autoSetButtonRole} is `true`.
   * The config value default is `false` to maintain backwards compatibility.
   */
  readonly role = input<string | null | undefined>(undefined);

  /**
   * The type attribute value to set on the button.
   * @remarks
   * A non-undefined value will override the automatically managed type attribute
   * but only if the provided button configuration {@link NgpButtonConfig.autoSetButtonType} is `true`.
   * The config value default is `false` to maintain backwards compatibility.
   * This should only be set for native buttons.
   * Native `<button>` elements default to `type="submit"` per the HTML spec,
   * which can cause unintended form submissions. Setting `type="button"` prevents this.
   */
  readonly type = input<string | null | undefined>(undefined);

  /**
   * The button state.
   */
  protected readonly state = ngpButton({
    disabled: this.disabled,
    focusableWhenDisabled: this.focusableWhenDisabled,
    tabIndex: this.tabIndex,
    ariaDisabled: this.ariaDisabled,
    role: this.role,
    type: this.type,
  });

  /**
   * Set the disabled state of the button.
   * @param value The disabled state.
   */
  setDisabled(value: boolean): void {
    this.state.setDisabled(value);
  }

  /**
   * Set whether the button should remain focusable when disabled.
   * @param value Whether to keep the button focusable when disabled.
   */
  setFocusableWhenDisabled(value: boolean): void {
    this.state.setFocusableWhenDisabled(value);
  }

  /**
   * Set the tabindex attribute state value.
   * @param value The tabindex attribute value.
   */
  setTabIndex(value: number | null | undefined): void {
    this.state.setTabIndex(value);
  }

  /**
   * Set the aria-disabled attribute state value.
   * @param value The aria-disabled attribute value.
   */
  setAriaDisabled(value: boolean | string | null | undefined): void {
    this.state.setAriaDisabled(value);
  }

  /**
   * Set the role attribute state value.
   * @param value The role attribute value.
   */
  setRole(value: string | null | undefined): void {
    this.state.setRole(value);
  }

  /**
   * Set the type attribute state value.
   * @param value The type attribute value.
   */
  setType(value: string | null | undefined): void {
    this.state.setType(value);
  }
}
