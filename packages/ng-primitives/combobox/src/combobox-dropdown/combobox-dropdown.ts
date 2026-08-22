import { Directive, input } from '@angular/core';
import { provideControlContainerIsolation } from 'ng-primitives/portal';
import { uniqueId } from 'ng-primitives/utils';
import { ngpComboboxDropdown } from './combobox-dropdown-state';

@Directive({
  selector: '[ngpComboboxDropdown]',
  exportAs: 'ngpComboboxDropdown',
  providers: [provideControlContainerIsolation()],
})
export class NgpComboboxDropdown {
  /** The id of the dropdown. */
  readonly id = input<string>(uniqueId('ngp-combobox-dropdown'));

  protected readonly state = ngpComboboxDropdown({
    id: this.id,
  });

  /** @internal Access the element reference. */
  readonly elementRef = this.state.elementRef;
}
