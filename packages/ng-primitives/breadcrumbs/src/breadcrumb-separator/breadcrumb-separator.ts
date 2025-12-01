import { Directive } from '@angular/core';
import {
  ngpBreadcrumbSeparator,
  provideBreadcrumbSeparatorState,
} from './breadcrumb-separator-state';

/**
 * Apply `ngpBreadcrumbSeparator` between breadcrumb items to render a visual divider.
 */
@Directive({
  selector: '[ngpBreadcrumbSeparator]',
  exportAs: 'ngpBreadcrumbSeparator',
  providers: [provideBreadcrumbSeparatorState()],
})
export class NgpBreadcrumbSeparator {
  constructor() {
    ngpBreadcrumbSeparator({});
  }
}
