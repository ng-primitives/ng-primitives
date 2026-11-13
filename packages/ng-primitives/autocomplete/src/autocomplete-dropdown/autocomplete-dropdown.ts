import { Directive, input } from '@angular/core';
import { provideControlContainerIsolation } from 'ng-primitives/portal';
import { uniqueId } from 'ng-primitives/utils';
import {
  ngpAutocompleteDropdown,
  provideAutocompleteDropdownState,
} from './autocomplete-dropdown-state';

@Directive({
  selector: '[ngpAutocompleteDropdown]',
  exportAs: 'ngpAutocompleteDropdown',
  providers: [provideControlContainerIsolation(), provideAutocompleteDropdownState()],
})
export class NgpAutocompleteDropdown {
  /** The id of the dropdown. */
  readonly id = input<string>(uniqueId('ngp-autocomplete-dropdown'));

  protected readonly state = ngpAutocompleteDropdown({ id: this.id });
}
