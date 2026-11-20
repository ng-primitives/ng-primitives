import { Directive, input, output } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import {
  coerceFragmentMatcher,
  type NgpAutocompleteFragment,
  type NgpAutocompleteFragmentMatcher,
  type NgpAutocompleteFragmentMatcherInput,
} from './autocomplete-fragment';
import { ngpAutocompleteInput, provideAutocompleteInputState } from './autocomplete-input-state';

@Directive({
  selector: 'input[ngpAutocompleteInput], textarea[ngpAutocompleteInput]',
  exportAs: 'ngpAutocompleteInput',
  providers: [provideAutocompleteInputState()],
})
export class NgpAutocompleteInput {
  /** The id of the input. */
  readonly id = input<string>(uniqueId('ngp-autocomplete-input'));

  /**
   * Find the fragment to search by, such as a mention under the caret. Pass trigger characters
   * such as `'@'`, or a matcher function. Without a matcher, the whole text is the query.
   */
  readonly fragmentMatcher = input<
    NgpAutocompleteFragmentMatcher | undefined,
    NgpAutocompleteFragmentMatcherInput | null | undefined
  >(undefined, {
    alias: 'ngpAutocompleteInputFragmentMatcher',
    transform: coerceFragmentMatcher,
  });

  /**
   * The text to complete the query with, usually the active option's label. When it starts with
   * the query, the rest is written after the caret and selected, so typing replaces it.
   */
  readonly suggestion = input<string>(undefined, {
    alias: 'ngpAutocompleteInputSuggestion',
  });

  /** Emits the fragment under the caret when it changes, `null` when there is none. */
  readonly fragmentChange = output<NgpAutocompleteFragment | null>({
    alias: 'ngpAutocompleteInputFragmentChange',
  });

  protected readonly state = ngpAutocompleteInput({
    id: this.id,
    fragmentMatcher: this.fragmentMatcher,
    suggestion: this.suggestion,
    onFragmentChange: fragment => this.fragmentChange.emit(fragment),
  });

  /**
   * Replace the fragment, or the whole text without a fragment matcher, and put the caret after
   * the new text. Dispatches an `input` event, so bindings and forms pick the text up.
   */
  replaceFragment(text: string): void {
    this.state.replaceFragment(text);
  }
}
