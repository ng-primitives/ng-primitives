import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpAutocomplete } from './autocomplete';

/**
 * The state token for the Autocomplete primitive.
 */
export const NgpAutocompleteStateToken = createStateToken<NgpAutocomplete>('Autocomplete');

/**
 * Provides the Autocomplete state.
 */
export const provideAutocompleteState = createStateProvider(NgpAutocompleteStateToken);

/**
 * Injects the Autocomplete state.
 */
export const injectAutocompleteState =
  createStateInjector<NgpAutocomplete>(NgpAutocompleteStateToken);

/**
 * The Autocomplete state registration function.
 */
export const autocompleteState = createState(NgpAutocompleteStateToken);
