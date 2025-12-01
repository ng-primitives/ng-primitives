import { Directive } from '@angular/core';
import { ngpBreadcrumbItem, provideBreadcrumbItemState } from './breadcrumb-item-state';

/**
 * Apply `ngpBreadcrumbItem` to each list item in the breadcrumb trail.
 */
@Directive({
  selector: '[ngpBreadcrumbItem]',
  exportAs: 'ngpBreadcrumbItem',
  providers: [provideBreadcrumbItemState()],
})
export class NgpBreadcrumbItem {
  constructor() {
    ngpBreadcrumbItem({});
  }
}
