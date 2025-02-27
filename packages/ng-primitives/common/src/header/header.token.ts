/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpHeader } from './header.directive';

export const NgpHeaderToken = new InjectionToken<NgpHeader>('NgpHeaderToken');

/**
 * Inject the Header directive instance
 */
export function injectHeader(): NgpHeader {
  return inject(NgpHeaderToken);
}
