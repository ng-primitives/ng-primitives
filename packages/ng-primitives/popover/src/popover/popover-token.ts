import { inject, InjectionToken, ValueProvider } from '@angular/core';

export const NgpPopoverContextToken = new InjectionToken<unknown>('NgpPopoverContextToken');

/**
 * Inject the Popover context
 */
export function injectPopoverContext<T>(): T {
  return inject(NgpPopoverContextToken) as T;
}

/**
 * Provide the Popover context
 */
export function providePopoverContext<T>(context: T): ValueProvider {
  return { provide: NgpPopoverContextToken, useValue: context };
}
