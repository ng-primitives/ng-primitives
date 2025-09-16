import { computed, Directive, output, signal } from '@angular/core';

@Directive({
  selector: '[ngpPromptComposer]',
  exportAs: 'ngpPromptComposer',
  host: {
    '[attr.data-prompt]': 'hasPrompt() ? "" : null',
    '[attr.data-dictating]': 'isDictating() ? "" : null',
    '[attr.data-dictation-supported]': 'dictationSupported ? "" : null',
  },
})
export class NgpPromptComposer {
  /** Emits whenever the user submits the prompt. */
  readonly submit = output<string>({ alias: 'ngpPromptComposerSubmit' });

  /** @internal Store the current prompt text. */
  readonly prompt = signal<string>('');

  /** @internal Track whether the prompt is currently being dictated */
  readonly isDictating = signal<boolean>(false);

  /** @internal Determine whether the prompt input has content */
  readonly hasPrompt = computed(() => this.prompt().trim().length > 0);

  /** Whether dictation is supported by the browser */
  readonly dictationSupported = !!(
    (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition
  );

  /**
   * @internal
   * Submits the current prompt if there is content, and clears the input.
   */
  submitPrompt(): void {
    if (this.hasPrompt()) {
      this.submit.emit(this.prompt());
      this.prompt.set('');
    }
  }
}
