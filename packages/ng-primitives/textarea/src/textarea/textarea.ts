import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { setupFormControl } from 'ng-primitives/form-field';
import { setupInteractions } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { provideTextareaState, textareaState } from './textarea-state';

@Directive({
  selector: '[ngpTextarea]',
  exportAs: 'ngpTextarea',
  providers: [provideTextareaState()],
  host: {
    '[id]': 'id()',
    '[attr.disabled]': 'disabled() ? "" : null',
  },
})
export class NgpTextarea {
  /**
   * The id of the textarea. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-textarea'));

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
    setupFormControl({ id: this.state.id, disabled: this.state.disabled });
  }
}
