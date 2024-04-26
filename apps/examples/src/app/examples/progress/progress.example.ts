import { Component, signal } from '@angular/core';
import {
  NgpProgressDirective,
  NgpProgressIndicatorDirective,
} from '@ng-primitives/ng-primitives/progress';

@Component({
  standalone: true,
  selector: 'app-progress',
  imports: [NgpProgressDirective, NgpProgressIndicatorDirective],
  template: `
    <div
      class="border-primary-300 relative h-3 w-80 overflow-hidden rounded-lg border"
      [ngpProgressValue]="value()"
      ngpProgress
    >
      <div
        class="bg-primary-500 h-full transition-all"
        [style.width.%]="value()"
        ngpProgressIndicator
      ></div>
    </div>
  `,
})
export default class ProgressExample {
  /**
   * The value of the progress bar.
   */
  readonly value = signal(50);
}
