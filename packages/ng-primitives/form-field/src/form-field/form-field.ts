import { Directive, contentChild } from '@angular/core';
import { NgControl } from '@angular/forms';
import { ngpFormFieldPattern, provideFormFieldPattern } from './form-field-pattern';

/**
 * The `NgpFormField` directive is a container for form field elements. Any labels, form controls, or descriptions should be placed within this directive.
 */
@Directive({
  selector: '[ngpFormField]',
  exportAs: 'ngpFormField',
  providers: [provideFormFieldPattern(NgpFormField, instance => instance.pattern)],
})
export class NgpFormField {
  /**
   * Find any NgControl within the form field.
   * @internal
   */
  private readonly ngControl = contentChild(NgControl, { descendants: true });

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpFormFieldPattern({
    ngControl: this.ngControl,
  });
}
