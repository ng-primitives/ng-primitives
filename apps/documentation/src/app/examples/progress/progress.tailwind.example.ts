import { Component, signal } from '@angular/core';
import {
  NgpProgress,
  NgpProgressIndicator,
  NgpProgressLabel,
  NgpProgressTrack,
  NgpProgressValue,
} from 'ng-primitives/progress';
import { injectDisposables } from 'ng-primitives/utils';

@Component({
  selector: 'app-progress-tailwind',
  imports: [
    NgpProgress,
    NgpProgressIndicator,
    NgpProgressTrack,
    NgpProgressLabel,
    NgpProgressValue,
  ],
  template: `
    <div
      class="box-border grid w-[200px] grid-cols-2 gap-y-2 p-2"
      [ngpProgressValue]="value()"
      ngpProgress
    >
      <span class="text-[14px] font-semibold text-gray-900 dark:text-gray-100" ngpProgressLabel>
        Loading
      </span>
      <span
        class="col-start-2 text-right text-[14px] font-medium text-gray-600 dark:text-gray-400"
        ngpProgressValue
      >
        {{ value() }}%
      </span>
      <div
        class="relative col-span-2 h-3 w-full max-w-[320px] overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-zinc-800 dark:bg-gray-900"
        ngpProgressTrack
      >
        <div
          class="h-full rounded-lg bg-gray-900 transition-all dark:bg-gray-100"
          ngpProgressIndicator
        ></div>
      </div>
    </div>
  `,
})
export default class ProgressTailwindExample {
  readonly value = signal(0);
  readonly disposables = injectDisposables();

  constructor() {
    this.disposables.setInterval(
      () => this.value.update(value => (value > 100 ? 0 : value + 1)),
      50,
    );
  }
}
