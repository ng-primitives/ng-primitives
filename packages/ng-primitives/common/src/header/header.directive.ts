/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { NgpHeaderToken } from './header.token';

@Directive({
  standalone: true,
  selector: '[ngpHeader]',
  exportAs: 'ngpHeader',
  providers: [{ provide: NgpHeaderToken, useExisting: NgpHeader }],
  host: {
    role: 'presentation',
    '[attr.id]': 'id()',
  },
})
export class NgpHeader {
  /**
   * The id of the header.
   */
  readonly id = input(uniqueId('ngp-header'));
}
