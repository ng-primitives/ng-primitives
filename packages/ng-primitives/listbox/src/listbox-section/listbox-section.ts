import { contentChild, Directive } from '@angular/core';
import { NgpHeaderToken } from 'ng-primitives/common';
import { ngpListboxSection } from './listbox-section-state';

@Directive({
  selector: '[ngpListboxSection]',
  exportAs: 'ngpListboxSection',
  host: {
    role: 'group',
    '[attr.aria-labelledby]': 'header()?.id()',
  },
})
export class NgpListboxSection {
  // TODO: Replace deprecated API
  /**
   * Access the header of the section if it exists.
   */
  protected readonly header = contentChild(NgpHeaderToken, { descendants: true });

  protected readonly state = ngpListboxSection({
    header: this.header,
  });
}
