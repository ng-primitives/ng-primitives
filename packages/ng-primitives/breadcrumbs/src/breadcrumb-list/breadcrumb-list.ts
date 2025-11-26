import { Directive } from '@angular/core';
import { ngpBreadcrumbList, provideBreadcrumbListState } from './breadcrumb-list-state';

/**
 * Apply `ngpBreadcrumbList` to the ordered list that groups breadcrumb items.
 */
@Directive({
  selector: '[ngpBreadcrumbList]',
  exportAs: 'ngpBreadcrumbList',
  providers: [provideBreadcrumbListState()],
})
export class NgpBreadcrumbList {
  constructor() {
    ngpBreadcrumbList({});
  }
}
