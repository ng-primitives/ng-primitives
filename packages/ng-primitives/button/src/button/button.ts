import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute } from '@angular/core';
import { ngpButton, provideButtonState } from './button-state';

/**
 * Enhances any element with accessible button behavior.
 *
 * ## What it does
 * - Adds `role="button"` to non-native elements (divs, spans, etc.)
 * - Enables keyboard activation via Enter and Space keys
 * - Manages disabled state with proper ARIA attributes
 * - Provides interaction states (hover, press, focus) via data attributes
 *
 * ## When to use
 * Apply to any element that triggers an action:
 * - Native `<button>` elements for enhanced interaction states
 * - `<div>`, `<span>`, or other elements when semantic HTML isn't feasible
 * - `<a>` elements without href that act as buttons
 *
 * @usageNotes
 * ### Basic usage
 * ```html
 * <button ngpButton>Save</button>
 * ```
 *
 * ### Non-native element
 * ```html
 * <div ngpButton>Custom Button</div>
 * ```
 *
 * ### Disabled with focus (for loading states or tooltips)
 * ```html
 * <button ngpButton [disabled]="isDisabled || isLoading" [focusableWhenDisabled]="isLoading">
 *   {{ isLoading ? 'Loading...' : 'Submit' }}
 * </button>
 * ```
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/button/ WAI-ARIA Button Pattern}
 */
@Directive({
  selector: '[ngpButton]',
  exportAs: 'ngpButton',
  providers: [provideButtonState({ inherit: false })],
})
export class NgpButton {
  /**
   * Whether the button is disabled.
   *
   * When disabled:
   * - Click, keyboard, and pointer events are blocked
   * - `data-disabled` attribute is added for styling
   * - Native buttons receive the `disabled` attribute
   * - Non-native elements receive `aria-disabled="true"`
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * Whether the button remains focusable when disabled.
   *
   * Enable this for:
   * - Loading states: Prevents keyboard users from losing focus when a button
   *   temporarily disables during an async operation
   * - Tooltips: Allows showing explanatory tooltips on disabled buttons
   * - Discoverability: Lets screen reader users discover and understand
   *   why an action is unavailable
   *
   * When enabled, uses `aria-disabled` instead of the native `disabled` attribute
   * to keep the button in the tab order while still blocking activation.
   *
   * @see {@link https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#focusabilityofdisabledcontrols APG: Focusability of Disabled Controls}
   */
  readonly focusableWhenDisabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * The tab index for the button.
   * @default 0
   */
  readonly tabIndex = input<number, NumberInput>(0, {
    transform: v => numberAttribute(v, 0),
  });

  /** @internal */
  protected readonly state = ngpButton({
    disabled: this.disabled,
    focusableWhenDisabled: this.focusableWhenDisabled,
    tabIndex: this.tabIndex,
  });

  /**
   * Programmatically set the disabled state.
   * Useful when the disabled state is controlled by component logic rather than a template binding.
   */
  setDisabled(value: boolean): void {
    this.state.setDisabled(value);
  }

  /**
   * Programmatically set whether the button remains focusable when disabled.
   */
  setFocusableWhenDisabled(value: boolean): void {
    this.state.setFocusableWhenDisabled(value);
  }

  /**
   * Programmatically set the tab index.
   */
  setTabIndex(value: number): void {
    this.state.setTabIndex(value);
  }
}
