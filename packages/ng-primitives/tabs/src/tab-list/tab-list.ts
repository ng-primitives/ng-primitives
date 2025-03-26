/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive } from '@angular/core';
import { injectTabsetState } from '../tabset/tabset-state';

@Directive({
  selector: '[ngpTabList]',
  exportAs: 'ngpTabList',
  host: {
    role: 'tablist',
    '[attr.aria-orientation]': 'state().orientation()',
    '[attr.data-orientation]': 'state().orientation()',
  },
})
export class NgpTabList {
  /**
   * Access the tabset state
   */
  protected readonly state = injectTabsetState();
}
