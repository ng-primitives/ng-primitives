import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpFormControl } from './form-control-state';

/**
 * Typically this primitive would be not be used directly, but instead a more specific form control primitive would be used (e.g. `ngpInput`). All of our form control primitives use `ngpFormControl` internally so they will have the same accessibility features as described below.
 *
 * The `NgpFormControl` directive is used to mark a form control element within a form field. The IDs of the label elements within the form field are added to this element's `aria-labelledby` attribute and the IDs of the description elements within the form field to its `aria-describedby` attribute, each next to any value the attribute already has.
 */
@Directive({
  selector: '[ngpFormControl]',
  exportAs: 'ngpFormControl',
})
export class NgpFormControl {
  /**
   * The id of the form control. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-form-control'));

  /**
   * Whether the form control is disabled by a parent.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpFormControlDisabled',
    transform: booleanAttribute,
  });

  /**
   * The status of the form control.
   */
  readonly status = ngpFormControl({ id: this.id, disabled: this.disabled });
}
