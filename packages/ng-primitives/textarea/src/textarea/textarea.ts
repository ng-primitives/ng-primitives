import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { NgpFormControl, syncFormControl } from 'ng-primitives/form-field';
import { setupInteractions } from 'ng-primitives/internal';
import { provideTextareaState, textareaState } from './textarea-state';

@Directive({
  selector: '[ngpTextarea]',
  exportAs: 'ngpTextarea',
  providers: [provideTextareaState()],
  hostDirectives: [NgpFormControl],
})
export class NgpTextarea {
  /**
   * Whether the element is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * The state of the textarea.
   */
  protected readonly state = textareaState<NgpTextarea>(this);

  constructor() {
    setupInteractions({
      hover: true,
      press: true,
      focus: true,
      disabled: this.state.disabled,
    });
    syncFormControl({ disabled: this.state.disabled });
  }
}
