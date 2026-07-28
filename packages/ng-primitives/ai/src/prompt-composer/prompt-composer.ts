import { Directive, output } from '@angular/core';
import { ngpPromptComposer, providePromptComposerState } from './prompt-composer-state';

@Directive({
  selector: '[ngpPromptComposer]',
  exportAs: 'ngpPromptComposer',
  providers: [providePromptComposerState()],
})
export class NgpPromptComposer {
  /** Emits whenever the user submits the prompt. */
  readonly submit = output<string>({ alias: 'ngpPromptComposerSubmit' });

  /** The state of the prompt composer. */
  protected readonly state = ngpPromptComposer({
    onSubmit: prompt => this.submit.emit(prompt),
  });

  /** @internal The current prompt text. */
  readonly prompt = this.state.prompt;

  /** @internal Whether the prompt is currently being dictated. */
  readonly isDictating = this.state.isDictating;

  /** @internal Whether the prompt input has content. */
  readonly hasPrompt = this.state.hasPrompt;

  /** Whether dictation is supported by the browser. */
  readonly dictationSupported = this.state.dictationSupported;

  /**
   * @internal
   * Submits the current prompt if there is content, and clears the input.
   */
  submitPrompt(): void {
    this.state.submitPrompt();
  }
}
