import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpError, provideErrorState } from './error-state';

/**
 * The `NgpError` directive is used to mark an error message element within a form field. There may be multiple error messages associated with a form control.
 */
@Directive({
  selector: '[ngpError]',
  exportAs: 'ngpError',
  providers: [provideErrorState()],
})
export class NgpError {
  /**
   * The id of the error message. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-error'));

  /**
   * The validator associated with the error message.
   */
  readonly validator = input<string | null>(null, {
    alias: 'ngpErrorValidator',
  });

  /**
   * The error state.
   */
  constructor() {
    ngpError({ id: this.id, validator: this.validator });
  }
}
