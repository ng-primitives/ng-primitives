import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute } from '@angular/core';
import { ngpInteract, provideInteractState } from './interact-state';

/**
 * Manages accessible disabled state for any element: ARIA attributes, focusability,
 * and keyboard blocking. Click and pointer blocking is left to the implementor.
 *
 * @usageNotes
 * ### Basic usage
 * ```html
 * <button ngpInteract [disabled]="isLoading">Submit</button>
 * ```
 *
 * ### Focusable when disabled (for loading states)
 * ```html
 * <button ngpInteract [disabled]="true" [focusableWhenDisabled]="true">
 *   Loading...
 * </button>
 * ```
 *
 * ### Styling
 * ```css
 * [data-disabled] { opacity: 0.5; cursor: not-allowed; }
 * [data-disabled-focusable] { /* loading indicator styles *\/ }
 * ```
 */
@Directive({
  selector: '[ngpInteract]',
  exportAs: 'ngpInteract',
  providers: [provideInteractState({ inherit: false })],
})
export class NgpInteract {
  /**
   * Whether the element is disabled. Applies native `disabled` on buttons/inputs,
   * `aria-disabled` on other elements, and blocks keyboard events (except Tab).
   * Click and pointer blocking is the implementor's responsibility.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * Keep the element focusable when disabled. Useful for loading states where
   * users should discover and tab away from a disabled control.
   * @default false
   */
  readonly focusableWhenDisabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * Tab index of the element.
   * Adjusted automatically when disabled based on `focusableWhenDisabled` setting.
   * @default 0
   */
  readonly tabIndex = input<number, NumberInput>(0, {
    transform: value => numberAttribute(value, 0),
  });

  protected readonly state = ngpInteract({
    disabled: this.disabled,
    focusableWhenDisabled: this.focusableWhenDisabled,
    tabIndex: this.tabIndex,
  });

  /** Programmatically set the disabled state. */
  setDisabled(value: boolean): void {
    this.state.setDisabled(value);
  }

  /** Programmatically set whether the element is focusable when disabled. */
  setFocusableWhenDisabled(value: boolean): void {
    this.state.setFocusableWhenDisabled(value);
  }

  /** Programmatically set the tab index. */
  setTabIndex(value: number): void {
    this.state.setTabIndex(value);
  }
}
