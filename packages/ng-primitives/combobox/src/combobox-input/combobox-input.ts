import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpComboboxInput } from './combobox-input-state';

@Directive({
  selector: 'input[ngpComboboxInput]',
  exportAs: 'ngpComboboxInput',
})
export class NgpComboboxInput {
  /** The id of the input. */
  readonly id = input<string>(uniqueId('ngp-combobox-input'));

  private readonly state = ngpComboboxInput({ id: this.id });
}
