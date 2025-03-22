/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject, Type, ExistingProvider } from '@angular/core';
import type { Stateless } from 'ng-primitives/state';
import type { NgpTabset } from './tabset.directive';

export const NgpTabsetToken = new InjectionToken<Stateless<NgpTabset>>('NgpTabsetToken');

/**
 * Inject the Tabset directive instance
 */
export function injectTabset(): Stateless<NgpTabset> {
  return inject(NgpTabsetToken);
}

/**
 * Provide the Tabset directive instance
 */
export function provideTabset(type: Type<NgpTabset>): ExistingProvider {
  return { provide: NgpTabsetToken, useExisting: type };
}
