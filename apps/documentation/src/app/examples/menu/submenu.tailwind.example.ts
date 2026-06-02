import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronRightMini } from '@ng-icons/heroicons/mini';
import { NgpButton } from 'ng-primitives/button';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpSubmenuTrigger } from 'ng-primitives/menu';

@Component({
  selector: 'app-menu-submenu-tailwind',
  imports: [NgpButton, NgpMenu, NgpMenuTrigger, NgpMenuItem, NgpSubmenuTrigger, NgIcon],
  providers: [provideIcons({ heroChevronRightMini })],
  template: `
    <button
      class="h-[2.125rem] rounded-[0.625rem] border-none bg-white px-3.5 font-[510] tracking-[-0.006em] text-gray-900 shadow-sm ring-1 ring-black/5 outline-hidden transition-colors duration-300 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500 active:bg-gray-200 dark:bg-transparent dark:text-gray-100 dark:ring-white/10 dark:hover:bg-white/10 dark:focus-visible:outline-blue-400 dark:active:bg-white/20"
      [ngpMenuTrigger]="menu"
      ngpButton
    >
      Open Menu
    </button>

    <ng-template #menu>
      <div
        class="animate-in fade-in-0 zoom-in-95 fixed flex w-max origin-(--ngp-menu-transform-origin) flex-col rounded-[0.625rem] border border-gray-200 bg-white p-1 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpMenu
      >
        <button
          class="flex min-w-[140px] cursor-pointer items-center justify-between gap-3 rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Item 1
        </button>
        <button
          class="flex min-w-[140px] cursor-pointer items-center justify-between gap-3 rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Item 2
        </button>
        <button
          class="flex min-w-[140px] cursor-pointer items-center justify-between gap-3 rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          [ngpSubmenuTrigger]="submenu"
          ngpMenuItem
        >
          Item 3
          <ng-icon
            class="text-gray-400 dark:text-gray-500"
            style="--ng-icon__size: 1rem"
            name="heroChevronRightMini"
          />
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div
        class="animate-in fade-in-0 zoom-in-95 fixed flex w-max origin-(--ngp-menu-transform-origin) flex-col rounded-[0.625rem] border border-gray-200 bg-white p-1 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpMenu
      >
        <button
          class="flex min-w-[140px] cursor-pointer items-center justify-between gap-3 rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Item 1
        </button>
        <button
          class="flex min-w-[140px] cursor-pointer items-center justify-between gap-3 rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Item 2
        </button>
        <button
          class="flex min-w-[140px] cursor-pointer items-center justify-between gap-3 rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Item 3
        </button>
      </div>
    </ng-template>
  `,
})
export default class MenuSubmenuTailwindExample {}
