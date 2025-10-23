import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import {
  ngpPromptComposerDictationPattern,
  providePromptComposerDictationPattern,
} from './prompt-composer-dictation-pattern';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

@Directive({
  selector: 'button[ngpPromptComposerDictation]',
  exportAs: 'ngpPromptComposerDictation',
  providers: [
    providePromptComposerDictationPattern(NgpPromptComposerDictation, instance => instance.pattern),
  ],
})
export class NgpPromptComposerDictation {
  /** Whether the submit button should be disabled. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpPromptComposerDictationPattern({
    disabled: this.disabled,
  });

  /**
   * Expose the dictation state.
   * @internal
   */
  readonly isDictating = this.pattern.isDictating;
}
