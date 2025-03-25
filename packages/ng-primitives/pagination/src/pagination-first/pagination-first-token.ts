/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpPaginationFirst } from './pagination-first';

export const NgpPaginationFirstToken = new InjectionToken<NgpPaginationFirst>(
  'NgpPaginationFirstToken',
);

/**
 * Inject the PaginationFirst directive instance
 */
export function injectPaginationFirst(): NgpPaginationFirst {
  return inject(NgpPaginationFirstToken);
}
