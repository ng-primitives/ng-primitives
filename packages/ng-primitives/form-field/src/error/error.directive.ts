/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, OnChanges, OnDestroy, SimpleChanges, computed, input } from '@angular/core';
import { onBooleanChange, uniqueId } from 'ng-primitives/utils';
import { injectFormField } from '../form-field/form-field.token';
import { NgpErrorToken } from './error.token';

@Directive({
  standalone: true,
  selector: '[ngpError]',
  exportAs: 'ngpError',
  providers: [{ provide: NgpErrorToken, useExisting: NgpError }],
  host: {
    '[attr.id]': 'id()',
    '[attr.data-invalid]': 'formField?.invalid()',
    '[attr.data-valid]': 'formField?.valid()',
    '[attr.data-touched]': 'formField?.touched()',
    '[attr.data-pristine]': 'formField?.pristine()',
    '[attr.data-dirty]': 'formField?.dirty()',
    '[attr.data-pending]': 'formField?.pending()',
    '[attr.data-disabled]': 'formField?.disabled()',
    '[attr.data-validator]': 'state()',
  },
})
export class NgpError implements OnChanges, OnDestroy {
  /**
   * Access the form field that the description is associated with.
   */
  protected readonly formField = injectFormField();

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
   * Determine if there is an error message.
   */
  protected readonly hasError = computed(() => {
    const errors = this.formField?.errors() ?? [];
    const validator = this.validator();

    return validator ? errors?.includes(validator) : errors?.length > 0;
  });

  /**
   * Determine whether the validator associated with this error is failing.
   */
  protected readonly state = computed(() => (this.hasError() ? 'fail' : 'pass'));

  constructor() {
    // add or remove the error message when the error state changes
    onBooleanChange(
      this.hasError,
      () => this.formField?.addDescription(this.id()),
      () => this.formField?.removeDescription(this.id()),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('id' in changes) {
      this.formField?.removeDescription(changes['id'].previousValue);
    }
  }

  ngOnDestroy(): void {
    this.formField?.removeDescription(this.id());
  }
}
