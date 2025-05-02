import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, effect, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectFormFieldState } from '../form-field/form-field-state';
import { formControlState, provideFormControlState } from './form-control-state';

/**
 * Typically this primitive would be not be used directly, but instead a more specific form control primitive would be used (e.g. `ngpInput`). All of our form control primitives use `ngpFormControl` internally so they will have the same accessibility features as described below.
 *
 * The `NgpFormControl` directive is used to mark a form control element within a form field. This element will have an `aria-labelledby` attribute set to the ID of the label element within the form field and an `aria-describedby` attribute set to the ID of the description elements within the form field.
 */
@Directive({
  selector: '[ngpFormControl]',
  exportAs: 'ngpFormControl',
  providers: [provideFormControlState()],
  host: {
    '[id]': 'state.id()',
    '[attr.aria-labelledby]': 'ariaLabelledBy()',
    '[attr.aria-describedby]': 'ariaDescribedBy()',
    '[attr.data-invalid]': 'formField()?.invalid() ? "" : null',
    '[attr.data-valid]': 'formField()?.valid() ? "" : null',
    '[attr.data-touched]': 'formField()?.touched() ? "" : null',
    '[attr.data-pristine]': 'formField()?.pristine() ? "" : null',
    '[attr.data-dirty]': 'formField()?.dirty() ? "" : null',
    '[attr.data-pending]': 'formField()?.pending() ? "" : null',
    '[attr.data-disabled]': 'formField()?.disabled() || state.disabled() ? "" : null',
  },
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
   * Access the form field that the form control is associated with.
   */
  protected readonly formField = injectFormFieldState({ optional: true });
  /**
   * Determine the aria-labelledby attribute value.
   */
  protected readonly ariaLabelledBy = this.formField()?.labelledBy;

  /**
   * Determine the aria-describedby attribute value.
   */
  protected readonly ariaDescribedBy = computed(() => this.formField()?.descriptions().join(' '));

  /**
   * The state of the form control.
   */
  private readonly state = formControlState<NgpFormControl>(this);

  constructor() {
    effect(onCleanup => {
      this.formField()?.setFormControl(this.state.id());
      onCleanup(() => this.formField()?.removeFormControl());
    });
  }
}
