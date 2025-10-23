import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpErrorPattern, provideErrorPattern } from './error-pattern';

/**
 * The `NgpError` directive is used to mark an error message element within a form field. There may be multiple error messages associated with a form control.
 */
@Directive({
  selector: '[ngpError]',
  exportAs: 'ngpError',
  providers: [provideErrorPattern(NgpError, instance => instance.pattern)],
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
   * The pattern instance.
   */
  protected readonly pattern = ngpErrorPattern({
    id: this.id,
    validator: this.validator,
  });
}
