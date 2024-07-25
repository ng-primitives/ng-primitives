/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, effect, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectFormField } from '../form-field/form-field.token';
import { NgpDescriptionToken } from './description.token';

@Directive({
  standalone: true,
  selector: '[ngpDescription]',
  exportAs: 'ngpDescription',
  providers: [{ provide: NgpDescriptionToken, useExisting: NgpDescription }],
  host: {
    '[attr.id]': 'id()',
    '[attr.data-invalid]': 'formField?.invalid()',
    '[attr.data-valid]': 'formField?.valid()',
    '[attr.data-touched]': 'formField?.touched()',
    '[attr.data-pristine]': 'formField?.pristine()',
    '[attr.data-dirty]': 'formField?.dirty()',
    '[attr.data-pending]': 'formField?.pending()',
    '[attr.data-disabled]': 'formField?.disabled()',
  },
})
export class NgpDescription {
  /**
   * Access the form field that the description is associated with.
   */
  protected readonly formField = injectFormField();

  /**
   * The id of the description. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-description'));

  constructor() {
    effect(
      onCleanup => {
        this.formField?.addDescription(this.id());
        onCleanup(() => this.formField?.removeDescription(this.id()));
      },
      { allowSignalWrites: true },
    );
  }
}
