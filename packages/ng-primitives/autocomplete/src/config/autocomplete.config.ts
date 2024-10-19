/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, Provider, inject } from '@angular/core';

export interface NgpAutocompleteConfig {
  /** Whether to automatically select the first option */
  autoActiveFirstOption: boolean;
}

export const defaultAutocompleteConfig: NgpAutocompleteConfig = {
  autoActiveFirstOption: true,
};

export const NgpAutocompleteConfigToken = new InjectionToken<NgpAutocompleteConfig>(
  'NgpAutocompleteConfigToken',
);

/**
 * Provide the default Autocomplete configuration
 * @param config The Autocomplete configuration
 * @returns The provider
 */
export function provideAutocompleteConfig(config: Partial<NgpAutocompleteConfig>): Provider[] {
  return [
    {
      provide: NgpAutocompleteConfigToken,
      useValue: { ...defaultAutocompleteConfig, ...config },
    },
  ];
}

/**
 * Inject the Autocomplete configuration
 * @returns The global Autocomplete configuration
 */
export function injectAutocompleteConfig(): NgpAutocompleteConfig {
  return inject(NgpAutocompleteConfigToken, { optional: true }) ?? defaultAutocompleteConfig;
}
