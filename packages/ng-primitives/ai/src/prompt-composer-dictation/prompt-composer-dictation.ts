import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { injectAiConfig } from '../config/ai-config';
import {
  ngpPromptComposerDictation,
  providePromptComposerDictationState,
} from './prompt-composer-dictation-state';

@Directive({
  selector: 'button[ngpPromptComposerDictation]',
  exportAs: 'ngpPromptComposerDictation',
  providers: [providePromptComposerDictationState()],
})
export class NgpPromptComposerDictation {
  /** Access the global AI configuration. */
  private readonly config = injectAiConfig();

  /** Whether the dictation button should be disabled. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * The BCP 47 language tag dictation transcribes in, e.g. `en-US` or `es-ES`.
   * Defaults to the page's own language: the document's `lang` attribute, then the browser's.
   */
  readonly language = input<string | undefined>(this.config.dictationLanguage, {
    alias: 'ngpPromptComposerDictationLanguage',
  });

  /** The state of the prompt composer dictation. */
  protected readonly state = ngpPromptComposerDictation({
    disabled: this.disabled,
    language: this.language,
  });

  /** Whether dictation is currently active */
  readonly isDictating = this.state.isDictating;
}
