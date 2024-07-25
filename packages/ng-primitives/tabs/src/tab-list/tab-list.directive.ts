/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive } from '@angular/core';
import { injectTabset } from '../tabset/tabset.token';

@Directive({
  standalone: true,
  selector: '[ngpTabList]',
  exportAs: 'ngpTabList',
  host: {
    role: 'tablist',
    '[attr.aria-orientation]': 'tabset.orientation()',
    '[attr.data-orientation]': 'tabset.orientation()',
  },
})
export class NgpTabList {
  /**
   * Access the tabset
   */
  protected readonly tabset = injectTabset();
}
