import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';

@Directive({
  selector: '[ngpListboxHeader]',
  exportAs: 'ngpListboxHeader',
  host: {
    role: 'presentation',
    '[attr.id]': 'id()',
  },
})
export class NgpListboxHeader {
  /**
   * The id of the listbox header.
   */
  readonly id = input(uniqueId('ngp-listbox-header'));
}
