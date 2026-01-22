import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { ngpDisable, provideDisableState } from './disable-state';

/**
 * Adds disabled behavior to any element with optional focusable-when-disabled support.
 *
 * @usageNotes
 * ### Basic usage
 * ```html
 * <button ngpDisable [disabled]="isLoading">Submit</button>
 * ```
 *
 * ### Focusable when disabled (for loading states)
 * ```html
 * <button ngpDisable [disabled]="true" [focusableWhenDisabled]="true">
 *   Loading...
 * </button>
 * ```
 *
 * ### Styling
 * ```css
 * [data-disabled] { opacity: 0.5; cursor: not-allowed; }
 * [data-focusable-disabled] { /* loading indicator styles *\/ }
 * ```
 */
@Directive({
  selector: '[ngpDisable]',
  exportAs: 'ngpDisable',
  providers: [provideDisableState({ inherit: false })],
})
export class NgpDisable {
  protected readonly elementRef = injectElementRef();

  /**
   * Whether the element is disabled. Applies native `disabled` on buttons/inputs,
   * `aria-disabled` on other elements, and blocks click/keyboard events.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * Keep the element focusable when disabled. Useful for loading states where
   * users should discover and tab away from a disabled control.
   */
  readonly focusableWhenDisabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * Tab index of the element.
   * Adjusted automatically when disabled based on `focusableWhenDisabled` setting.
   */
  readonly tabIndex = input<number, NumberInput>(undefined, {
    transform: value => numberAttribute(value, 0),
  });

  protected readonly state = ngpDisable({
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
