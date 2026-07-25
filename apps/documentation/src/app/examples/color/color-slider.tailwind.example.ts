import { Component } from '@angular/core';
import {
  Color,
  NgpColorSlider,
  NgpColorSliderThumb,
  NgpColorSliderTrack,
} from 'ng-primitives/color';

@Component({
  selector: 'app-color-slider',
  imports: [NgpColorSlider, NgpColorSliderTrack, NgpColorSliderThumb],
  host: {
    class: 'flex items-center gap-3',
  },
  template: `
    <!-- a color slider works standalone, without a color picker -->
    <div
      class="size-[34px] shrink-0 rounded-lg shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]"
      [style.background]="color.toHex()"
    ></div>

    <div
      class="relative h-3.5 w-[200px] touch-none select-none"
      [(ngpColorSliderValue)]="color"
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
  `,
})
export default class ColorSliderExample {
  color: Color = Color.parse('hsl(200, 90%, 50%)');
}
