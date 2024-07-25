/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpLabel } from './label.directive';

export const NgpLabelToken = new InjectionToken<NgpLabel>('NgpLabelToken');

/**
 * Inject the Label directive instance
 */
export function injectLabel(): NgpLabel {
  return inject(NgpLabelToken);
}
