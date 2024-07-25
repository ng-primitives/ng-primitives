/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpRovingFocusItem } from './roving-focus-item.directive';

export const NgpRovingFocusItemToken = new InjectionToken<NgpRovingFocusItem>(
  'NgpRovingFocusItemToken',
);

/**
 * Inject the RovingFocusItem directive instance
 * @returns The RovingFocusItem directive instance
 */
export function injectRovingFocusItem(): NgpRovingFocusItem {
  return inject(NgpRovingFocusItemToken);
}
