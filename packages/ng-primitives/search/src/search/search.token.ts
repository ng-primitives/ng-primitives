/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpSearch } from './search.directive';

export const NgpSearchToken = new InjectionToken<NgpSearch>('NgpSearchToken');

/**
 * Inject the Search directive instance
 */
export function injectSearch(): NgpSearch {
  return inject(NgpSearchToken);
}
