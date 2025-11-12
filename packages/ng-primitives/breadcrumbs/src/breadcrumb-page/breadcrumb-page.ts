import { Directive } from '@angular/core';

/**
 * Apply `ngpBreadcrumbPage` to non-link content that represents the active page.
 */
@Directive({
  selector: '[ngpBreadcrumbPage]',
  exportAs: 'ngpBreadcrumbPage',
  host: {
    'aria-current': 'page',
  },
})
export class NgpBreadcrumbPage {}
