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

  /** @internal Access the element reference. */
  readonly elementRef = this.state.elementRef;

  /** @The id of the dropdown */
  readonly dropdownId = this.state.dropdownId;

  /**
   * The control status - this is required as we apply them to the combobox element as well as the input element.
   * @internal
   */
  readonly controlStatus = this.state.controlStatus;
}
