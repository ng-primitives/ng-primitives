/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ExistingProvider, InjectionToken, Type, inject } from '@angular/core';
import type { Stateless } from 'ng-primitives/state';
import type { NgpPagination } from './pagination.directive';

export const NgpPaginationToken = new InjectionToken<Stateless<NgpPagination>>(
  'NgpPaginationToken',
);

/**
 * Inject the Pagination directive instance
 */
export function injectPagination(): Stateless<NgpPagination> {
  return inject(NgpPaginationToken);
}

export function providePagination(pagination: Type<NgpPagination>): ExistingProvider {
  return { provide: NgpPaginationToken, useExisting: pagination };
}
