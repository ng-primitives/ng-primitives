import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, Signal } from '@angular/core';
import { ngpButton, provideButtonState } from './button-state';

@Directive({
  selector: '[ngpButton]',
  exportAs: 'ngpButton',
  providers: [provideButtonState({ inherit: false })],
})
export class NgpButton {
  /**
   * Whether the button is disabled. Use `'soft'` for an aria-disabled
   * button that stays focusable; events still fire, so guard your handlers.
   */
  readonly disabled = input<boolean | 'soft', BooleanInput>(false, {
    transform: v => (v === 'soft' ? 'soft' : booleanAttribute(v)),
  });

  /**
   * Whether the button is pending, e.g. while the request it started runs. A pending
   * button stays focusable, ignores clicks, does not submit its form, and announces
   * its name when pending starts and ends if it has focus.
   */
  readonly pending = input<boolean, BooleanInput>(false, {
    alias: 'ngpButtonPending',
    transform: booleanAttribute,
  });

  /**
   * The button state.
   */
  protected readonly state = ngpButton({ disabled: this.disabled, pending: this.pending });

  /**
   * Set the disabled state of the button.
   * @param value The disabled state.
   */
  setDisabled(value: boolean | 'soft'): void {
    this.state.setDisabled(value);
  }

  /**
   * Set the pending state of the button.
   * @param value The pending state.
   */
  setPending(value: boolean): void {
    this.state.setPending(value);
  }

  /** @internal */
  registerDisabledSource(source: Signal<boolean>): void {
    this.state.registerDisabledSource(source);
  }

  /** @internal */
  unregisterDisabledSource(source: Signal<boolean>): void {
    this.state.unregisterDisabledSource(source);
  }
}
