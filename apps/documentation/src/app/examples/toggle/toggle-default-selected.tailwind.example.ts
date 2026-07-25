import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpToggle } from 'ng-primitives/toggle';

@Component({
  selector: 'app-toggle',
  imports: [NgpToggle, NgpButton],
  template: `
    <button
      class="h-[2.125rem] rounded-lg border-none bg-white px-3.5 font-[510] tracking-[-0.006em] text-gray-900 shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05)] transition-colors duration-300 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-gray-50 data-press:bg-gray-100 data-selected:bg-[#f01e2b] data-selected:text-white data-selected:data-hover:bg-[#d81825] dark:bg-zinc-950 dark:text-gray-100 dark:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05)] dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800 dark:data-selected:bg-[#ff4651] dark:data-selected:data-hover:bg-[#ff5d67]"
      ngpToggleDefaultSelected
      ngpButton
      ngpToggle
    >
      Toggle
    </button>
  `,
})
export default class ToggleDefaultSelectedExample {}
