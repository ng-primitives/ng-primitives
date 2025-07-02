import { Directive } from '@angular/core';
import { setupOverlayArrow } from 'ng-primitives/portal';

@Directive({
  selector: '[ngpTooltipArrow]',
  exportAs: 'ngpTooltipArrow',
})
export class NgpTooltipArrow {
  constructor() {
    setupOverlayArrow();
  }
}
