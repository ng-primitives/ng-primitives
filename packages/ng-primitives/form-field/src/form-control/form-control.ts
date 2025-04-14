import { computed, Directive, effect, input } from '@angular/core';
import { injectDisabled } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectFormField } from '../form-field/form-field-token';
import { NgpFormControlToken } from './form-control-token';

/**
 * Typically this primitive would be not be used directly, but instead a more specific form control primitive would be used (e.g. `ngpInput`). All of our form control primitives use `ngpFormControl` internally so they will have the same accessibility features as described below.
 *
 * The `NgpFormControl` directive is used to mark a form control element within a form field. This element will have an `aria-labelledby` attribute set to the ID of the label element within the form field and an `aria-describedby` attribute set to the ID of the description elements within the form field.
 */
@Directive({
  selector: '[ngpFormControl]',
  exportAs: 'ngpFormControl',
  providers: [{ provide: NgpFormControlToken, useExisting: NgpFormControl }],
  host: {
    '[id]': 'id()',
    '[attr.aria-labelledby]': 'ariaLabelledBy()',
    '[attr.aria-describedby]': 'ariaDescribedBy()',
    '[attr.data-invalid]': 'formField?.invalid() ? "" : null',
    '[attr.data-valid]': 'formField?.valid() ? "" : null',
    '[attr.data-touched]': 'formField?.touched() ? "" : null',
    '[attr.data-pristine]': 'formField?.pristine() ? "" : null',
    '[attr.data-dirty]': 'formField?.dirty() ? "" : null',
    '[attr.data-pending]': 'formField?.pending() ? "" : null',
    '[attr.data-disabled]': 'formField?.disabled() || disabled() ? "" : null',
  },
})
export class NgpFormControl {
  /**
   * The id of the form control. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-form-control'));
  /**
   * Access the form field that the form control is associated with.
   */
  protected readonly formField = injectFormField();
  /**
   * Whether the form control is disabled by a parent.
   */
  protected readonly disabled = injectDisabled();
  /**
   * Determine the aria-labelledby attribute value.
   */
  protected readonly ariaLabelledBy = computed(() => this.formField?.labels().join(' '));

  /**
   * Determine the aria-describedby attribute value.
   */
  protected readonly ariaDescribedBy = computed(() => this.formField?.descriptions().join(' '));

  constructor() {
    effect(onCleanup => {
      this.formField?.setFormControl(this.id());
      onCleanup(() => this.formField?.removeFormControl());
    });
  }
}
