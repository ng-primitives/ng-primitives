import { Directive, contentChild } from '@angular/core';
import { NgControl } from '@angular/forms';
import { ngpFormField, provideFormFieldState } from './form-field-state';

/**
 * The `NgpFormField` directive is a container for form field elements. Any labels, form controls, or descriptions should be placed within this directive.
 */
@Directive({
  selector: '[ngpFormField]',
  exportAs: 'ngpFormField',
  providers: [provideFormFieldState()],
})
export class NgpFormField {
  /**
   * Find any NgControl within the form field.
   * @internal
   */
  private readonly ngControl = contentChild(NgControl);

  /**
   * The form field state.
   */
  constructor() {
    ngpFormField({ ngControl: this.ngControl });
  }
}
