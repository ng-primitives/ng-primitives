import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import {
  ngpPromptComposerSubmit,
  providePromptComposerSubmitState,
} from './prompt-composer-submit-state';

@Directive({
  selector: 'button[ngpPromptComposerSubmit]',
  exportAs: 'ngpPromptComposerSubmit',
  providers: [providePromptComposerSubmitState()],
})
export class NgpPromptComposerSubmit {
  /** Whether the submit button should be disabled */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /** The state of the prompt composer submit. */
  protected readonly state = ngpPromptComposerSubmit({ disabled: this.disabled });

  /** Whether dictation is currently active */
  readonly isDictating = this.state.isDictating;
}
