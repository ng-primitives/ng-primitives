import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { NgpHeaderToken } from './header-token';

/**
 * @deprecated
 */

@Directive({
  selector: '[ngpHeader]',
  exportAs: 'ngpHeader',
  providers: [{ provide: NgpHeaderToken, useExisting: NgpHeader }],
  host: {
    role: 'presentation',
    '[attr.id]': 'id()',
  },
})
export class NgpHeader {
  /**
   * The id of the header.
   */
  readonly id = input(uniqueId('ngp-header'));

  constructor() {
    if (ngDevMode) {
      console.warn(
        `NgpHeader is deprecated and will be removed in a future version. Please use NgpListboxHeader instead.`,
      );
    }
  }
}
