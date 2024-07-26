/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpSearchFieldClear } from './search-field-clear.directive';

export const NgpSearchFieldClearToken = new InjectionToken<NgpSearchFieldClear>(
  'NgpSearchFieldClearToken',
);

/**
 * Inject the SearchFieldClear directive instance
 */
export function injectSearchFieldClear(): NgpSearchFieldClear {
  return inject(NgpSearchFieldClearToken);
}
