import { Component, signal } from '@angular/core';
import {
  NgpRangeSlider,
  NgpRangeSliderRange,
  NgpRangeSliderThumb,
  NgpRangeSliderTrack,
} from 'ng-primitives/slider';

@Component({
  selector: 'app-range-slider',
  imports: [NgpRangeSlider, NgpRangeSliderRange, NgpRangeSliderThumb, NgpRangeSliderTrack],
  template: `
    <div
      class="relative flex h-5 w-[200px] touch-none items-center select-none"
      [ngpRangeSliderLow]="low()"
      [ngpRangeSliderHigh]="high()"
      (ngpRangeSliderLowChange)="low.set($event)"
      (ngpRangeSliderHighChange)="high.set($event)"
      ngpRangeSlider
    >
      <div
        class="relative h-[5px] w-full rounded-full bg-gray-300 before:absolute before:top-1/2 before:right-0 before:left-0 before:h-5 before:-translate-y-1/2 before:content-[''] dark:bg-gray-700"
        ngpRangeSliderTrack
      >
        <div
          class="absolute h-full rounded-full bg-[#f01e2b] dark:bg-[#ff4651]"
          ngpRangeSliderRange
        ></div>
      </div>
      <div
        class="absolute z-1 block h-5 w-5 -translate-x-1/2 rounded-full bg-white shadow-xs ring-1 ring-black/5 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-[thumb=high]:z-2 dark:bg-white dark:ring-white/10 dark:data-focus-visible:outline-blue-400"
        ngpRangeSliderThumb
      ></div>
      <div
        class="absolute z-1 block h-5 w-5 -translate-x-1/2 rounded-full bg-white shadow-xs ring-1 ring-black/5 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-[thumb=high]:z-2 dark:bg-white dark:ring-white/10 dark:data-focus-visible:outline-blue-400"
        ngpRangeSliderThumb
      ></div>
    </div>
  `,
})
export default class RangeSliderExample {
  low = signal(25);
  high = signal(75);
}
