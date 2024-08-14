/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { NgpDialogDescriptionToken } from './dialog-description.token';

@Directive({
  standalone: true,
  selector: '[ngpDialogDescription]',
  exportAs: 'ngpDialogDescription',
  providers: [{ provide: NgpDialogDescriptionToken, useExisting: NgpDialogDescription }],
  host: {
    '[id]': 'id()',
  },
})
export class NgpDialogDescription {
  /** The id of the descriptions. */
  readonly id = input<string>(uniqueId('ngp-dialog-description'));
}
