/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive } from '@angular/core';
import { injectProgress } from '../progress/progress.token';

@Directive({
  selector: '[ngpProgressIndicator]',
  standalone: true,
  host: {
    '[attr.data-state]': 'progress.state()',
    '[attr.data-value]': 'progress.value()',
    '[attr.data-max]': 'progress.max()',
  },
})
export class NgpProgressIndicatorDirective {
  /**
   * Access the progress directive.
   */
  protected readonly progress = injectProgress();
}
