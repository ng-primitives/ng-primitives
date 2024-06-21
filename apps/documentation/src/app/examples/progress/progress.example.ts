import { Component, signal } from '@angular/core';
import { NgpProgress, NgpProgressIndicator } from 'ng-primitives/progress';
import { injectDisposables } from 'ng-primitives/utils';

@Component({
  standalone: true,
  selector: 'app-progress',
  imports: [NgpProgress, NgpProgressIndicator],
  template: `
    <div
      class="relative h-3 w-80 overflow-hidden rounded-lg border border-neutral-200 bg-white"
      [ngpProgressValue]="value()"
      ngpProgress
    >
      <div
        class="h-full rounded-full bg-neutral-950 transition-all"
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
  readonly value = signal(0);

  /**
   * Use the disposable helpers to ensure the interval is cleared when the component is destroyed.
   */
  readonly disposables = injectDisposables();

  constructor() {
    this.disposables.setInterval(
      () => this.value.update(value => (value > 100 ? 0 : value + 1)),
      50,
    );
  }
}
