import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpComboboxDropdown } from './combobox-dropdown-state';

@Directive({
  selector: '[ngpComboboxDropdown]',
  exportAs: 'ngpComboboxDropdown',
})
export class NgpComboboxDropdown {
  /** The id of the dropdown. */
  readonly id = input<string>(uniqueId('ngp-combobox-dropdown'));

  private readonly state = ngpComboboxDropdown({
    id: this.id,
  });

  /** @internal Access the element reference. */
  readonly elementRef = this.state.elementRef;
}
