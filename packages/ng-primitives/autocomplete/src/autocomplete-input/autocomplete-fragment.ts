/** The part of the input text the autocomplete searches by, such as `@ma` in `Hi @ma`. */
export interface NgpAutocompleteFragment {
  /** Where the fragment starts, the start of the text a selected option usually replaces. */
  readonly start: number;

  /** Where the fragment ends, usually the caret. */
  readonly end: number;

  /** The text to search by. It must end at `end`, and can leave out a trigger character. */
  readonly query: string;
}

/** Find the fragment under the caret, or `null` when the caret is not in one. */
export type NgpAutocompleteFragmentMatcher = (
  text: string,
  caret: number,
) => NgpAutocompleteFragment | null;

/** A fragment matcher, or the trigger characters `createFragmentMatcher` builds one from. */
export type NgpAutocompleteFragmentMatcherInput =
  | NgpAutocompleteFragmentMatcher
  | string
  | readonly string[];

/**
 * Create a matcher for the word under the caret when it starts with one of the triggers, such as
 * `@` for mentions or `#` for hashtags. The query leaves out the trigger.
 */
export function createFragmentMatcher(
  trigger: string | readonly string[],
): NgpAutocompleteFragmentMatcher {
  const triggers = typeof trigger === 'string' ? [trigger] : trigger;

  return (text, caret) => {
    // the word runs back from the caret to the previous whitespace, so `a@b` is not a mention
    let start = caret;

    while (start > 0 && !/\s/.test(text[start - 1])) {
      start--;
    }

    const word = text.slice(start, caret);
    const match = triggers.find(candidate => word.startsWith(candidate));

    return match ? { start, end: caret, query: word.slice(match.length) } : null;
  };
}

/** Build a matcher from trigger characters, and pass a matcher function through. */
export function coerceFragmentMatcher(
  value: NgpAutocompleteFragmentMatcherInput | null | undefined,
): NgpAutocompleteFragmentMatcher | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  return typeof value === 'function' ? value : createFragmentMatcher(value);
}
