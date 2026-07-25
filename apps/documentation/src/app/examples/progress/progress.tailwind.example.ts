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
      <label
        class="text-[14px] font-[590] tracking-[-0.006em] text-black dark:text-white"
        ngpProgressLabel
      >
        Loading
      </label>
      <span
        class="col-start-2 text-end text-[14px] font-[510] tracking-[-0.006em] text-zinc-600 dark:text-zinc-300"
        ngpProgressValue
      >
        {{ value() }}%
      </span>
      <div
        class="relative col-span-2 h-3 w-full max-w-[320px] overflow-hidden rounded-lg border border-black/10 bg-white dark:border-zinc-800 dark:bg-zinc-950"
        ngpProgressTrack
      >
        <div
          class="h-full rounded-lg bg-[#f01e2b] transition-all dark:bg-[#ff4651]"
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
