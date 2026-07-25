import { Component } from '@angular/core';
import { NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';

@Component({
  selector: 'app-switch-form-field-tailwind',
  standalone: true,
  imports: [NgpSwitch, NgpSwitchThumb, NgpFormField, NgpLabel],
  template: `
    <div class="flex items-center gap-4" ngpFormField>
      <label class="font-medium text-zinc-900 dark:text-zinc-50" ngpLabel>Mobile Data</label>
      <button
        class="relative h-6 w-10 rounded-full border border-black/10 bg-zinc-300 p-0 transition duration-150 ease-in-out outline-none data-checked:border-[#f01e2b] data-checked:bg-[#f01e2b] data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 dark:border-zinc-800 dark:bg-zinc-700 dark:data-checked:border-[#ff4651] dark:data-checked:bg-[#ff4651] dark:data-focus-visible:outline-blue-400"
        ngpSwitch
      >
        <span
          class="block h-5 w-5 translate-x-px transform rounded-full bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05)] transition-transform duration-150 ease-in-out outline-none data-checked:translate-x-[17px]"
          ngpSwitchThumb
        ></span>
      </button>
    </div>
  `,
})
export default class SwitchFormFieldTailwindExample {}
