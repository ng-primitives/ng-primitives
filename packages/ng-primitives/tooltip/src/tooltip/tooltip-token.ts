import { inject, InjectionToken, ValueProvider } from '@angular/core';

export const NgpTooltipContextToken = new InjectionToken<unknown>('NgpTooltipContextToken');

/**
 * Inject the Tooltip context
 */
export function injectTooltipContext<T>(): T {
  return inject(NgpTooltipContextToken) as T;
}

/**
 * Provide the Tooltip directive instance
 */
export function provideTooltipContext<T>(context: T): ValueProvider {
  return { provide: NgpTooltipContextToken, useValue: context };
}
