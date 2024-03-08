import { Directive } from '@angular/core';
import { NgpRovingFocusItemToken } from './roving-focus-item.token';

@Directive({
  standalone: true,
  selector: '[ngpRovingFocusItem]',
  exportAs: 'ngpRovingFocusItem',
  providers: [{ provide: NgpRovingFocusItemToken, useExisting: NgpRovingFocusItemDirective }],
})
export class NgpRovingFocusItemDirective {}
