/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpDialogPanel } from './dialog-panel.directive';

export const NgpDialogPanelToken = new InjectionToken<NgpDialogPanel>('NgpDialogPanelToken');

/**
 * Inject the DialogPanel directive instance
 */
export function injectDialogPanel(): NgpDialogPanel {
  return inject(NgpDialogPanelToken);
}
