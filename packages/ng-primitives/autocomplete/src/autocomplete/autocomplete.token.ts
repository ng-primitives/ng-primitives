/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpAutocomplete } from './autocomplete.directive';

export const NgpAutocompleteToken = new InjectionToken<NgpAutocomplete>('NgpAutocompleteToken');

/**
 * Inject the Autocomplete directive instance
 */
export function injectAutocomplete(): NgpAutocomplete {
  return inject(NgpAutocompleteToken);
}
