import { Directive, HostListener, inject } from '@angular/core';
import { explicitEffect, injectElementRef } from 'ng-primitives/internal';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { fromEvent } from 'rxjs';
import { NgpPromptComposer } from '../prompt-composer/prompt-composer';

@Directive({
  selector: 'input[ngpPromptComposerInput], textarea[ngpPromptComposerInput]',
  exportAs: 'ngpPromptComposerInput',
})
export class NgpPromptComposerInput {
  private readonly composed = inject(NgpPromptComposer);
  private readonly element = injectElementRef<HTMLInputElement | HTMLTextAreaElement>();

  constructor() {
    // set the initial state
    this.composed.prompt.set(this.element.nativeElement.value);

    // listen for changes to the text content
    fromEvent(this.element.nativeElement, 'input')
      .pipe(safeTakeUntilDestroyed())
      .subscribe(() => this.composed.prompt.set(this.element.nativeElement.value));

    // any time the prompt changes, update the input value if needed
    explicitEffect(
      [this.composed.prompt],
      ([prompt]) => (this.element.nativeElement.value = prompt),
    );
  }

  /**
   * If the user presses Enter, the form will be submitted, unless they are holding Shift.
   * This directive automatically handles that behavior.
   */
  @HostListener('keydown.enter', ['$event'])
  protected onEnterKey(event: KeyboardEvent): void {
    if (event.shiftKey) {
      return;
    }

    event.preventDefault();

    // if there is no text content, do nothing
    if (this.element.nativeElement.value.trim().length === 0) {
      return;
    }

    this.composed.submitPrompt();
  }
}
