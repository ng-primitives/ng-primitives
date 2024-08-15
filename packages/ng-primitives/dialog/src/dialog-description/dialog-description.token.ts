/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpDialogDescription } from './dialog-description.directive';

export const NgpDialogDescriptionToken = new InjectionToken<NgpDialogDescription>(
  'NgpDialogDescriptionToken',
);

/**
 * Inject the DialogDescription directive instance
 */
export function injectDialogDescription(): NgpDialogDescription {
  return inject(NgpDialogDescriptionToken);
}
