/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ExistingProvider, inject, InjectionToken, Type } from '@angular/core';
import type { Stateless } from 'ng-primitives/state';
import type { NgpRadioGroup } from './radio-group.directive';

export const NgpRadioGroupToken = new InjectionToken<Stateless<NgpRadioGroup>>(
  'NgpRadioGroupToken',
);

/**
 * Inject the RadioGroup directive instance
 */
export function injectRadioGroup(): Stateless<NgpRadioGroup> {
  return inject(NgpRadioGroupToken);
}

/**
 * Provide the RadioGroup directive instance
 */
export function provideRadioGroup(type: Type<NgpRadioGroup>): ExistingProvider {
  return { provide: NgpRadioGroupToken, useExisting: type };
}
