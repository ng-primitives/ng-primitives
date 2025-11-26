import { Directive, output } from '@angular/core';
import { ngpAutofill, provideAutofillState } from './autofill-state';

/**
 * Apply the `ngpAutofill` directive to an element to detect browser autofill.
 */
@Directive({
  selector: '[ngpAutofill]',
  exportAs: 'ngpAutofill',
  providers: [provideAutofillState()],
})
export class NgpAutofill {
  /**
   * Event emitted when the autofill state changes.
   */
  readonly autofillChange = output<boolean>({
    alias: 'ngpAutofill',
  });

  /**
   * The autofill state.
   */
  private readonly state = ngpAutofill({
    onAutofillChange: value => this.autofillChange.emit(value),
  });

  /**
   * Whether the element is autofilled.
   */
  readonly autofilled = this.state.autofilled;
}
