/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ExistingProvider, inject, InjectionToken, Type } from '@angular/core';
import type { NgpProgress } from './progress.directive';

export const NgpProgressToken = new InjectionToken<NgpProgress>('NgpProgressToken');

/**
 * Inject the Progress directive instance
 */
export function injectProgress(): NgpProgress {
  return inject(NgpProgressToken);
}

/**
 * Provide the Progress directive instance
 */
export function provideProgress(type: Type<NgpProgress>): ExistingProvider {
  return { provide: NgpProgressToken, useExisting: type };
}
