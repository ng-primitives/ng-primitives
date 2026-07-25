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
      <div
        class="relative h-[5px] w-full rounded-full bg-zinc-300 before:absolute before:top-1/2 before:right-0 before:left-0 before:h-5 before:-translate-y-1/2 before:content-[''] dark:bg-zinc-700"
        ngpSliderTrack
      >
        <div
          class="absolute h-full rounded-full bg-[#f01e2b] dark:bg-[#ff4651]"
          ngpSliderRange
        ></div>
      </div>
      <div
        class="absolute block h-5 w-5 -translate-x-1/2 transform rounded-full bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05)] outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 dark:bg-white dark:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05)] dark:data-focus-visible:outline-blue-400"
        ngpSliderThumb
      ></div>
    </div>
  `,
})
export default class SliderTailwindExample {
  value = 50;
}
