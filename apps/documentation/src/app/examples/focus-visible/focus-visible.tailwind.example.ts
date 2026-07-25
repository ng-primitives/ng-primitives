import { Component } from '@angular/core';
import { NgpFocusVisible } from 'ng-primitives/interactions';

@Component({
  selector: 'app-focus-visible',
  imports: [NgpFocusVisible],
  template: `
    <button
      class="h-[2.125rem] rounded-lg border border-black/10 bg-white px-3.5 font-[510] text-gray-900 shadow-xs transition-colors duration-300 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-gray-100 dark:data-focus-visible:outline-blue-400"
      ngpFocusVisible
    >
      Try focusing me!
    </button>
  `,
})
export default class FocusVisibleExample {}
