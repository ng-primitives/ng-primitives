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
   * The form control associated with the form field, used when the control is not
   * located within the form field's own DOM.
   *
   * Accepts either a Reactive Forms `AbstractControl`, typically bound with
   * `[formControl]`, or a Signal Forms `FieldTree`, typically bound with `[formField]`.
   *
   * When omitted, the form field automatically looks up the `NgControl` contained
   * within its own DOM. This input is only necessary when the control lives outside
   * the form field.
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
