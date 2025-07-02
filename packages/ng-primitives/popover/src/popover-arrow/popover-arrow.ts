import { Directive } from '@angular/core';
import { setupOverlayArrow } from 'ng-primitives/portal';

@Directive({
  selector: '[ngpPopoverArrow]',
  exportAs: 'ngpPopoverArrow',
})
export class NgpPopoverArrow {
  constructor() {
    setupOverlayArrow();
  }
}
