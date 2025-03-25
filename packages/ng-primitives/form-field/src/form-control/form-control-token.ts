/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpFormControl } from './form-control';

export const NgpFormControlToken = new InjectionToken<NgpFormControl>('NgpFormControlToken');

/**
 * Inject the FormControl directive instance
 */
export function injectFormControl(): NgpFormControl {
  return inject(NgpFormControlToken);
}
