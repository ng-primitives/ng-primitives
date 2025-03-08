/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpListboxTrigger } from './listbox-trigger.directive';

export const NgpListboxTriggerToken = new InjectionToken<NgpListboxTrigger>(
  'NgpListboxTriggerToken',
);

/**
 * Inject the ListboxTrigger directive instance
 */
export function injectListboxTrigger(): NgpListboxTrigger {
  return inject(NgpListboxTriggerToken);
}
