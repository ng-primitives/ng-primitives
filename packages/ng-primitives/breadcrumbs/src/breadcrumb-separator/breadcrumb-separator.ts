import { Directive } from '@angular/core';

/**
 * Apply `ngpBreadcrumbSeparator` between breadcrumb items to render a visual divider.
 */
@Directive({
  selector: '[ngpBreadcrumbSeparator]',
  exportAs: 'ngpBreadcrumbSeparator',
  host: {
    role: 'presentation',
    'aria-hidden': 'true',
  },
})
export class NgpBreadcrumbSeparator {}
