/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpPopoverTrigger } from './popover-trigger';

export const NgpPopoverTriggerToken = new InjectionToken<NgpPopoverTrigger>(
  'NgpPopoverTriggerToken',
);

/**
 * Inject the PopoverTrigger directive instance
 */
export function injectPopoverTrigger(): NgpPopoverTrigger {
  return inject(NgpPopoverTriggerToken);
}

/**
 * Provides the PopoverTrigger directive instance
 * @param trigger
 */
export function providePopoverTrigger(trigger: NgpPopoverTrigger) {
  return { provide: NgpPopoverTriggerToken, useValue: trigger };
}
