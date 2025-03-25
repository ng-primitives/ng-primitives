/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, effect, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectFormField } from '../form-field/form-field-token';
import { NgpDescriptionToken } from './description-token';

@Directive({
  selector: '[ngpDescription]',
  exportAs: 'ngpDescription',
  providers: [{ provide: NgpDescriptionToken, useExisting: NgpDescription }],
  host: {
    '[attr.id]': 'id()',
    '[attr.data-invalid]': 'formField?.invalid() ? "" : null',
    '[attr.data-valid]': 'formField?.valid() ? "" : null',
    '[attr.data-touched]': 'formField?.touched() ? "" : null',
    '[attr.data-pristine]': 'formField?.pristine() ? "" : null',
    '[attr.data-dirty]': 'formField?.dirty() ? "" : null',
    '[attr.data-pending]': 'formField?.pending() ? "" : null',
    '[attr.data-disabled]': 'formField?.disabled() ? "" : null',
  },
})
export class NgpDescription {
  /**
   * The id of the description. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-description'));
  /**
   * Access the form field that the description is associated with.
   */
  protected readonly formField = injectFormField();

  constructor() {
    effect(onCleanup => {
      this.formField?.addDescription(this.id());
      onCleanup(() => this.formField?.removeDescription(this.id()));
    });
  }
}
