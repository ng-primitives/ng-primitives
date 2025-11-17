import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-button',
  imports: [NgpButton],
  template: `
    <button
      class="h-10 rounded-lg border-none bg-white px-4 font-medium text-gray-900 shadow-sm ring-1 ring-black/5 transition-colors duration-300 ease-in-out data-hover:bg-gray-50 data-press:bg-gray-100 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 dark:bg-gray-950 dark:text-gray-100 dark:ring-white/10 dark:data-hover:bg-gray-900 dark:data-press:bg-gray-800"
      ngpButton
    >
      Button
    </button>
  `,
})
export default class ButtonExample {}
