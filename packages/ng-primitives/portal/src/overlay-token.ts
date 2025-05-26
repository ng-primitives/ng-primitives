import { inject, InjectionToken, ValueProvider } from '@angular/core';

const NgpOverlayContextToken = new InjectionToken<unknown>('NgpOverlayContextToken');

/**
 * Injects the context for the overlay.
 * @internal
 */
export function injectOverlayContext<T>(): T {
  return inject(NgpOverlayContextToken) as T;
}

/**
 * Provides the context for the overlay.
 * @param value The value to provide as the context.
 * @internal
 */
export function provideOverlayContext<T>(value: T): ValueProvider {
  return { provide: NgpOverlayContextToken, useValue: value };
}
