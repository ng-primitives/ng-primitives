/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpMenuTrigger } from './menu-trigger.directive';

export const NgpMenuTriggerToken = new InjectionToken<NgpMenuTrigger>('NgpMenuTriggerToken');

/**
 * Inject the MenuTrigger directive instance
 */
export function injectMenuTrigger(): NgpMenuTrigger {
  return inject(NgpMenuTriggerToken);
}
