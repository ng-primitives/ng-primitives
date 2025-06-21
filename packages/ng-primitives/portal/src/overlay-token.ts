import { inject, InjectionToken, Signal, ValueProvider } from '@angular/core';

const NgpOverlayContextToken = new InjectionToken<unknown>('NgpOverlayContextToken');

/**
 * Injects the context for the overlay.
 * @internal
 */
export function injectOverlayContext<T>(): Signal<T> {
  return inject(NgpOverlayContextToken) as Signal<T>;
}

/**
 * Provides the context for the overlay.
 * @param value The value to provide as the context.
 * @internal
 */
export function provideOverlayContext<T>(value: Signal<T | undefined> | undefined): ValueProvider {
  return { provide: NgpOverlayContextToken, useValue: value };
}
