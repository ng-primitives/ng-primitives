/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { NgpDialogTitleToken } from './dialog-title.token';

@Directive({
  standalone: true,
  selector: '[ngpDialogTitle]',
  exportAs: 'ngpDialogTitle',
  providers: [{ provide: NgpDialogTitleToken, useExisting: NgpDialogTitle }],
  host: {
    '[id]': 'id()',
  },
})
export class NgpDialogTitle {
  /** The id of the title. */
  readonly id = input<string>(uniqueId('ngp-dialog-title'));
}
