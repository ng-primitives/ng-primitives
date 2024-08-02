/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpPaginationPrevious } from './pagination-previous.directive';

export const NgpPaginationPreviousToken = new InjectionToken<NgpPaginationPrevious>(
  'NgpPaginationPreviousToken',
);

/**
 * Inject the PaginationPrevious directive instance
 */
export function injectPaginationPrevious(): NgpPaginationPrevious {
  return inject(NgpPaginationPreviousToken);
}
