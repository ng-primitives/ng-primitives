/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpDialog } from './dialog.directive';

export const NgpDialogToken = new InjectionToken<NgpDialog>('NgpDialogToken');

/**
 * Inject the Dialog directive instance
 */
export function injectDialog(): NgpDialog {
  return inject(NgpDialogToken);
}
