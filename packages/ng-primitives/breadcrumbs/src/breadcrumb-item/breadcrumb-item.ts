import { Directive } from '@angular/core';

/**
 * Apply `ngpBreadcrumbItem` to each list item in the breadcrumb trail.
 */
@Directive({
  selector: '[ngpBreadcrumbItem]',
  exportAs: 'ngpBreadcrumbItem',
  host: {
    role: 'listitem',
  },
})
export class NgpBreadcrumbItem {}
