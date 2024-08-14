/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpDialogTitle } from './dialog-title.directive';

export const NgpDialogTitleToken = new InjectionToken<NgpDialogTitle>('NgpDialogTitleToken');

/**
 * Inject the DialogTitle directive instance
 */
export function injectDialogTitle(): NgpDialogTitle {
  return inject(NgpDialogTitleToken);
}
