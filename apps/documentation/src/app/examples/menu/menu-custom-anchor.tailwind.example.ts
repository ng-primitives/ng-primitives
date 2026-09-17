import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronUpDownMini } from '@ng-icons/heroicons/mini';
import { NgpButton } from 'ng-primitives/button';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';

@Component({
  selector: 'app-menu-custom-anchor-tailwind',
  imports: [NgpButton, NgpMenu, NgpMenuTrigger, NgpMenuItem, NgIcon],
  providers: [provideIcons({ heroChevronUpDownMini })],
  template: `
    <button
      class="flex h-[2.125rem] w-full max-w-80 items-center justify-between gap-4 rounded-[0.625rem] border-none bg-white px-2.5 shadow-sm ring-1 ring-black/5 outline-hidden transition-colors duration-150 data-focus-visible:outline-2 data-focus-visible:outline-offset-1 data-focus-visible:outline-blue-500 data-hover:bg-gray-100 data-press:bg-gray-200 dark:bg-transparent dark:ring-white/10 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-white/10 dark:data-press:bg-white/20"
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerAnchor]="chevron"
      ngpMenuTriggerPlacement="bottom-end"
      ngpMenuTriggerOffset="12"
      ngpButton
    >
      <span class="text-sm font-[510] tracking-[-0.006em] text-gray-900 dark:text-gray-100">
        Sort by
      </span>
      <span
        class="inline-flex items-center gap-1 text-sm tracking-[-0.006em] text-gray-600 dark:text-gray-400"
      >
        Recently updated
        <span class="inline-flex text-gray-400 dark:text-gray-500" #chevron>
          <ng-icon name="heroChevronUpDownMini" size="16" />
        </span>
      </span>
    </button>

    <ng-template #menu>
      <div
        class="animate-in fade-in-0 zoom-in-95 fixed flex w-max origin-(--ngp-menu-transform-origin) flex-col rounded-[0.625rem] border border-gray-200 bg-white p-1 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpMenu
      >
        <button
          class="min-w-[140px] cursor-pointer rounded-md border-none bg-transparent px-3 py-1.5 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Recently updated
        </button>
        <button
          class="min-w-[140px] cursor-pointer rounded-md border-none bg-transparent px-3 py-1.5 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Name
        </button>
        <button
          class="min-w-[140px] cursor-pointer rounded-md border-none bg-transparent px-3 py-1.5 text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpMenuItem
        >
          Date created
        </button>
      </div>
    </ng-template>
  `,
})
export default class MenuCustomAnchorTailwindExample {}
