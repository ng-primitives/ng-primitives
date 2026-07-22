import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ngpThreadSuggestion, provideThreadSuggestionState } from './thread-suggestion-state';

@Directive({
  selector: 'button[ngpThreadSuggestion]',
  exportAs: 'ngpThreadSuggestion',
  providers: [provideThreadSuggestionState()],
})
export class NgpThreadSuggestion {
  /** The suggested text to display in the input field. */
  readonly suggestion = input<string>('', { alias: 'ngpThreadSuggestion' });

  /** Whether the suggestion should populate the prompt when clicked. */
  readonly setPromptOnClick = input<boolean, BooleanInput>(true, {
    alias: 'ngpThreadSuggestionSetPromptOnClick',
    transform: booleanAttribute,
  });

  /** The state of the thread suggestion. */
  protected readonly state = ngpThreadSuggestion({
    suggestion: this.suggestion,
    setPromptOnClick: this.setPromptOnClick,
  });

  /** Populate the prompt with this suggestion. */
  submitSuggestion(): void {
    this.state.submitSuggestion();
  }
}
