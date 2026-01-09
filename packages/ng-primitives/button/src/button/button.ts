import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute } from '@angular/core';
import { ngpButton, provideButtonState } from './button-state';

@Directive({
  selector: '[ngpButton]',
  exportAs: 'ngpButton',
  providers: [provideButtonState({ inherit: false })],
})
export class NgpButton {
  /**
   * Whether the button is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * Whether the button should be focusable when disabled.
   *
   * @remarks
   * For buttons that enter a loading state after being clicked, set to
   * true to ensure focus remains on the button when it becomes disabled.
   * This prevents focus from being lost and maintains the tab order.
   */
  readonly focusableWhenDisabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * The `aria-disabled` attribute value of the button.
   */
  readonly ariaDisabled = input<boolean | null, BooleanInput>(null, {
    transform: value => (value == null ? null : booleanAttribute(value)),
    alias: 'aria-disabled',
  });

  /**
   * The tab index of the button.
   */
  readonly tabIndex = input<number | null, NumberInput>(null, {
    transform: value => {
      if (value == null) {
        return null;
      }

      const parsed = numberAttribute(value);
      if (Number.isNaN(parsed)) {
        return null;
      }

      return parsed;
    },
  });

  /**
   * The button state.
   */
  protected readonly state = ngpButton({
    disabled: this.disabled,
    focusableWhenDisabled: this.focusableWhenDisabled,
    ariaDisabled: this.ariaDisabled,
    tabIndex: this.tabIndex,
  });

  /**
   * Set the disabled state of the button.
   * @param value The disabled state.
   */
  setDisabled(value: boolean): void {
    this.state.setDisabled(value);
  }

  /**
   * Set the focusable when disabled state of the button.
   * @param value The focusable when disabled state.
   */
  setFocusableWhenDisabled(value: boolean): void {
    this.state.setFocusableWhenDisabled(value);
  }

  /**
   * Set the aria-disabled state of the button.
   * @param value The aria-disabled state.
   */
  setAriaDisabled(value: boolean | null): void {
    this.state.setAriaDisabled(value);
  }

  /**
   * Set the tab index of the button.
   * @param value The tab index.
   */
  setTabIndex(value: number | null): void {
    this.state.setTabIndex(value);
  }
}
