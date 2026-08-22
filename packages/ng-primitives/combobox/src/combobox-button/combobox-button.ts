import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpComboboxButton } from './combobox-button-state';

@Directive({
  selector: 'button[ngpComboboxButton]',
  exportAs: 'ngpComboboxButton',
})
export class NgpComboboxButton {
  /** The id of the button. */
  readonly id = input<string>(uniqueId('ngp-combobox-button'));

  protected readonly state = ngpComboboxButton({ id: this.id });

  /** @internal Access the element reference. */
  readonly elementRef = this.state.elementRef;

  /** The id of the dropdown */
  readonly dropdownId = this.state.dropdownId;
}
