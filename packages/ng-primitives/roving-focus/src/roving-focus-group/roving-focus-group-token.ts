/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { FactoryProvider, InjectionToken, Type, inject } from '@angular/core';
import { NgpRovingFocusGroup } from './roving-focus-group';

export const NgpRovingFocusGroupToken = new InjectionToken<NgpRovingFocusGroup>(
  'NgpRovingFocusGroupToken',
);

/**
 * Inject the RovingFocusGroup directive instance
 * @returns The RovingFocusGroup directive instance
 */
export function injectRovingFocusGroup(): NgpRovingFocusGroup {
  return inject(NgpRovingFocusGroupToken);
}

/**
 * Provide the RovingFocusGroup directive instance
 * @param type The RovingFocusGroup directive type
 * @returns The RovingFocusGroup token
 */
export function provideRovingFocusGroup(type: Type<NgpRovingFocusGroup>): FactoryProvider {
  return {
    provide: NgpRovingFocusGroupToken,
    // Roving focus groups may be nested, in this case, the parent group should be used
    useFactory: () =>
      inject(NgpRovingFocusGroupToken, { skipSelf: true, optional: true }) ??
      inject(type, { self: true }),
  };
}
