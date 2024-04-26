/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpTabsetDirective } from './tabset.directive';

export const NgpTabsetToken = new InjectionToken<NgpTabsetDirective>('NgpTabsetToken');

/**
 * Inject the Tabset directive instance
 * @returns The Tabset directive instance
 */
export function injectTabset(): NgpTabsetDirective {
  return inject(NgpTabsetToken);
}
