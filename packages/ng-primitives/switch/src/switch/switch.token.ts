/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject, Type, ExistingProvider } from '@angular/core';
import type { Stateless } from 'ng-primitives/state';
import type { NgpSwitch } from './switch.directive';

export const NgpSwitchToken = new InjectionToken<Stateless<NgpSwitch>>('NgpSwitchToken');

/**
 * Inject the Switch directive instance
 */
export function injectSwitch(): Stateless<NgpSwitch> {
  return inject(NgpSwitchToken);
}

/**
 * Provide the Switch directive instance
 */
export function provideSwitch(type: Type<NgpSwitch>): ExistingProvider {
  return { provide: NgpSwitchToken, useExisting: type };
}
