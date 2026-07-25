import { Component } from '@angular/core';
import { Color, NgpColorWheel, NgpColorWheelThumb } from 'ng-primitives/color';

@Component({
  selector: 'app-color-wheel',
  imports: [NgpColorWheel, NgpColorWheelThumb],
  host: {
    class: 'flex items-center gap-4',
  },
  template: `
    <!-- the wheel's centre is masked out to leave a colour ring -->
    <div
      class="relative size-[180px] touch-none rounded-full select-none [background:var(--ngp-color-wheel-background)] [mask:radial-gradient(farthest-side,transparent_calc(100%-26px),#000_calc(100%-26px))]"
      [(ngpColorWheelValue)]="color"
      ngpColorWheel
    >
      <!-- positioned on the ring using the hue angle exposed by the primitive -->
      <div
        class="absolute top-1/2 left-1/2 -m-[9px] size-[18px] [transform:rotate(var(--ngp-color-wheel-hue))_translateY(-77px)] rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_1px_2px_rgb(0_0_0/0.3)] outline-none before:absolute before:top-1/2 before:left-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] data-[focus-visible]:shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_0_0_3px_theme(colors.blue.500)] dark:data-[focus-visible]:shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_0_0_3px_theme(colors.blue.400)]"
        ngpColorWheelThumb
      ></div>
    </div>

    <div
      class="size-10 rounded-[0.625rem] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]"
      [style.background]="color.toHex()"
    ></div>
  `,
})
export default class ColorWheelExample {
  color: Color = Color.parse('hsl(140, 90%, 50%)');
}
