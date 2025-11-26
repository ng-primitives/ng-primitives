import { Directive } from '@angular/core';
import { ngpBreadcrumbEllipsis, provideBreadcrumbEllipsisState } from './breadcrumb-ellipsis-state';

/**
 * Apply `ngpBreadcrumbEllipsis` to elements that represent collapsed breadcrumb items.
 */
@Directive({
  selector: '[ngpBreadcrumbEllipsis]',
  exportAs: 'ngpBreadcrumbEllipsis',
  providers: [provideBreadcrumbEllipsisState()],
})
export class NgpBreadcrumbEllipsis {
  constructor() {
    ngpBreadcrumbEllipsis({});
  }
}
