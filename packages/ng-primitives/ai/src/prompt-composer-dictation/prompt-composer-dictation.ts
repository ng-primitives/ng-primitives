import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
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
  /** Whether the dictation button should be disabled. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /** The state of the prompt composer dictation. */
  protected readonly state = ngpPromptComposerDictation({ disabled: this.disabled });

  /** Whether dictation is currently active */
  readonly isDictating = this.state.isDictating;
}
