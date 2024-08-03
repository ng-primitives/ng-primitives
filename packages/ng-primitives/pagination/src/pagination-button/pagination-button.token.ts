/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpPaginationButton } from './pagination-button.directive';

export const NgpPaginationButtonToken = new InjectionToken<NgpPaginationButton>(
  'NgpPaginationButtonToken',
);

/**
 * Inject the PaginationButton directive instance
 */
export function injectPaginationButton(): NgpPaginationButton {
  return inject(NgpPaginationButtonToken);
}
