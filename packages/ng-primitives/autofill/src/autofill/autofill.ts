import { Directive, output } from '@angular/core';
import { ngpAutofillPattern, provideAutofillPattern } from './autofill-pattern';

@Directive({
  selector: '[ngpAutofill]',
  exportAs: 'ngpAutofill',
  providers: [provideAutofillPattern(NgpAutofill, instance => instance.pattern)],
})
export class NgpAutofill {
  /**
   * Emit when the autofill state changes.
   */
  readonly autofillChange = output<boolean>({
    alias: 'ngpAutofill',
  });

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpAutofillPattern({
    onAutofillChange: autofilled => this.autofillChange.emit(autofilled),
  });
}
