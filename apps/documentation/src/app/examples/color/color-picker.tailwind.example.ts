import { Component } from '@angular/core';
import {
  Color,
  NgpColorArea,
  NgpColorAreaThumb,
  NgpColorField,
  NgpColorPicker,
  NgpColorSlider,
  NgpColorSliderThumb,
  NgpColorSliderTrack,
} from 'ng-primitives/color';

@Component({
  selector: 'app-color-picker',
  imports: [
    NgpColorPicker,
    NgpColorArea,
    NgpColorAreaThumb,
    NgpColorSlider,
    NgpColorSliderTrack,
    NgpColorSliderThumb,
    NgpColorField,
  ],
  host: {
    class: 'contents',
  },
  template: `
    <div
      class="flex w-full max-w-60 flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      [(ngpColorPickerValue)]="color"
      ngpColorPicker
    >
      <div
        class="relative h-40 w-full touch-none rounded-[0.625rem] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)] select-none [background:var(--ngp-color-area-background)]"
        ngpColorArea
        ngpColorAreaXChannel="saturation"
        ngpColorAreaYChannel="brightness"
      >
        <div
          class="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_1px_2px_rgb(0_0_0/0.3)] outline-none before:absolute before:top-1/2 before:left-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] data-[focus-visible]:shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_0_0_3px_theme(colors.blue.500)] dark:data-[focus-visible]:shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_0_0_3px_theme(colors.blue.400)]"
          ngpColorAreaThumb
        ></div>
      </div>

      <div
        class="relative h-3.5 w-full touch-none select-none"
        ngpColorSlider
        ngpColorSliderChannel="hue"
      >
        <div
          class="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)] [background:var(--ngp-color-slider-background)]"
          ngpColorSliderTrack
        ></div>
        <div
          class="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_1px_2px_rgb(0_0_0/0.3)] outline-none before:absolute before:top-1/2 before:left-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] data-[focus-visible]:shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_0_0_3px_theme(colors.blue.500)] dark:data-[focus-visible]:shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_0_0_3px_theme(colors.blue.400)]"
          ngpColorSliderThumb
        ></div>
      </div>

      <div class="flex items-center gap-2">
        <div
          class="size-[34px] shrink-0 rounded-lg shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]"
          [style.background]="color.toHex()"
        ></div>
        <input
          class="h-[34px] min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2.5 text-sm font-[510] tracking-[-0.006em] text-gray-950 lowercase outline-none data-[focus]:border-blue-500 data-[focus]:ring-1 data-[focus]:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:data-[focus]:border-blue-400 dark:data-[focus]:ring-blue-400"
          ngpColorField
          aria-label="Hex"
        />
      </div>
    </div>
  `,
})
export default class ColorPickerExample {
  color: Color = Color.parse('#f01e2b');
}
