/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpPaginationLast } from './pagination-last';

export const NgpPaginationLastToken = new InjectionToken<NgpPaginationLast>(
  'NgpPaginationLastToken',
);

/**
 * Inject the PaginationLast directive instance
 */
export function injectPaginationLast(): NgpPaginationLast {
  return inject(NgpPaginationLastToken);
}
