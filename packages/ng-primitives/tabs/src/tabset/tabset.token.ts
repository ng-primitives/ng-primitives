/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpTabset } from './tabset.directive';

export const NgpTabsetToken = new InjectionToken<NgpTabset>('NgpTabsetToken');

/**
 * Inject the Tabset directive instance
 * @returns The Tabset directive instance
 */
export function injectTabset(): NgpTabset {
  return inject(NgpTabsetToken);
}
