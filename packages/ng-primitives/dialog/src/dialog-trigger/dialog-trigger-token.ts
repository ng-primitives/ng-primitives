/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpDialogTrigger } from './dialog-trigger';

export const NgpDialogTriggerToken = new InjectionToken<NgpDialogTrigger>('NgpDialogTriggerToken');

/**
 * Inject the DialogTrigger directive instance
 */
export function injectDialogTrigger(): NgpDialogTrigger {
  return inject(NgpDialogTriggerToken);
}
