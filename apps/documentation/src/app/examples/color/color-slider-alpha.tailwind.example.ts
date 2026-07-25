import { Component } from '@angular/core';
import {
  Color,
  NgpColorSlider,
  NgpColorSliderThumb,
  NgpColorSliderTrack,
} from 'ng-primitives/color';

@Component({
  selector: 'app-color-slider-alpha',
  imports: [NgpColorSlider, NgpColorSliderTrack, NgpColorSliderThumb],
  host: {
    class: 'flex flex-col items-start gap-2',
  },
  template: `
    <div
      class="relative h-3.5 w-[200px] touch-none select-none"
      [(ngpColorSliderValue)]="color"
      ngpColorSlider
      ngpColorSliderChannel="alpha"
    >
      <!-- the channel gradient (transparent -> opaque) sits over a checkerboard -->
      <div
        class="absolute inset-0 rounded-full [background-image:var(--ngp-color-slider-background),conic-gradient(#c8c8c8_25%,#fff_0_50%,#c8c8c8_0_75%,#fff_0)] [background-size:auto,12px_12px] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]"
        ngpColorSliderTrack
      ></div>
      <div
        class="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_1px_2px_rgb(0_0_0/0.3)] outline-none before:absolute before:top-1/2 before:left-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] data-[focus-visible]:shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_0_0_3px_theme(colors.blue.500)] dark:data-[focus-visible]:shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_0_0_3px_theme(colors.blue.400)]"
        ngpColorSliderThumb
      ></div>
    </div>

    <span class="text-[0.875rem] tracking-[-0.006em] text-zinc-600 tabular-nums dark:text-zinc-300">
      {{ color.toRgba() }}
    </span>
  `,
})
export default class ColorSliderAlphaExample {
  color: Color = Color.parse('rgba(240, 30, 43, 1)');
}
