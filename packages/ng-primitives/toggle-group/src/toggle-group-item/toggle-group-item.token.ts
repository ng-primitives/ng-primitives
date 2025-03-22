/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ExistingProvider, inject, InjectionToken, Type } from '@angular/core';
import type { NgpToggleGroupItem } from './toggle-group-item.directive';

export const NgpToggleGroupItemToken = new InjectionToken<NgpToggleGroupItem>(
  'NgpToggleGroupItemToken',
);

/**
 * Inject the ToggleGroupItem directive instance
 */
export function injectToggleGroupItem(): NgpToggleGroupItem {
  return inject(NgpToggleGroupItemToken);
}

/**
 * Provide the ToggleGroupItem directive instance
 */
export function provideToggleGroupItem(type: Type<NgpToggleGroupItem>): ExistingProvider {
  return { provide: NgpToggleGroupItemToken, useExisting: type };
}
