/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpError } from './error';

export const NgpErrorToken = new InjectionToken<NgpError>('NgpErrorToken');

/**
 * Inject the Error directive instance
 */
export function injectError(): NgpError {
  return inject(NgpErrorToken);
}
