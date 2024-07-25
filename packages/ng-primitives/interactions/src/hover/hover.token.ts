/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpHover } from './hover.directive';

export const NgpHoverToken = new InjectionToken<NgpHover>('NgpHoverToken');

/**
 * Inject the Hover directive instance
 * @returns Hover directive instance
 */
export function injectHover(): NgpHover {
  return inject(NgpHoverToken);
}
