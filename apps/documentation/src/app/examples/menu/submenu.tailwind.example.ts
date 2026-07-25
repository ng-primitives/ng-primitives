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
      class="h-[2.125rem] rounded-[0.625rem] border-none bg-white px-3.5 font-[510] tracking-[-0.006em] text-zinc-900 shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05)] outline-hidden transition-colors duration-300 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-blue-500 active:bg-zinc-200 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05)] dark:hover:bg-white/10 dark:focus-visible:outline-blue-400 dark:active:bg-white/20"
      [ngpMenuTrigger]="menu"
      ngpButton
    >
      Open Menu
    </button>

    <ng-template #menu>
      <div
        class="fixed flex w-max origin-(--ngp-menu-transform-origin) flex-col rounded-[0.625rem] border border-gray-200 bg-white p-1 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpMenu
      >
        <button
          class="flex min-w-[140px] cursor-pointer items-center justify-between gap-3 rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-zinc-900 outline-hidden transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Item 1
        </button>
        <button
          class="flex min-w-[140px] cursor-pointer items-center justify-between gap-3 rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-zinc-900 outline-hidden transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Item 2
        </button>
        <button
          class="flex min-w-[140px] cursor-pointer items-center justify-between gap-3 rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-zinc-900 outline-hidden transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          [ngpSubmenuTrigger]="submenu"
          ngpMenuItem
        >
          Item 3
          <ng-icon
            class="text-zinc-400! dark:text-zinc-500!"
            style="--ng-icon__size: 1rem"
            name="heroChevronRightMini"
          />
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div
        class="fixed flex w-max origin-(--ngp-menu-transform-origin) flex-col rounded-[0.625rem] border border-gray-200 bg-white p-1 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpMenu
      >
        <button
          class="flex min-w-[140px] cursor-pointer items-center justify-between gap-3 rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-zinc-900 outline-hidden transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Item 1
        </button>
        <button
          class="flex min-w-[140px] cursor-pointer items-center justify-between gap-3 rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-zinc-900 outline-hidden transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Item 2
        </button>
        <button
          class="flex min-w-[140px] cursor-pointer items-center justify-between gap-3 rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-[510] tracking-[-0.006em] text-zinc-900 outline-hidden transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Item 3
        </button>
      </div>
    </ng-template>
  `,
  styles: `
    [ngpMenu] {
      animation: menu-show 0.2s ease-out;
    }

    [ngpMenu][data-exit] {
      animation: menu-hide 0.2s ease-out;
    }

    @keyframes menu-show {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes menu-hide {
      from {
        opacity: 1;
        transform: scale(1);
      }
      to {
        opacity: 0;
        transform: scale(0.9);
      }
    }
  `,
})
export default class MenuSubmenuTailwindExample {}
