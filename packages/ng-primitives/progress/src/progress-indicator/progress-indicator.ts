import { Directive } from '@angular/core';
import {
  ngpProgressIndicatorPattern,
  provideProgressIndicatorPattern,
} from './progress-indicator-pattern';

/**
 * Apply the `ngpProgressIndicator` directive to an element that represents the current progress.
 * The width of this element can be set to the percentage of the progress value.
 */
@Directive({
  selector: '[ngpProgressIndicator]',
  providers: [provideProgressIndicatorPattern(NgpProgressIndicator, instance => instance.pattern)],
})
export class NgpProgressIndicator {
  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpProgressIndicatorPattern({});
}
