import { Component } from '@angular/core';
import { NgpSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack } from 'ng-primitives/slider';

@Component({
  selector: 'app-slider-tailwind',
  imports: [NgpSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack],
  template: `
    <div
      class="relative flex h-5 w-[200px] touch-none items-center select-none"
      [(ngpSliderValue)]="value"
      ngpSlider
    >
      <div class="relative h-[5px] w-full rounded-full bg-gray-300 dark:bg-gray-700" ngpSliderTrack>
        <div class="absolute h-full rounded-full bg-gray-900 dark:bg-gray-50" ngpSliderRange></div>
      </div>
      <div
        class="absolute block h-5 w-5 -translate-x-1/2 transform rounded-full bg-white shadow-xs ring-1 ring-black/5 outline-hidden data-focus-visible:ring-2 data-focus-visible:ring-blue-500 dark:bg-white dark:ring-white/10 dark:data-focus-visible:ring-blue-400"
        ngpSliderThumb
      ></div>
    </div>
  `,
})
export default class SliderTailwindExample {
  value = 50;
}
