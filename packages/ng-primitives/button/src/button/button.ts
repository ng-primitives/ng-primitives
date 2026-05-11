import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
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
   * The button state.
   */
  protected readonly state = ngpButton({ disabled: this.disabled });

  /**
   * Set the disabled state of the button.
   * @param value The disabled state.
   */
  setDisabled(value: boolean | 'soft'): void {
    this.state.setDisabled(value);
  }
}
