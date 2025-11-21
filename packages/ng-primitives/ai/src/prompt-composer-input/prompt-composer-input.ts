import { Directive, HostListener } from '@angular/core';
import { explicitEffect, injectElementRef } from 'ng-primitives/internal';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { fromEvent } from 'rxjs';
import { injectPromptComposerState } from '../prompt-composer/prompt-composer-state';
import { injectThreadState } from '../thread/thread-state';
import {
  promptComposerInputState,
  providePromptComposerInputState,
} from './prompt-composer-input-state';

@Directive({
  selector: 'input[ngpPromptComposerInput], textarea[ngpPromptComposerInput]',
  exportAs: 'ngpPromptComposerInput',
  providers: [providePromptComposerInputState()],
})
export class NgpPromptComposerInput {
  protected readonly thread = injectThreadState();
  private readonly composer = injectPromptComposerState();
  private readonly element = injectElementRef<HTMLInputElement | HTMLTextAreaElement>();

  /** The state of the prompt composer input. */
  protected readonly state = promptComposerInputState<NgpPromptComposerInput>(this);

  constructor() {
    // set the initial state
    this.composer().prompt.set(this.element.nativeElement.value);

    // listen for requests to set the prompt
    this.thread()
      .requestPrompt.pipe(safeTakeUntilDestroyed())
      .subscribe(value => {
        // set the cursor to the end
        this.composer().prompt.set(value);
        this.element.nativeElement.setSelectionRange(value.length, value.length);
        this.element.nativeElement.focus();
      });

    // listen for changes to the text content
    fromEvent(this.element.nativeElement, 'input')
      .pipe(safeTakeUntilDestroyed())
      .subscribe(() => this.composer().prompt.set(this.element.nativeElement.value));

    // any time the prompt changes, update the input value if needed
    explicitEffect(
      [this.composer().prompt],
      ([prompt]) => (this.element.nativeElement.value = prompt),
    );
  }

  /**
   * If the user presses Enter, the form will be submitted, unless they are holding Shift.
   * This directive automatically handles that behavior.
   */
  @HostListener('keydown.enter', ['$event'])
  protected onEnterKey(event: Event): void {
    if (event instanceof KeyboardEvent === false || event.shiftKey) {
      return;
    }

    event.preventDefault();

    // if there is no text content, do nothing
    if (this.element.nativeElement.value.trim().length === 0) {
      return;
    }

    this.composer().submitPrompt();
  }
}
