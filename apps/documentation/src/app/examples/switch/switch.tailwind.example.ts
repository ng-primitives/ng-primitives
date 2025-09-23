import { Component } from '@angular/core';
import { NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';

@Component({
  selector: 'app-switch-tailwind',
  standalone: true,
  imports: [NgpSwitch, NgpSwitchThumb],
  template: `
    <button
      class="relative h-6 w-10 rounded-full border border-neutral-300 bg-neutral-200 p-0 outline-none transition duration-150 ease-in-out data-[checked]:border-blue-600 data-[checked]:bg-blue-100 data-[focus-visible]:ring-2 data-[focus-visible]:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:data-[checked]:border-blue-600"
      ngpSwitch
    >
      <span
        class="block h-5 w-5 translate-x-0.5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-150 ease-in-out data-[checked]:translate-x-[1.125rem]"
        ngpSwitchThumb
      ></span>
    </button>
  `,
})
export default class SwitchTailwindExample {}
