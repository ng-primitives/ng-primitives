import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpMenu, NgpMenuItem, NgpMenuItemShortcut, NgpMenuTrigger } from 'ng-primitives/menu';

@Component({
  selector: 'app-menu-item-shortcut-tailwind',
  imports: [NgpButton, NgpMenu, NgpMenuTrigger, NgpMenuItem, NgpMenuItemShortcut],
  template: `
    <button
      class="h-[2.125rem] cursor-pointer rounded-[0.625rem] border-none bg-white px-3.5 font-[510] tracking-[-0.006em] text-gray-900 shadow-[inset_0_0_0_1px_rgb(228_228_231),0_1px_2px_0_rgba(0,0,0,0.04)] outline-hidden transition-colors duration-150 data-focus-visible:outline-2 data-focus-visible:outline-offset-1 data-focus-visible:outline-blue-500 data-focus-visible:outline-solid data-hover:bg-gray-100 data-press:bg-gray-200 dark:bg-zinc-950 dark:text-gray-100 dark:shadow-[inset_0_0_0_1px_rgb(39_39_42)] dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-white/10 dark:data-press:bg-white/20"
      [ngpMenuTrigger]="menu"
      ngpButton
    >
      Edit
    </button>

    <ng-template #menu>
      <div
        class="animate-in fade-in-0 zoom-in-95 fixed flex w-max origin-(--ngp-menu-transform-origin) flex-col rounded-[0.625rem] border border-gray-200 bg-white p-1 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpMenu
      >
        @for (item of items; track item.label) {
          <button
            class="flex min-w-[180px] cursor-pointer items-center justify-between gap-6 rounded-md border-none bg-transparent px-3 py-[0.4375rem] text-start text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-hidden transition-colors data-focus-visible:bg-gray-100 data-hover:bg-gray-100 data-press:bg-gray-200 dark:text-gray-100 dark:data-focus-visible:bg-white/10 dark:data-hover:bg-white/10 dark:data-press:bg-white/20"
            ngpMenuItem
          >
            {{ item.label }}
            <kbd
              class="font-sans text-xs font-normal tracking-[-0.011em] text-zinc-500 dark:text-zinc-400"
              [ngpMenuItemShortcutKeys]="item.keys"
              ngpMenuItemShortcut
            >
              {{ item.shortcut }}
            </kbd>
          </button>
        }
      </div>
    </ng-template>
  `,
})
export default class MenuItemShortcutTailwindExample {
  readonly items = [
    { label: 'Undo', shortcut: '⌘Z', keys: 'Meta+Z' },
    { label: 'Redo', shortcut: '⇧⌘Z', keys: 'Shift+Meta+Z' },
    { label: 'Duplicate', shortcut: '⌘D', keys: 'Meta+D' },
    { label: 'Archive', shortcut: '⌘E', keys: 'Meta+E' },
  ];
}
