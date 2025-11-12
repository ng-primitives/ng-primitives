import { Directive } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';

/**
 * Apply `ngpBreadcrumbLink` to anchors or buttons that navigate to a breadcrumb destination.
 */
@Directive({
  selector: '[ngpBreadcrumbLink]',
  exportAs: 'ngpBreadcrumbLink',
})
export class NgpBreadcrumbLink {
  constructor() {
    ngpInteractions({ hover: true, press: true, focusVisible: true });
  }
}
