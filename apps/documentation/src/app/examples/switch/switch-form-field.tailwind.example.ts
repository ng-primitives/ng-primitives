import { Component } from '@angular/core';
import { NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';

@Component({
  selector: 'app-switch-form-field-tailwind',
  standalone: true,
  imports: [NgpSwitch, NgpSwitchThumb, NgpFormField, NgpLabel],
  template: `
    <div class="flex items-center gap-4" ngpFormField>
      <label class="font-medium text-neutral-900 dark:text-neutral-50" ngpLabel>Mobile Data</label>
      <button
        class="relative h-6 w-10 rounded-full bg-neutral-300 p-0 ring-1 ring-black/10 outline-hidden transition duration-150 ease-in-out ring-inset data-checked:bg-blue-100 data-checked:ring-blue-600 data-data-checked:bg-blue-900 data-focus-visible:ring-2 data-focus-visible:ring-blue-500 dark:bg-neutral-800 dark:data-checked:ring-blue-600"
        ngpSwitch
      >
        <span
          class="block h-5 w-5 translate-x-[2px] transform rounded-full bg-white shadow-xs ring-0 transition-transform duration-150 ease-in-out data-checked:translate-x-[18px]"
          ngpSwitchThumb
        ></span>
      </button>
    </div>
  `,
})
export default class SwitchFormFieldTailwindExample {}
