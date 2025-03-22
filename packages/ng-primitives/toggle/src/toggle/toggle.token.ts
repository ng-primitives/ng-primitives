/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ExistingProvider, inject, InjectionToken, Type } from '@angular/core';
import type { NgpToggle } from './toggle.directive';

export const NgpToggleToken = new InjectionToken<NgpToggle>('NgpToggleToken');

/**
 * Inject the Toggle directive instance
 */
export function injectToggle(): NgpToggle {
  return inject(NgpToggleToken);
}

/**
 * Provide the Toggle directive instance
 */
export function provideToggle(type: Type<NgpToggle>): ExistingProvider {
  return { provide: NgpToggleToken, useExisting: type };
}
