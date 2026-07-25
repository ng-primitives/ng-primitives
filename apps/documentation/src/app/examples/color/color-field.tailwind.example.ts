import { Component } from '@angular/core';
import { Color, NgpColorField, NgpColorPicker } from 'ng-primitives/color';

@Component({
  selector: 'app-color-field',
  imports: [NgpColorPicker, NgpColorField],
  template: `
    <!-- channel-mode fields, coordinated by the picker so they update together -->
    <div class="flex items-end gap-2" [(ngpColorPickerValue)]="color" ngpColorPicker>
      <div
        class="size-[34px] shrink-0 rounded-lg shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]"
        [style.background]="color.toHex()"
      ></div>

      <div class="flex flex-col gap-1">
        <label
          class="text-[0.75rem] font-[510] tracking-[-0.011em] text-zinc-500 dark:text-zinc-400"
          for="r"
        >
          R
        </label>
        <input
          class="h-[34px] w-14 rounded-lg border border-black/10 bg-white px-2 text-sm font-[510] tracking-[-0.006em] text-zinc-900 tabular-nums outline-none data-focus:border-blue-500 data-focus:ring-1 data-focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:data-focus:border-blue-400 dark:data-focus:ring-blue-400"
          id="r"
          ngpColorField
          ngpColorFieldChannel="red"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label
          class="text-[0.75rem] font-[510] tracking-[-0.011em] text-zinc-500 dark:text-zinc-400"
          for="g"
        >
          G
        </label>
        <input
          class="h-[34px] w-14 rounded-lg border border-black/10 bg-white px-2 text-sm font-[510] tracking-[-0.006em] text-zinc-900 tabular-nums outline-none data-focus:border-blue-500 data-focus:ring-1 data-focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:data-focus:border-blue-400 dark:data-focus:ring-blue-400"
          id="g"
          ngpColorField
          ngpColorFieldChannel="green"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label
          class="text-[0.75rem] font-[510] tracking-[-0.011em] text-zinc-500 dark:text-zinc-400"
          for="b"
        >
          B
        </label>
        <input
          class="h-[34px] w-14 rounded-lg border border-black/10 bg-white px-2 text-sm font-[510] tracking-[-0.006em] text-zinc-900 tabular-nums outline-none data-focus:border-blue-500 data-focus:ring-1 data-focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:data-focus:border-blue-400 dark:data-focus:ring-blue-400"
          id="b"
          ngpColorField
          ngpColorFieldChannel="blue"
        />
      </div>
    </div>
  `,
})
export default class ColorFieldExample {
  color: Color = Color.parse('#3366cc');
}
