import { Directive } from '@angular/core';
import { injectNumberPickerState } from '../number-picker/number-picker-state';

@Directive({
  selector: 'input[ngpNumberPickerInput]',
  exportAs: 'ngpNumberPickerInput',
  host: {
    '[attr.value]': 'state().value()',
    type: 'text',
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: 'false',
    'aria-roledescription': 'Number field',
  },
})
export class NgpNumberPickerInput {
  /** Access the number picker state */
  protected readonly state = injectNumberPickerState();
}
