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
      class="relative h-3 w-80 overflow-hidden rounded-lg border border-white/10 bg-white/5"
      [ngpProgressValue]="value()"
      ngpProgress
    >
      <div
        class="h-full bg-white transition-all"
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
