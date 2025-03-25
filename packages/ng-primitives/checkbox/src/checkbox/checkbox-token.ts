/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ExistingProvider, InjectionToken, Type, inject } from '@angular/core';
import type { NgpCheckbox } from './checkbox';

export const NgpCheckboxToken = new InjectionToken<NgpCheckbox>('NgpCheckboxToken');

/**
 * Inject the Checkbox directive instance
 * @returns The Checkbox directive instance
 */
export function injectCheckbox(): NgpCheckbox {
  return inject(NgpCheckboxToken);
}

/**
 * Provide the Checkbox directive instance
 * @param checkbox The Checkbox directive
 * @returns The Checkbox directive provider
 */
export function provideCheckbox(checkbox: Type<NgpCheckbox>): ExistingProvider {
  return { provide: NgpCheckboxToken, useExisting: checkbox };
}
