/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
  Directive,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  computed,
  input,
} from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectFormField } from '../form-field/form-field.token';
import { NgpErrorToken } from './error.token';

@Directive({
  standalone: true,
  selector: '[ngpError]',
  exportAs: 'ngpError',
  providers: [{ provide: NgpErrorToken, useExisting: NgpError }],
  host: {
    '[attr.id]': 'id()',
    '[attr.data-invalid]': 'formField.invalid()',
    '[attr.data-valid]': 'formField.valid()',
    '[attr.data-touched]': 'formField.touched()',
    '[attr.data-pristine]': 'formField.pristine()',
    '[attr.data-dirty]': 'formField.dirty()',
    '[attr.data-pending]': 'formField.pending()',
    '[attr.data-disabled]': 'formField.disabled()',
    '[attr.data-validator]': 'state()',
  },
})
export class NgpError implements OnInit, OnChanges, OnDestroy {
  /**
   * Access the form field that the description is associated with.
   */
  protected readonly formField = injectFormField('NgpError');

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
   * Determine whether the validator associated with this error is failing.
   */
  protected readonly state = computed(() => {
    const errors = this.formField.errors();
    const validator = this.validator();

    // if there is no validator, then we mark as invalid when the control is invalid.
    if (!validator) {
      return null;
    }

    return validator && errors.includes(validator) ? 'fail' : 'pass';
  });

  ngOnInit(): void {
    this.formField.addDescription(this.id());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('id' in changes) {
      this.formField.removeDescription(changes['id'].previousValue);
      this.formField.addDescription(changes['id'].currentValue);
    }
  }

  ngOnDestroy(): void {
    this.formField.removeDescription(this.id());
  }
}
