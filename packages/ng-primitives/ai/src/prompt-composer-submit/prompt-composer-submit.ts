import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, HostListener, inject, input } from '@angular/core';
import { setupButton } from 'ng-primitives/button';
import { NgpPromptComposer } from '../prompt-composer/prompt-composer';

@Directive({
  selector: 'button[ngpPromptComposerSubmit]',
  exportAs: 'ngpPromptComposerSubmit',
  host: {
    type: 'button',
    '[attr.data-prompt]': 'composer.hasPrompt() ? "" : null',
    '[attr.data-dictating]': 'isDictating() ? "" : null',
    '[attr.data-dictation-supported]': 'composer.dictationSupported ? "" : null',
  },
})
export class NgpPromptComposerSubmit {
  protected readonly composer = inject(NgpPromptComposer);

  /** Whether the submit button should be disabled */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /** Whether dictation is currently active */
  readonly isDictating = computed(() => this.composer.isDictating());

  constructor() {
    setupButton({
      disabled: computed(() => this.disabled() || this.composer.hasPrompt() === false),
    });
  }

  @HostListener('click')
  protected onClick(): void {
    this.composer.submitPrompt();
  }
}
