import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpSelectInput } from './select-input-state';

@Directive({
  selector: 'input[ngpSelectInput]',
  exportAs: 'ngpSelectInput',
})
export class NgpSelectInput {
  /** The id of the input. */
  readonly id = input<string>(uniqueId('ngp-select-input'));

  /** Access the select input state. */
  protected readonly state = ngpSelectInput({
    id: this.id,
  });

  /**
   * Focus the input field.
   * @internal
   */
  focus(): void {
    this.state.focus();
  }
}
