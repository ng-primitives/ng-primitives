import { Component } from '@angular/core';
import { Color, NgpColorSwatchPicker, NgpColorSwatchPickerItem } from 'ng-primitives/color';

@Component({
  selector: 'app-color-swatch-picker',
  imports: [NgpColorSwatchPicker, NgpColorSwatchPickerItem],
  template: `
    <div
      class="flex max-w-[200px] flex-wrap gap-2 outline-none"
      [(ngpColorSwatchPickerValue)]="color"
      ngpColorSwatchPicker
      aria-label="Color swatches"
    >
      @for (swatch of swatches; track swatch) {
        <!-- the selected swatch gets a neutral ring so it doesn't clash with the swatch colors -->
        <button
          class="size-7 cursor-pointer rounded-lg border-none p-0 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)] transition-transform duration-150 outline-none [background:var(--ngp-color-swatch-color)] data-focus-visible:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1),0_0_0_2px_theme(colors.blue.500)] data-hover:scale-108 data-selected:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1),0_0_0_2px_#fff,0_0_0_3.5px_#18181b] dark:data-focus-visible:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1),0_0_0_2px_theme(colors.blue.400)] dark:data-selected:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1),0_0_0_2px_#09090b,0_0_0_3.5px_#f4f4f5]"
          [ngpColorSwatchPickerItem]="swatch"
          [attr.aria-label]="swatch.toHex()"
        ></button>
      }
    </div>
  `,
})
export default class ColorSwatchPickerExample {
  readonly swatches: Color[] = [
    '#f01e2b',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#111827',
  ].map(hex => Color.parse(hex));
  color: Color = Color.parse('#3b82f6');
}
