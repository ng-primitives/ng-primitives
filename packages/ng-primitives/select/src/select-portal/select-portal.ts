import { Directive } from '@angular/core';
import { ngpSelectPortal } from './select-portal-state';

@Directive({
  selector: '[ngpSelectPortal]',
  exportAs: 'ngpSelectPortal',
})
export class NgpSelectPortal {
  constructor() {
    ngpSelectPortal({});
  }
}
