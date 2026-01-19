import { Component } from '@angular/core';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack } from 'ng-primitives/slider';

@Component({
  selector: 'app-slider-form-field-tailwind',
  imports: [
    NgpFormField,
    NgpLabel,
    NgpDescription,
    NgpSlider,
    NgpSliderRange,
    NgpSliderThumb,
    NgpSliderTrack,
  ],
  template: `
    <div class="flex flex-col gap-1.5" ngpFormField>
      <label class="text-sm font-medium text-gray-900 dark:text-gray-50" ngpLabel>Volume</label>
      <p class="mb-1 text-xs text-gray-600 dark:text-gray-300" ngpDescription>
        Adjust the volume of the speaker.
      </p>

      <div
        class="relative flex h-5 w-[200px] touch-none items-center select-none"
        [(ngpSliderValue)]="value"
        ngpSlider
      >
        <div
          class="relative h-[5px] w-full rounded-full bg-gray-300 before:absolute before:top-1/2 before:right-0 before:left-0 before:h-5 before:-translate-y-1/2 before:content-[''] dark:bg-gray-700"
          ngpSliderTrack
        >
          <div
            class="absolute h-full rounded-full bg-gray-900 dark:bg-gray-50"
            ngpSliderRange
          ></div>
        </div>
        <div
          class="absolute block h-5 w-5 -translate-x-1/2 transform rounded-full bg-white shadow-xs ring-1 ring-black/5 outline-hidden data-focus-visible:ring-2 data-focus-visible:ring-blue-500 dark:bg-white dark:ring-white/10 dark:data-focus-visible:ring-blue-400"
          ngpSliderThumb
        ></div>
      </div>
    </div>
  `,
})
export default class SliderFormFieldTailwindExample {
  value = 50;
}
