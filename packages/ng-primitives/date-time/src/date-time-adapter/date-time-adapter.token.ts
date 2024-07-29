/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ClassProvider, InjectionToken, Type, inject } from '@angular/core';
import { NgpNativeDateTimeAdapter } from '../native-date-adapter/native-date-adapter';
import type { NgpDateTimeAdapter } from './date-time-adapter';

export const NgpDateTimeAdapterToken = new InjectionToken<NgpDateTimeAdapter<unknown>>(
  'NgpDateTimeAdapterToken',
);

/**
 * Inject the DateTimeAdapter instance
 */
export function injectDateTimeAdapter<T>(): NgpDateTimeAdapter<T> {
  return (
    (inject(NgpDateTimeAdapterToken, { optional: true }) as NgpDateTimeAdapter<T>) ||
    new NgpNativeDateTimeAdapter()
  );
}

/**
 * Provide the DateTimeAdapter instance
 */
export function provideDateTimeAdapter<T>(adapter: Type<NgpDateTimeAdapter<T>>): ClassProvider {
  return { provide: NgpDateTimeAdapterToken, useClass: adapter };
}
