/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, computed, effect, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectFormField } from '../form-field/form-field.token';
import { NgpFormControlToken } from './form-control.token';

@Directive({
  standalone: true,
  selector: '[ngpFormControl]',
  exportAs: 'ngpFormControl',
  providers: [{ provide: NgpFormControlToken, useExisting: NgpFormControl }],
  host: {
    '[attr.aria-labelledby]': 'ariaLabelledBy()',
    '[attr.aria-describedby]': 'ariaDescribedBy()',
    '[attr.data-invalid]': 'formField.invalid()',
    '[attr.data-valid]': 'formField.valid()',
    '[attr.data-touched]': 'formField.touched()',
    '[attr.data-pristine]': 'formField.pristine()',
    '[attr.data-dirty]': 'formField.dirty()',
    '[attr.data-pending]': 'formField.pending()',
    '[attr.data-disabled]': 'formField.disabled()',
  },
})
export class NgpFormControl {
  /**
   * Access the form field that the form control is associated with.
   */
  protected readonly formField = injectFormField('NgpFormControl');

  /**
   * The id of the form control. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-form-control'));

  /**
   * Determine the aria-labelledby attribute value.
   */
  protected readonly ariaLabelledBy = computed(() => this.formField.labels().join(' '));

  /**
   * Determine the aria-describedby attribute value.
   */
  protected readonly ariaDescribedBy = computed(() => this.formField.descriptions().join(' '));

  constructor() {
    effect(
      onCleanup => {
        this.formField.setFormControl(this.id());
        onCleanup(() => this.formField.removeFormControl());
      },
      { allowSignalWrites: true },
    );
  }
}
