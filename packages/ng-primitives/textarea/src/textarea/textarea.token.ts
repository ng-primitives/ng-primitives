/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpTextarea } from './textarea.directive';

export const NgpTextareaToken = new InjectionToken<NgpTextarea>('NgpTextareaToken');

/**
 * Inject the Textarea directive instance
 */
export function injectTextarea(): NgpTextarea {
  return inject(NgpTextareaToken);
}
