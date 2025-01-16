/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { computed, Directive, effect, input } from '@angular/core';
import { injectDisabled } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectFormField } from '../form-field/form-field.token';
import { NgpFormControlToken } from './form-control.token';


@Directive({
  standalone: true,
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
