import { Directive, input } from '@angular/core';
import { provideControlContainerIsolation } from 'ng-primitives/portal';
import { uniqueId } from 'ng-primitives/utils';
import { ngpSelectDropdown } from './select-dropdown-state';

@Directive({
  selector: '[ngpSelectDropdown]',
  exportAs: 'ngpSelectDropdown',
  providers: [provideControlContainerIsolation()],
})
export class NgpSelectDropdown {
  /** The id of the dropdown. */
  readonly id = input<string>(uniqueId('ngp-select-dropdown'));

  constructor() {
    ngpSelectDropdown({
      id: this.id,
    });
  }
}
