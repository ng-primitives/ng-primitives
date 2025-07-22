import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { setupButton } from 'ng-primitives/internal';
import { buttonState, provideButtonState } from './button-state';

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
   * The button state.
   */
  protected readonly state = buttonState<NgpButton>(this);

  constructor() {
    setupButton({ disabled: this.state.disabled });
  }
}
