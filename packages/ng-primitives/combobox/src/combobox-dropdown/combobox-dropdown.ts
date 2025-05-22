import { Directive, input } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectComboboxState } from '../combobox/combobox-state';

@Directive({
  selector: '[ngpComboboxDropdown]',
  exportAs: 'ngpComboboxDropdown',
  host: {
    role: 'listbox',
    '[id]': 'id()',
  },
})
export class NgpComboboxDropdown {
  /** Access the combobox state. */
  private readonly state = injectComboboxState();

  /**
   * Access the element reference.
   * @internal
   */
  readonly elementRef = injectElementRef();

  /** The id of the dropdown. */
  readonly id = input<string>(uniqueId('ngp-combobox-dropdown'));

  constructor() {
    this.state().registerDropdown(this);
  }
}
