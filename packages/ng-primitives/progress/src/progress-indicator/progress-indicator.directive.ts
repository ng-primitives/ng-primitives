import { Directive } from '@angular/core';
import { injectProgress } from '../progress/progress.token';

@Directive({
  selector: '[ngpProgressIndicator]',
  standalone: true,
  host: {
    '[attr.data-state]': 'progress.state',
    '[attr.data-value]': 'progress.value',
    '[attr.data-max]': 'progress.max',
  },
})
export class NgpProgressIndicatorDirective {
  /**
   * Access the progress directive.
   */
  protected readonly progress = injectProgress();
}
