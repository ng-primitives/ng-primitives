import { Directive, input } from '@angular/core';
import { NgpHeaderToken } from 'ng-primitives/common';
import { uniqueId } from 'ng-primitives/utils';

@Directive({
  selector: '[ngpListboxHeader]',
  exportAs: 'ngpListboxHeader',
  host: {
    role: 'presentation',
    '[attr.id]': 'id()',
  },
  // temporary until we remove NgpHeader completely - this prevents breaking changes
  providers: [{ provide: NgpHeaderToken, useExisting: NgpListboxHeader }],
})
export class NgpListboxHeader {
  /**
   * The id of the listbox header.
   */
  readonly id = input(uniqueId('ngp-listbox-header'));
}
