import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, HostListener, input } from '@angular/core';
import { injectThreadState } from '../thread/thread-state';
import { provideThreadSuggestionState, threadSuggestionState } from './thread-suggestion-state';

@Directive({
  selector: 'button[ngpThreadSuggestion]',
  exportAs: 'ngpThreadSuggestion',
  providers: [provideThreadSuggestionState()],
})
export class NgpThreadSuggestion {
  private readonly thread = injectThreadState();

  /** The suggested text to display in the input field. */
  readonly suggestion = input<string>('', { alias: 'ngpThreadSuggestion' });

  /** Whether the suggestion should populate the prompt when clicked. */
  readonly setPromptOnClick = input<boolean, BooleanInput>(true, {
    alias: 'ngpThreadSuggestionSetPromptOnClick',
    transform: booleanAttribute,
  });

  /** The state of the thread suggestion. */
  protected readonly state = threadSuggestionState<NgpThreadSuggestion>(this);

  @HostListener('click')
  submitSuggestion(): void {
    if (this.state.setPromptOnClick() && this.state.suggestion().length > 0) {
      this.thread().setPrompt(this.state.suggestion());
    }
  }
}
