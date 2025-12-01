import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpInput, provideInputState } from './input-state';

@Directive({
  selector: 'input[ngpInput]',
  exportAs: 'ngpInput',
  providers: [provideInputState({ inherit: false })],
})
export class NgpInput {
  /**
   * The id of the input.
   */
  readonly id = input(uniqueId('ngp-input'));

  /**
   * Whether the element is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * The input state.
   */
  protected readonly state = ngpInput({
    id: this.id,
    disabled: this.disabled,
  });
}
