/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpCollapsibleDirective } from './collapsible.directive';

export const NgpCollapsibleToken = new InjectionToken<NgpCollapsibleDirective>(
  'NgpCollapsibleToken',
);

/**
 * Inject the Collapsible directive instance
 * @returns The Collapsible directive instance
 */
export function injectCollapsible(): NgpCollapsibleDirective {
  return inject(NgpCollapsibleToken);
}
