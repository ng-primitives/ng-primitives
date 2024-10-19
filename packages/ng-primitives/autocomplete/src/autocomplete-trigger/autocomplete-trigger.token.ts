/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpAutocompleteTrigger } from './autocomplete-trigger.directive';

export const NgpAutocompleteTriggerToken = new InjectionToken<NgpAutocompleteTrigger>(
  'NgpAutocompleteTriggerToken',
);

/**
 * Inject the AutocompleteTrigger directive instance
 */
export function injectAutocompleteTrigger(): NgpAutocompleteTrigger {
  return inject(NgpAutocompleteTriggerToken);
}
