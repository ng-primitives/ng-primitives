import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini } from '@ng-icons/heroicons/mini';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpMenu,
  NgpMenuItem,
  NgpMenuItemCheckbox,
  NgpMenuItemIndicator,
  NgpMenuTrigger,
} from 'ng-primitives/menu';

@Component({
  selector: 'app-menu-checkbox-tailwind',
  imports: [
    NgpButton,
    NgpMenu,
    NgpMenuItem,
    NgpMenuTrigger,
    NgpMenuItemCheckbox,
    NgpMenuItemIndicator,
    NgIcon,
  ],
  providers: [provideIcons({ heroCheckMini })],
  template: `
    <button
      class="h-[2.125rem] rounded-[0.625rem] border-none bg-white px-3.5 font-[510] tracking-[-0.006em] text-gray-900 shadow-sm ring-1 ring-black/5 outline-hidden transition-colors duration-300 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500 active:bg-gray-200 dark:bg-transparent dark:text-gray-100 dark:ring-white/10 dark:hover:bg-white/10 dark:focus-visible:outline-blue-400 dark:active:bg-white/20"
      [ngpMenuTrigger]="menu"
      ngpButton
    >
      View Options
    </button>

    <ng-template #menu>
      <div
        class="animate-in fade-in-0 zoom-in-95 fixed flex w-max origin-(--ngp-menu-transform-origin) flex-col rounded-[0.625rem] border border-gray-200 bg-white p-1 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpMenu
      >
        <button
          class="flex min-w-[160px] cursor-pointer items-center gap-2 rounded-md border-none bg-transparent px-3 py-1.5 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          [(ngpMenuItemCheckboxChecked)]="showToolbar"
          ngpMenuItemCheckbox
        >
          <span
            class="invisible flex h-4 w-4 items-center justify-center text-[#f01e2b] data-[checked]:visible dark:text-[#ff4651]"
            ngpMenuItemIndicator
          >
            <ng-icon name="heroCheckMini" aria-hidden="true" />
          </span>
          Show Toolbar
        </button>
        <button
          class="flex min-w-[160px] cursor-pointer items-center gap-2 rounded-md border-none bg-transparent px-3 py-1.5 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          [(ngpMenuItemCheckboxChecked)]="showSidebar"
          ngpMenuItemCheckbox
        >
          <span
            class="invisible flex h-4 w-4 items-center justify-center text-[#f01e2b] data-[checked]:visible dark:text-[#ff4651]"
            ngpMenuItemIndicator
          >
            <ng-icon name="heroCheckMini" aria-hidden="true" />
          </span>
          Show Sidebar
        </button>
        <button
          class="flex min-w-[160px] cursor-pointer items-center gap-2 rounded-md border-none bg-transparent px-3 py-1.5 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          [(ngpMenuItemCheckboxChecked)]="showStatusBar"
          ngpMenuItemCheckbox
        >
          <span
            class="invisible flex h-4 w-4 items-center justify-center text-[#f01e2b] data-[checked]:visible dark:text-[#ff4651]"
            ngpMenuItemIndicator
          >
            <ng-icon name="heroCheckMini" aria-hidden="true" />
          </span>
          Show Status Bar
        </button>
      </div>
    </ng-template>
  `,
})
export default class MenuCheckboxTailwindExample {
  showToolbar = true;
  showSidebar = true;
  showStatusBar = false;
}
