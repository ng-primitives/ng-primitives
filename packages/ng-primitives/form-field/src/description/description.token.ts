/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpDescription } from './description.directive';

export const NgpDescriptionToken = new InjectionToken<NgpDescription>('NgpDescriptionToken');

/**
 * Inject the Description directive instance
 */
export function injectDescription(): NgpDescription {
  return inject(NgpDescriptionToken);
}
