import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import {
  ngpPromptComposerSubmitPattern,
  providePromptComposerSubmitPattern,
} from './prompt-composer-submit-pattern';

@Directive({
  selector: 'button[ngpPromptComposerSubmit]',
  exportAs: 'ngpPromptComposerSubmit',
  providers: [
    providePromptComposerSubmitPattern(NgpPromptComposerSubmit, instance => instance.pattern),
  ],
})
export class NgpPromptComposerSubmit {
  /** Whether the submit button should be disabled */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpPromptComposerSubmitPattern({
    disabled: this.disabled,
  });
}
