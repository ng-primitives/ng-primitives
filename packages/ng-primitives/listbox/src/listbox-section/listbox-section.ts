import { contentChild, Directive } from '@angular/core';
import { NgpHeaderToken } from 'ng-primitives/common';

@Directive({
  selector: '[ngpListboxSection]',
  exportAs: 'ngpListboxSection',
  host: {
    role: 'group',
    '[attr.aria-labelledby]': 'header()?.id()',
  },
})
export class NgpListboxSection {
  /**
   * Access the header of the section if it exists.
   */
  protected readonly header = contentChild(NgpHeaderToken, { descendants: true });
}
