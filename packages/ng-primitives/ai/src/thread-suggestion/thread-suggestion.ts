import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import {
  ngpThreadSuggestionPattern,
  provideThreadSuggestionPattern,
} from './thread-suggestion-pattern';

@Directive({
  selector: 'button[ngpThreadSuggestion]',
  exportAs: 'ngpThreadSuggestion',
  providers: [provideThreadSuggestionPattern(NgpThreadSuggestion, instance => instance.pattern)],
})
export class NgpThreadSuggestion {
  /** The suggested text to display in the input field. */
  readonly suggestion = input<string>('', { alias: 'ngpThreadSuggestion' });

  /** Whether the suggestion should populate the prompt when clicked. */
  readonly setPromptOnClick = input<boolean, BooleanInput>(true, {
    alias: 'ngpThreadSuggestionSetPromptOnClick',
    transform: booleanAttribute,
  });

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpThreadSuggestionPattern({
    suggestion: this.suggestion,
    setPromptOnClick: this.setPromptOnClick,
  });

  submitSuggestion(): void {
    this.pattern.submitSuggestion();
  }
}
