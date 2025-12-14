import { Directive } from '@angular/core';
import { ngpProgressIndicator, provideProgressIndicatorState } from './progress-indicator-state';

/**
 * Apply the `ngpProgressIndicator` directive to an element that represents the current progress.
 * The width of this element can be set to the percentage of the progress value.
 */
@Directive({
  selector: '[ngpProgressIndicator]',
  providers: [provideProgressIndicatorState()],
})
export class NgpProgressIndicator {
  constructor() {
    ngpProgressIndicator({});
  }
}
