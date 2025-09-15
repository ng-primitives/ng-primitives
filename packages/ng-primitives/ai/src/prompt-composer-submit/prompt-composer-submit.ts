import { computed, Directive, HostListener, inject } from '@angular/core';
import { setupButton } from '../../../button/src';
import { NgpPromptComposer } from '../prompt-composer/prompt-composer';

@Directive({
  selector: 'button[ngpPromptComposerSubmit]',
  exportAs: 'ngpPromptComposerSubmit',
  host: {
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
  },
})
export class NgpPromptComposerSubmit {
  private readonly composer = inject(NgpPromptComposer);

  /** Whether the submit button should be disabled */
  protected readonly disabled = computed(() => this.composer.hasPrompt() === false);

  constructor() {
    setupButton({ disabled: this.disabled });
  }

  @HostListener('click')
  protected onClick(): void {
    this.composer.submitPrompt();
  }
}
