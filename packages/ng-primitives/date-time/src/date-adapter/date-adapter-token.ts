import { ClassProvider, InjectionToken, Type, inject } from '@angular/core';
import { NgpNativeDateAdapter } from '../native-date-adapter/native-date-adapter';
import type { NgpDateAdapter } from './date-adapter';

export const NgpDateAdapterToken = new InjectionToken<NgpDateAdapter<unknown>>(
  'NgpDateAdapterToken',
);

/**
 * Inject the DateAdapter instance
 */
export function injectDateAdapter<T>(): NgpDateAdapter<T> {
  return (
    (inject(NgpDateAdapterToken, { optional: true }) as NgpDateAdapter<T>) ||
    new NgpNativeDateAdapter()
  );
}

/**
 * Provide the DateAdapter instance
 */
export function provideDateAdapter<T>(adapter: Type<NgpDateAdapter<T>>): ClassProvider {
  return { provide: NgpDateAdapterToken, useClass: adapter };
}
