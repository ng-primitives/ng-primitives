/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpMenuItem } from './menu-item.directive';

export const NgpMenuItemToken = new InjectionToken<NgpMenuItem>('NgpMenuItemToken');

/**
 * Inject the MenuItem directive instance
 */
export function injectMenuItem(): NgpMenuItem {
  return inject(NgpMenuItemToken);
}
