/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InjectionToken, inject } from '@angular/core';
import type { NgpCollapsibleContentDirective } from './collapsible-content.directive';

export const NgpCollapsibleContentToken = new InjectionToken<NgpCollapsibleContentDirective>(
  'NgpCollapsibleContentToken',
);

/**
 * Inject the CollapsibleContent directive instance
 * @returns The CollapsibleContent directive instance
 */
export function injectCollapsibleContent(): NgpCollapsibleContentDirective {
  return inject(NgpCollapsibleContentToken);
}
