import { Directive } from '@angular/core';

/**
 * Apply `ngpBreadcrumbs` to the navigation element that wraps the breadcrumb trail.
 */
@Directive({
  selector: '[ngpBreadcrumbs]',
  exportAs: 'ngpBreadcrumbs',
  host: {
    role: 'navigation',
  },
})
export class NgpBreadcrumbs {}
