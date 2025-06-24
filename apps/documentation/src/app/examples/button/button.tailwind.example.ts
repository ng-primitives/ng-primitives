import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-button-tailwind',
  imports: [NgpButton],
  template: `
    <button
      class="h-10 rounded-lg border-none bg-white px-4 font-medium text-gray-900 shadow-[0_1px_3px_0_rgb(0_0_0_/_0.1),_0_1px_2px_-1px_rgb(0_0_0_/_0.1),_0_0_0_1px_rgb(0_0_0_/_0.05)] transition-colors duration-300 ease-in-out data-[hover]:bg-gray-50 data-[press]:bg-gray-100 data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-blue-500 dark:bg-gray-950 dark:text-gray-100 dark:shadow-[0_1px_3px_0_rgb(255,255,255,0.1),_0_1px_2px_-1px_rgb(255,255,255,0.1),_0_0_0_1px_rgb(255,255,255,0.05)] dark:data-[hover]:bg-gray-900 dark:data-[press]:bg-gray-800"
      ngpButton
    >
      Button
    </button>
  `,
})
export default class ButtonTailwindExample {}
