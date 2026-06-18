import { Component } from '@angular/core';
import {
  NgpContextMenu,
  NgpContextMenuItem,
  NgpContextMenuTrigger,
} from 'ng-primitives/context-menu';

@Component({
  selector: 'app-context-menu-tailwind',
  imports: [NgpContextMenu, NgpContextMenuTrigger, NgpContextMenuItem],
  template: `
    <div
      class="flex h-[150px] w-[300px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-500 select-none dark:border-gray-600 dark:text-gray-400"
      [ngpContextMenuTrigger]="menu"
    >
      Right-click me
    </div>

    <ng-template #menu>
      <div
        class="animate-in fade-in-0 zoom-in-95 fixed flex w-max origin-(--ngp-menu-transform-origin) flex-col rounded-[0.625rem] border border-gray-200 bg-white p-1 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpContextMenu
      >
        <button
          class="min-w-[140px] cursor-pointer rounded-md border-none bg-transparent px-3 py-1.5 text-left text-sm font-medium tracking-[-0.006em] text-gray-900 outline-hidden transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpContextMenuItem
        >
          Cut
        </button>
        <button
          class="min-w-[140px] cursor-pointer rounded-md border-none bg-transparent px-3 py-1.5 text-left text-sm font-medium tracking-[-0.006em] text-gray-900 outline-hidden transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpContextMenuItem
        >
          Copy
        </button>
        <button
          class="min-w-[140px] cursor-pointer rounded-md border-none bg-transparent px-3 py-1.5 text-left text-sm font-medium tracking-[-0.006em] text-gray-900 outline-hidden transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 active:bg-gray-200 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpContextMenuItem
        >
          Paste
        </button>
      </div>
    </ng-template>
  `,
})
export default class ContextMenuTailwindExample {}
