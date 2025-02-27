/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpListboxSection } from './listbox-section.directive';

export const NgpListboxSectionToken = new InjectionToken<NgpListboxSection>(
  'NgpListboxSectionToken',
);

/**
 * Inject the ListboxSection directive instance
 */
export function injectListboxSection(): NgpListboxSection {
  return inject(NgpListboxSectionToken);
}
