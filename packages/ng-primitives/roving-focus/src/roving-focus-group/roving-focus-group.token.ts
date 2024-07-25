/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpRovingFocusGroup } from './roving-focus-group.directive';

export const NgpRovingFocusGroupToken = new InjectionToken<NgpRovingFocusGroup>(
  'NgpRovingFocusGroupToken',
);

/**
 * Inject the RovingFocusGroup directive instance
 * @returns The RovingFocusGroup directive instance
 */
export function injectRovingFocusGroup(): NgpRovingFocusGroup {
  return inject(NgpRovingFocusGroupToken);
}
