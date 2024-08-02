/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpPagination } from './pagination.directive';

export const NgpPaginationToken = new InjectionToken<NgpPagination>('NgpPaginationToken');

/**
 * Inject the Pagination directive instance
 */
export function injectPagination(): NgpPagination {
  return inject(NgpPaginationToken);
}
