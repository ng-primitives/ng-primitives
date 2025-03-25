/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpVisuallyHidden } from './visually-hidden';

export const NgpVisuallyHiddenToken = new InjectionToken<NgpVisuallyHidden>(
  'NgpVisuallyHiddenToken',
);

/**
 * Inject the VisuallyHidden directive instance
 */
export function injectVisuallyHidden(): NgpVisuallyHidden {
  return inject(NgpVisuallyHiddenToken);
}
