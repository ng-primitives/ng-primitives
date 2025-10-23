import { Directive, output } from '@angular/core';
import { ngpPromptComposerPattern, providePromptComposerPattern } from './prompt-composer-pattern';

@Directive({
  selector: '[ngpPromptComposer]',
  exportAs: 'ngpPromptComposer',
  providers: [providePromptComposerPattern(NgpPromptComposer, instance => instance.pattern)],
})
export class NgpPromptComposer {
  /** Emits whenever the user submits the prompt. */
  readonly submit = output<string>({ alias: 'ngpPromptComposerSubmit' });

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpPromptComposerPattern({
    onSubmit: (value: string) => this.submit.emit(value),
  });

  /**
   * Expose the prompt value.
   * @internal
   */
  readonly prompt = this.pattern.prompt.asReadonly();

  /**
   * Whether there is content in the prompt.
   * @internal
   */
  readonly hasPrompt = this.pattern.hasPrompt;

  /**
   * Whether we are currently dictating.
   * @internal
   */
  readonly isDictating = this.pattern.isDictating.asReadonly();

  /**
   * Whether dictation is supported in the current browser.
   * @internal
   */
  readonly isDictationSupported = this.pattern.dictationSupported;

  /**
   * @internal
   * Submits the current prompt if there is content, and clears the input.
   */
  submitPrompt(): void {
    this.pattern.submitPrompt();
  }
}
