/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpAutocompleteOption } from './autocomplete-option.directive';

export const NgpAutocompleteOptionToken = new InjectionToken<NgpAutocompleteOption>(
  'NgpAutocompleteOptionToken',
);

/**
 * Inject the AutocompleteOption directive instance
 */
export function injectAutocompleteOption(): NgpAutocompleteOption {
  return inject(NgpAutocompleteOptionToken);
}
