import { InjectionToken, inject } from '@angular/core';
import type { NgpCollapsibleDirective } from './collapsible.directive';

export const NgpCollapsibleToken = new InjectionToken<NgpCollapsibleDirective>(
  'NgpCollapsibleToken',
);

/**
 * Inject the Collapsible directive instance
 * @returns The Collapsible directive instance
 */
export function injectCollapsible(): NgpCollapsibleDirective {
  return inject(NgpCollapsibleToken);
}
