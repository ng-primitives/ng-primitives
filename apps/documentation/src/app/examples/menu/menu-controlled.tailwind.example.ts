import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';

@Component({
  selector: 'app-menu-controlled-tailwind',
  imports: [NgpButton, NgpMenu, NgpMenuTrigger, NgpMenuItem],
  template: `
    <div class="flex items-center gap-2">
      <button
        class="h-[2.125rem] cursor-pointer rounded-[0.625rem] border-none bg-white px-3.5 font-[510] tracking-[-0.006em] text-gray-900 shadow-[inset_0_0_0_1px_rgb(228_228_231),0_1px_2px_0_rgba(0,0,0,0.04)] outline-hidden transition-colors duration-150 data-focus-visible:outline-2 data-focus-visible:outline-offset-1 data-focus-visible:outline-blue-500 data-hover:bg-gray-100 data-press:bg-gray-200 dark:bg-zinc-950 dark:text-gray-100 dark:shadow-[inset_0_0_0_1px_rgb(39_39_42)] dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-white/10 dark:data-press:bg-white/20"
        [(ngpMenuTriggerOpen)]="open"
        [ngpMenuTrigger]="menu"
        ngpButton
      >
        Actions
      </button>
      <button
        class="h-[2.125rem] cursor-pointer rounded-[0.625rem] border-none bg-white px-3.5 font-[510] tracking-[-0.006em] text-gray-900 shadow-[inset_0_0_0_1px_rgb(228_228_231),0_1px_2px_0_rgba(0,0,0,0.04)] outline-hidden transition-colors duration-150 data-focus-visible:outline-2 data-focus-visible:outline-offset-1 data-focus-visible:outline-blue-500 data-hover:bg-gray-100 data-press:bg-gray-200 dark:bg-zinc-950 dark:text-gray-100 dark:shadow-[inset_0_0_0_1px_rgb(39_39_42)] dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-white/10 dark:data-press:bg-white/20"
        (click)="open.set(true)"
        ngpButton
      >
        Open from code
      </button>
    </div>
    <p class="mt-3 mb-0 text-[0.8125rem] tracking-[-0.011em] text-gray-600 dark:text-gray-400">
      The menu is {{ open() ? 'open' : 'closed' }}.
    </p>

    <ng-template #menu>
      <div
        class="animate-in fade-in-0 zoom-in-95 fixed flex w-max origin-(--ngp-menu-transform-origin) flex-col rounded-[0.625rem] border border-gray-200 bg-white p-1 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpMenu
      >
        @for (item of items; track item) {
          <button
            class="min-w-[140px] cursor-pointer rounded-md border-none bg-transparent px-3 py-[0.4375rem] text-left text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden transition-colors data-focus-visible:bg-gray-100 data-hover:bg-gray-100 data-press:bg-gray-200 dark:text-gray-100 dark:data-focus-visible:bg-white/10 dark:data-hover:bg-white/10 dark:data-press:bg-white/20"
            ngpMenuItem
          >
            {{ item }}
          </button>
        }
      </div>
    </ng-template>
  `,
})
export default class MenuControlledTailwindExample {
  readonly open = signal(false);
  readonly items = ['Rename', 'Duplicate', 'Archive'];
}
