/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directive, input } from '@angular/core';
import { uniqueId } from '@ng-primitives/ng-primitives/utils';
import { injectCollapsible } from '../collapsible/collapsible.token';
import { NgpCollapsibleContentToken } from './collapsible-content.token';

@Directive({
  standalone: true,
  selector: '[ngpCollapsibleContent]',
  exportAs: 'ngpCollapsibleContent',
  providers: [{ provide: NgpCollapsibleContentToken, useExisting: NgpCollapsibleContentDirective }],
  host: {
    '[attr.data-state]': 'collapsible.open() ? "open" : "closed"',
    '[attr.data-disabled]': 'collapsible.disabled() ? "" : null',
    '[hidden]': '!collapsible.open()',
    '[id]': 'id()',
  },
})
export class NgpCollapsibleContentDirective {
  /**
   * Access the collapsible parent
   */
  protected readonly collapsible = injectCollapsible();

  /**
   * The id of the collapsible content
   */
  readonly id = input<string>(uniqueId('ngp-collapsible-content'));
}
