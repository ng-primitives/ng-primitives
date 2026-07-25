import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronRightMini } from '@ng-icons/heroicons/mini';
import {
  NgpContextMenu,
  NgpContextMenuItem,
  NgpContextMenuSubmenuTrigger,
  NgpContextMenuTrigger,
} from 'ng-primitives/context-menu';

@Component({
  selector: 'app-context-menu-submenu-tailwind',
  imports: [
    NgpContextMenu,
    NgpContextMenuTrigger,
    NgpContextMenuItem,
    NgpContextMenuSubmenuTrigger,
    NgIcon,
  ],
  providers: [provideIcons({ heroChevronRightMini })],
  template: `
    <div
      class="flex h-[150px] w-[300px] items-center justify-center rounded-xl border-2 border-dashed border-black/10 text-[14px] tracking-[-0.006em] text-zinc-600 select-none dark:border-zinc-800 dark:text-zinc-300"
      [ngpContextMenuTrigger]="menu"
    >
      Right-click me
    </div>

    <ng-template #menu>
      <div
        class="fixed flex w-max origin-(--ngp-menu-transform-origin) flex-col rounded-[0.625rem] border border-gray-200 bg-white p-1 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpContextMenu
      >
        <button
          class="flex min-w-[140px] cursor-pointer items-center justify-between gap-3 rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-medium tracking-[-0.006em] text-zinc-900 outline-hidden transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpContextMenuItem
        >
          Cut
        </button>
        <button
          class="flex min-w-[140px] cursor-pointer items-center justify-between gap-3 rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-medium tracking-[-0.006em] text-zinc-900 outline-hidden transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpContextMenuItem
        >
          Copy
        </button>
        <button
          class="flex min-w-[140px] cursor-pointer items-center justify-between gap-3 rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-medium tracking-[-0.006em] text-zinc-900 outline-hidden transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          [ngpContextMenuSubmenuTrigger]="submenu"
          ngpContextMenuItem
        >
          More
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
        ngpContextMenu
      >
        <button
          class="flex min-w-[140px] cursor-pointer items-center justify-between gap-3 rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-medium tracking-[-0.006em] text-zinc-900 outline-hidden transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpContextMenuItem
        >
          Paste
        </button>
        <button
          class="flex min-w-[140px] cursor-pointer items-center justify-between gap-3 rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-medium tracking-[-0.006em] text-zinc-900 outline-hidden transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpContextMenuItem
        >
          Paste Special
        </button>
        <button
          class="flex min-w-[140px] cursor-pointer items-center justify-between gap-3 rounded-md border-none bg-transparent py-[0.4375rem] pr-2 pl-3 text-left text-sm font-medium tracking-[-0.006em] text-zinc-900 outline-hidden transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-white/10 dark:focus-visible:bg-white/10 dark:active:bg-white/20"
          ngpContextMenuItem
        >
          Delete
        </button>
      </div>
    </ng-template>
  `,
  styles: `
    [ngpContextMenu][data-enter] {
      animation: menu-show 0.1s ease-out;
    }

    [ngpContextMenu][data-exit] {
      animation: menu-hide 0.1s ease-out;
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
export default class ContextMenuSubmenuTailwindExample {}
