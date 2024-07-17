/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpSelectDropdown } from './select-dropdown.directive';

export const NgpSelectDropdownToken = new InjectionToken<NgpSelectDropdown>(
  'NgpSelectDropdownToken',
);

/**
 * Inject the SelectDropdown directive instance
 */
export function injectSelectDropdown(): NgpSelectDropdown {
  return inject(NgpSelectDropdownToken);
}
