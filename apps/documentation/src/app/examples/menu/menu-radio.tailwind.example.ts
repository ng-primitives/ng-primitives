import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpMenu,
  NgpMenuItem,
  NgpMenuItemIndicator,
  NgpMenuItemRadio,
  NgpMenuItemRadioGroup,
  NgpMenuTrigger,
} from 'ng-primitives/menu';

@Component({
  selector: 'app-menu-radio-tailwind',
  imports: [
    NgpButton,
    NgpMenu,
    NgpMenuItem,
    NgpMenuTrigger,
    NgpMenuItemRadioGroup,
    NgpMenuItemRadio,
    NgpMenuItemIndicator,
  ],
  template: `
    <button
      class="h-10 rounded-lg border-none bg-white px-4 font-medium text-gray-900 shadow-sm ring-1 ring-black/5 outline-hidden transition-colors duration-300 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500 active:bg-gray-200 dark:bg-transparent dark:text-gray-100 dark:ring-white/10 dark:hover:bg-white/10 dark:active:bg-white/20"
      [ngpMenuTrigger]="menu"
      ngpButton
    >
      Theme
    </button>

    <ng-template #menu>
      <div
        class="animate-in fade-in-0 zoom-in-95 fixed flex w-max origin-(--ngp-menu-transform-origin) flex-col rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-black"
        ngpMenu
      >
        <div ngpMenuItemRadioGroup [(ngpMenuItemRadioGroupValue)]="theme">
          <button
            class="flex min-w-[160px] cursor-pointer items-center gap-2 rounded-sm border-none bg-transparent px-3 py-1.5 text-left text-[14px] font-normal outline-hidden transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:active:bg-white/20"
            ngpMenuItemRadio
            ngpMenuItemRadioValue="light"
          >
            <span
              class="box-border flex h-3.5 w-3.5 items-center justify-center rounded-full border-[1.5px] border-gray-300 transition-colors data-[checked]:border-blue-500 dark:border-gray-600 dark:data-[checked]:border-blue-400 after:block after:h-1.5 after:w-1.5 after:scale-0 after:rounded-full after:bg-blue-500 after:transition-transform data-[checked]:after:scale-100 dark:after:bg-blue-400"
              ngpMenuItemIndicator
            ></span>
            Light
          </button>
          <button
            class="flex min-w-[160px] cursor-pointer items-center gap-2 rounded-sm border-none bg-transparent px-3 py-1.5 text-left text-[14px] font-normal outline-hidden transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:active:bg-white/20"
            ngpMenuItemRadio
            ngpMenuItemRadioValue="dark"
          >
            <span
              class="box-border flex h-3.5 w-3.5 items-center justify-center rounded-full border-[1.5px] border-gray-300 transition-colors data-[checked]:border-blue-500 dark:border-gray-600 dark:data-[checked]:border-blue-400 after:block after:h-1.5 after:w-1.5 after:scale-0 after:rounded-full after:bg-blue-500 after:transition-transform data-[checked]:after:scale-100 dark:after:bg-blue-400"
              ngpMenuItemIndicator
            ></span>
            Dark
          </button>
          <button
            class="flex min-w-[160px] cursor-pointer items-center gap-2 rounded-sm border-none bg-transparent px-3 py-1.5 text-left text-[14px] font-normal outline-hidden transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:active:bg-white/20"
            ngpMenuItemRadio
            ngpMenuItemRadioValue="system"
          >
            <span
              class="box-border flex h-3.5 w-3.5 items-center justify-center rounded-full border-[1.5px] border-gray-300 transition-colors data-[checked]:border-blue-500 dark:border-gray-600 dark:data-[checked]:border-blue-400 after:block after:h-1.5 after:w-1.5 after:scale-0 after:rounded-full after:bg-blue-500 after:transition-transform data-[checked]:after:scale-100 dark:after:bg-blue-400"
              ngpMenuItemIndicator
            ></span>
            System
          </button>
        </div>
      </div>
    </ng-template>
  `,
})
export default class MenuRadioTailwindExample {
  theme = 'system';
}
