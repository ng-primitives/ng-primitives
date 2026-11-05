import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpAutocompleteButton, provideAutocompleteButtonState } from './autocomplete-button-state';

@Directive({
  selector: 'button[ngpAutocompleteButton]',
  exportAs: 'ngpAutocompleteButton',
  providers: [provideAutocompleteButtonState()],
})
export class NgpAutocompleteButton {
  /** The id of the button. */
  readonly id = input<string>(uniqueId('ngp-autocomplete-button'));

  protected readonly state = ngpAutocompleteButton({ id: this.id });
}
