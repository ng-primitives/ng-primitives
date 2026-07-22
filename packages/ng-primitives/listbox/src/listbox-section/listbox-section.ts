import { Directive } from '@angular/core';
import { ngpListboxSection, provideListboxSectionState } from './listbox-section-state';

@Directive({
  selector: '[ngpListboxSection]',
  exportAs: 'ngpListboxSection',
  providers: [provideListboxSectionState()],
})
export class NgpListboxSection {
  constructor() {
    ngpListboxSection();
  }
}
