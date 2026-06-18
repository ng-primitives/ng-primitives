import { Component } from '@angular/core';
import { NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';

@Component({
  selector: 'app-switch-tailwind',
  standalone: true,
  imports: [NgpSwitch, NgpSwitchThumb],
  template: `
    <button
      class="relative h-6 w-10 rounded-full bg-neutral-300 p-0 ring-1 ring-black/10 outline-hidden transition duration-150 ease-in-out ring-inset data-checked:bg-[#f01e2b] data-checked:ring-[#f01e2b] data-focus-visible:ring-2 data-focus-visible:ring-blue-500 dark:bg-neutral-800 dark:data-checked:bg-[#ff4651] dark:data-checked:ring-[#ff4651] dark:data-focus-visible:ring-blue-400"
      ngpSwitch
    >
      <span
        class="block h-5 w-5 translate-x-[2px] transform rounded-full bg-white shadow-xs ring-0 transition-transform duration-150 ease-in-out data-checked:translate-x-[18px]"
        ngpSwitchThumb
      ></span>
    </button>
  `,
})
export default class SwitchTailwindExample {}
