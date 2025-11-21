import { Directive } from '@angular/core';

/**
 * Apply `ngpBreadcrumbList` to the ordered list that groups breadcrumb items.
 */
@Directive({
  selector: '[ngpBreadcrumbList]',
  exportAs: 'ngpBreadcrumbList',
  host: {
    role: 'list',
  },
})
export class NgpBreadcrumbList {}
