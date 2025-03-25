/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ExistingProvider, InjectionToken, Type, inject } from '@angular/core';
import type { NgpToolbar } from './toolbar';

export const NgpToolbarToken = new InjectionToken<NgpToolbar>('NgpToolbarToken');

/**
 * Inject the Toolbar directive instance
 */
export function injectToolbar(): NgpToolbar {
  return inject(NgpToolbarToken);
}

/**
 * Provide the Toolbar directive instance
 */
export function provideToolbar(type: Type<NgpToolbar>): ExistingProvider {
  return { provide: NgpToolbarToken, useExisting: type };
}
