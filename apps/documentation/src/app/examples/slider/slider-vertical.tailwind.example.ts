import { Component } from '@angular/core';
import { NgpSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack } from 'ng-primitives/slider';

@Component({
  selector: 'app-slider-vertical',
  imports: [NgpSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack],
  template: `
    <div
      class="relative flex h-[200px] w-5 touch-none justify-center select-none"
      [(ngpSliderValue)]="value"
      ngpSlider
      ngpSliderOrientation="vertical"
    >
      <div
        class="relative h-full w-[5px] rounded-full bg-zinc-300 before:absolute before:top-0 before:bottom-0 before:left-1/2 before:h-full before:w-5 before:-translate-x-1/2 before:content-[''] dark:bg-zinc-700"
        ngpSliderTrack
      >
        <div
          class="absolute w-full rounded-full bg-[#f01e2b] dark:bg-[#ff4651]"
          ngpSliderRange
        ></div>
      </div>
      <div
        class="absolute block h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05)] outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 dark:bg-white dark:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05)] dark:data-focus-visible:outline-blue-400"
        ngpSliderThumb
      ></div>
    </div>
  `,
})
export default class SliderVerticalExample {
  value = 50;
}
