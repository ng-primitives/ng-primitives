/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject, Type, ExistingProvider } from '@angular/core';
import type { Stateless } from 'ng-primitives/state';
import type { NgpToggleGroup } from './toggle-group.directive';

export const NgpToggleGroupToken = new InjectionToken<Stateless<NgpToggleGroup>>(
  'NgpToggleGroupToken',
);

/**
 * Inject the ToggleGroup directive instance
 */
export function injectToggleGroup(): Stateless<NgpToggleGroup> {
  return inject(NgpToggleGroupToken);
}

/**
 * Provide the ToggleGroup directive instance
 */
export function provideToggleGroup(type: Type<NgpToggleGroup>): ExistingProvider {
  return { provide: NgpToggleGroupToken, useExisting: type };
}
