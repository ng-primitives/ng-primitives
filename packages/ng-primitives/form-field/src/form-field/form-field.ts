import { Directive, contentChild, input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { FormFieldSource } from 'packages/ng-primitives/utils/src/forms/types';
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
  private readonly ngControlChild = contentChild(NgControl);

  /**
   * Provide any AbstractControl or FieldTree if no NgControl is inside its DOM.
   */
  readonly formFieldSource = input<FormFieldSource | undefined>(undefined, {
    alias: 'ngpFormFieldSource',
  });

  /**
   * The form field state.
   */
  protected readonly state = ngpFormField({
    ngControl: this.ngControlChild,
    formFieldSource: this.formFieldSource,
  });
}
