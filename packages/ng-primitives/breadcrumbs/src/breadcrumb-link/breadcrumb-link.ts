import { Directive } from '@angular/core';
import { ngpBreadcrumbLink, provideBreadcrumbLinkState } from './breadcrumb-link-state';

/**
 * Apply `ngpBreadcrumbLink` to anchors or buttons that navigate to a breadcrumb destination.
 */
@Directive({
  selector: '[ngpBreadcrumbLink]',
  exportAs: 'ngpBreadcrumbLink',
  providers: [provideBreadcrumbLinkState()],
})
export class NgpBreadcrumbLink {
  constructor() {
    ngpBreadcrumbLink({});
  }
}
