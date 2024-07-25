/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpSwitch } from './switch.directive';

export const NgpSwitchToken = new InjectionToken<NgpSwitch>('NgpSwitchToken');

/**
 * Inject the Switch directive instance
 * @returns The switch directive instance
 */
export function injectSwitch(): NgpSwitch {
  return inject(NgpSwitchToken);
}
