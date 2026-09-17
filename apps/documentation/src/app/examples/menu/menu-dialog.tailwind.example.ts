import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpDialog,
  NgpDialogDescription,
  NgpDialogOverlay,
  NgpDialogTitle,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';

@Component({
  selector: 'app-menu-dialog-tailwind',
  imports: [
    NgpButton,
    NgpMenu,
    NgpMenuTrigger,
    NgpMenuItem,
    NgpDialog,
    NgpDialogOverlay,
    NgpDialogTitle,
    NgpDialogDescription,
    NgpDialogTrigger,
  ],
  template: `
    <button
      class="inline-flex h-[2.125rem] items-center rounded-lg border-none bg-white px-3.5 text-sm font-[510] tracking-[-0.006em] text-zinc-900 shadow-xs ring-1 ring-black/5 transition-colors duration-150 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
      [ngpMenuTrigger]="menu"
      ngpButton
    >
      Open Menu
    </button>

    <!-- z-[1000] matches the dialog overlay: both portal into <body>, so whichever opened
         last is last in the DOM and paints on top. -->
    <ng-template #menu>
      <div
        class="animate-menu animate-in fade-in-0 zoom-in-95 fixed z-[1000] flex w-max origin-(--ngp-menu-transform-origin) flex-col rounded-[0.625rem] border border-zinc-200 bg-white p-1 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
        ngpMenu
      >
        <button
          class="min-w-[160px] cursor-pointer rounded-md border-none bg-transparent px-3 py-1.5 text-start text-sm font-[510] tracking-[-0.006em] text-zinc-900 outline-hidden transition-colors duration-150 data-focus-visible:bg-zinc-100 data-hover:bg-zinc-100 data-press:bg-zinc-200 dark:text-zinc-100 dark:data-focus-visible:bg-zinc-900 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
          ngpMenuItem
        >
          Rename
        </button>
        <button
          class="min-w-[160px] cursor-pointer rounded-md border-none bg-transparent px-3 py-1.5 text-start text-sm font-[510] tracking-[-0.006em] text-zinc-900 outline-hidden transition-colors duration-150 data-focus-visible:bg-zinc-100 data-hover:bg-zinc-100 data-press:bg-zinc-200 dark:text-zinc-100 dark:data-focus-visible:bg-zinc-900 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
          ngpMenuItem
        >
          Duplicate
        </button>
        <button
          class="min-w-[160px] cursor-pointer rounded-md border-none bg-transparent px-3 py-1.5 text-start text-sm font-[510] tracking-[-0.006em] text-zinc-900 outline-hidden transition-colors duration-150 data-focus-visible:bg-zinc-100 data-hover:bg-zinc-100 data-press:bg-zinc-200 dark:text-zinc-100 dark:data-focus-visible:bg-zinc-900 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
          [ngpDialogTrigger]="confirm"
          [ngpMenuItemCloseOnSelect]="false"
          ngpMenuItem
        >
          Delete...
        </button>
      </div>
    </ng-template>

    <ng-template #confirm let-close="close">
      <div
        class="animate-fade fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-xs"
        ngpDialogOverlay
      >
        <div
          class="animate-slide w-[min(24rem,calc(100vw-2rem))] rounded-[0.875rem] border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
          ngpDialog
        >
          <h1
            class="mb-1 text-lg leading-7 font-[590] tracking-[-0.014em] text-zinc-900 dark:text-zinc-100"
            ngpDialogTitle
          >
            Delete this file?
          </h1>
          <p
            class="text-sm leading-5 tracking-[-0.006em] text-zinc-600 dark:text-zinc-400"
            ngpDialogDescription
          >
            The file and its revision history are removed for everyone. This cannot be undone.
          </p>
          <div class="mt-6 flex justify-end gap-x-2">
            <button
              class="inline-flex h-[2.125rem] items-center rounded-lg border-none bg-white px-3.5 text-sm font-[510] tracking-[-0.006em] text-zinc-900 shadow-xs ring-1 ring-black/5 transition-colors duration-150 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
              (click)="close()"
              ngpButton
              type="button"
            >
              Cancel
            </button>
            <button
              class="inline-flex h-[2.125rem] items-center rounded-lg border-none bg-[#f01e2b] px-3.5 text-sm font-[510] tracking-[-0.006em] text-white transition-colors duration-150 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-[#d81825] data-press:bg-[#c1141f] dark:bg-[#ff4651] dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-[#ff5d67] dark:data-press:bg-[#f0303c]"
              (click)="close()"
              ngpButton
              type="button"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-8px);
      }
    }

    @keyframes menuOut {
      from {
        opacity: 1;
        transform: scale(1);
      }
      to {
        opacity: 0;
        transform: scale(0.95);
      }
    }

    .animate-menu[data-exit] {
      animation: menuOut 0.1s ease-out;
    }

    .animate-fade {
      animation: fadeIn 0.15s cubic-bezier(0, 0, 0.2, 1);
    }

    .animate-fade[data-exit] {
      animation: fadeOut 0.15s cubic-bezier(0.4, 0, 1, 1);
    }

    .animate-slide {
      animation: slideIn 0.15s cubic-bezier(0, 0, 0.2, 1);
    }

    .animate-slide[data-exit] {
      animation: slideOut 0.15s cubic-bezier(0.4, 0, 1, 1);
    }
  `,
})
export default class MenuDialogExample {}
