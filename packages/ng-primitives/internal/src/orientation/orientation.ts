/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ExistingProvider, inject, InjectionToken, signal, Signal, Type } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';

export const NgpOrientationToken = new InjectionToken<NgpCanOrientate>('NgpOrientationToken');

export interface NgpCanOrientate {
  /**
   * The desired orientation.
   */
  readonly orientation: Signal<NgpOrientation>;
}

/**
 * Determine if we are in a orientation context.
 * @param orientation The orientation signal for the local context.
 * @returns The orientation signal.
 */
export function injectOrientation(
  orientation: Signal<NgpOrientation> = signal<NgpOrientation>('horizontal'),
): Signal<NgpOrientation> {
  const provider = inject(NgpOrientationToken, { optional: true });

  return provider ? provider.orientation : orientation;
}

/**
 * Provide the orientation context.
 * @param orientation The orientation signal for the local context.
 * @returns The orientation context.
 */
export function provideOrientation(type: Type<NgpCanOrientate>): ExistingProvider {
  return { provide: NgpOrientationToken, useExisting: type };
}
