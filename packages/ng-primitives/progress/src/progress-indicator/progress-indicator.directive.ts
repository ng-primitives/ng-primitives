/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive } from '@angular/core';
import { injectProgress } from '../progress/progress.token';

@Directive({
  selector: '[ngpProgressIndicator]',
  host: {
    '[attr.data-state]': 'progress.dataState()',
    '[attr.data-value]': 'progress.state.value()',
    '[attr.data-max]': 'progress.max()',
  },
})
export class NgpProgressIndicator {
  /**
   * Access the progress directive.
   */
  protected readonly progress = injectProgress();
}
