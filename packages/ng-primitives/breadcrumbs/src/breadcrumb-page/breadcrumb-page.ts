import { Directive } from '@angular/core';
import { ngpBreadcrumbPage, provideBreadcrumbPageState } from './breadcrumb-page-state';

/**
 * Apply `ngpBreadcrumbPage` to non-link content that represents the active page.
 */
@Directive({
  selector: '[ngpBreadcrumbPage]',
  exportAs: 'ngpBreadcrumbPage',
  providers: [provideBreadcrumbPageState()],
})
export class NgpBreadcrumbPage {
  constructor() {
    ngpBreadcrumbPage({});
  }
}
