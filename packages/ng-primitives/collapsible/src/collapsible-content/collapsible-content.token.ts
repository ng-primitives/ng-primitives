import { InjectionToken, inject } from '@angular/core';
import type { NgpCollapsibleContentDirective } from './collapsible-content.directive';

export const NgpCollapsibleContentToken = new InjectionToken<NgpCollapsibleContentDirective>(
  'NgpCollapsibleContentToken',
);

/**
 * Inject the CollapsibleContent directive instance
 * @returns The CollapsibleContent directive instance
 */
export function injectCollapsibleContent(): NgpCollapsibleContentDirective {
  return inject(NgpCollapsibleContentToken);
}
