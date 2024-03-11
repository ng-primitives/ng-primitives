import { InjectionToken, inject } from '@angular/core';
import type { NgpCheckboxIndicatorDirective } from './checkbox-indicator.directive';

export const NgpCheckboxIndicatorToken = new InjectionToken<NgpCheckboxIndicatorDirective>(
  'NgpCheckboxIndicatorToken',
);

/**
 * Inject the CheckboxIndicator directive instance
 * @returns The CheckboxIndicator directive instance
 */
export function injectCheckboxIndicator(): NgpCheckboxIndicatorDirective {
  return inject(NgpCheckboxIndicatorToken);
}
