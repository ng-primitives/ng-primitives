import { Directive } from '@angular/core';
import { ngpListboxTrigger } from './listbox-trigger-state';

@Directive({
  selector: '[ngpListboxTrigger]',
  exportAs: 'ngpListboxTrigger',
})
export class NgpListboxTrigger {
  constructor() {
    ngpListboxTrigger();
  }
}
