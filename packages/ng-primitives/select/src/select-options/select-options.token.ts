/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpSelectOptionsDirective } from './select-options.directive';

export const NgpSelectOptionsToken = new InjectionToken<NgpSelectOptionsDirective>(
  'NgpSelectOptionsToken',
);

/**
 * Inject the SelectOptions directive instance
 */
export function injectSelectOptions(): NgpSelectOptionsDirective {
  return inject(NgpSelectOptionsToken);
}
