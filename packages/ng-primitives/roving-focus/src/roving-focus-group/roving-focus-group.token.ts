/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpRovingFocusGroupDirective } from './roving-focus-group.directive';

export const NgpRovingFocusGroupToken = new InjectionToken<NgpRovingFocusGroupDirective>(
  'NgpRovingFocusGroupToken',
);

/**
 * Inject the RovingFocusGroup directive instance
 * @returns The RovingFocusGroup directive instance
 */
export function injectRovingFocusGroup(): NgpRovingFocusGroupDirective {
  return inject(NgpRovingFocusGroupToken);
}
