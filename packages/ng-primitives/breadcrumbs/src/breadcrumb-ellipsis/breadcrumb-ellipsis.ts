import { Directive } from '@angular/core';

/**
 * Apply `ngpBreadcrumbEllipsis` to elements that represent collapsed breadcrumb items.
 */
@Directive({
  selector: '[ngpBreadcrumbEllipsis]',
  exportAs: 'ngpBreadcrumbEllipsis',
  host: {
    role: 'presentation',
    'aria-hidden': 'true',
  },
})
export class NgpBreadcrumbEllipsis {}
