import { Directive } from '@angular/core';
import { ngpBreadcrumbs, provideBreadcrumbsState } from './breadcrumbs-state';

/**
 * Apply `ngpBreadcrumbs` to the navigation element that wraps the breadcrumb trail.
 */
@Directive({
  selector: '[ngpBreadcrumbs]',
  exportAs: 'ngpBreadcrumbs',
  providers: [provideBreadcrumbsState()],
})
export class NgpBreadcrumbs {
  constructor() {
    ngpBreadcrumbs({});
  }
}
