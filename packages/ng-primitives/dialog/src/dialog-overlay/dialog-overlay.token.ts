/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpDialogOverlay } from './dialog-overlay.directive';

export const NgpDialogOverlayToken = new InjectionToken<NgpDialogOverlay>('NgpDialogOverlayToken');

/**
 * Inject the DialogOverlay directive instance
 */
export function injectDialogOverlay(): NgpDialogOverlay {
  return inject(NgpDialogOverlayToken);
}
