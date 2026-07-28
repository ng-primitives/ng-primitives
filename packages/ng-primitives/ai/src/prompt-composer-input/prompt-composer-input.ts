import { Directive } from '@angular/core';
import {
  ngpPromptComposerInput,
  providePromptComposerInputState,
} from './prompt-composer-input-state';

@Directive({
  selector: 'input[ngpPromptComposerInput], textarea[ngpPromptComposerInput]',
  exportAs: 'ngpPromptComposerInput',
  providers: [providePromptComposerInputState()],
})
export class NgpPromptComposerInput {
  /** The state of the prompt composer input. */
  protected readonly state = ngpPromptComposerInput();
}
