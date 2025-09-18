import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, HostListener, input } from '@angular/core';
import { setupButton } from 'ng-primitives/button';
import { injectPromptComposerState } from '../prompt-composer/prompt-composer-state';
import {
  promptComposerSubmitState,
  providePromptComposerSubmitState,
} from './prompt-composer-submit-state';

@Directive({
  selector: 'button[ngpPromptComposerSubmit]',
  exportAs: 'ngpPromptComposerSubmit',
  providers: [providePromptComposerSubmitState()],
  host: {
    type: 'button',
    '[attr.data-prompt]': 'composer().hasPrompt() ? "" : null',
    '[attr.data-dictating]': 'isDictating() ? "" : null',
    '[attr.data-dictation-supported]': 'composer().dictationSupported ? "" : null',
  },
})
export class NgpPromptComposerSubmit {
  protected readonly composer = injectPromptComposerState();

  /** Whether the submit button should be disabled */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /** Whether dictation is currently active */
  readonly isDictating = computed(() => this.composer().isDictating());

  /** The state of the prompt composer submit. */
  protected readonly state = promptComposerSubmitState<NgpPromptComposerSubmit>(this);

  constructor() {
    setupButton({
      disabled: computed(() => this.state.disabled() || this.composer().hasPrompt() === false),
    });
  }

  @HostListener('click')
  protected onClick(): void {
    this.composer().submitPrompt();
  }
}
