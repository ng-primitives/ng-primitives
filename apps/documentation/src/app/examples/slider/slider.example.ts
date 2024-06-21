import { Component } from '@angular/core';
import { NgpSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack } from 'ng-primitives/slider';

@Component({
  standalone: true,
  selector: 'app-slider',
  imports: [NgpSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack],
  template: `
    <div
      class="relative flex h-5 w-[200px] touch-none select-none items-center"
      [(ngpSliderValue)]="value"
      ngpSlider
    >
      <div class="relative h-[5px] grow rounded-full bg-black/20" ngpSliderTrack>
        <div class="absolute h-full rounded-full bg-zinc-950" ngpSliderRange></div>
      </div>
      <div
        class="absolute block size-5 -translate-x-1/2 rounded-[10px] bg-white shadow outline-none ring-1 ring-black/5 focus-visible:ring-2 focus-visible:ring-blue-500"
        ngpSliderThumb
      ></div>
    </div>
  `,
})
export default class SliderExample {
  value = 50;
}
