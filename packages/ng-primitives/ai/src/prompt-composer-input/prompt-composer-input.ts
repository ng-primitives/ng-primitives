import { Directive } from '@angular/core';
import {
  ngpPromptComposerInputPattern,
  providePromptComposerInputPattern,
} from './prompt-composer-input-pattern';

@Directive({
  selector: 'input[ngpPromptComposerInput], textarea[ngpPromptComposerInput]',
  exportAs: 'ngpPromptComposerInput',
  providers: [
    providePromptComposerInputPattern(NgpPromptComposerInput, instance => instance.pattern),
  ],
})
export class NgpPromptComposerInput {
  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpPromptComposerInputPattern({});
}
