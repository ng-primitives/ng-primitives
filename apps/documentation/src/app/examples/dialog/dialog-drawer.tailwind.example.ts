import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpDialog,
  NgpDialogDescription,
  NgpDialogOverlay,
  NgpDialogTitle,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';

@Component({
  selector: 'app-dialog-drawer',
  imports: [
    NgpButton,
    NgpDialog,
    NgpDialogOverlay,
    NgpDialogTitle,
    NgpDialogDescription,
    NgpDialogTrigger,
  ],
  template: `
    <button
      class="h-10 rounded-lg border-none bg-white px-4 font-medium text-zinc-900 shadow-sm ring-1 ring-black/5 transition-colors duration-300 ease-in-out data-hover:bg-zinc-50 data-press:bg-zinc-100 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
      [ngpDialogTrigger]="drawer"
      ngpButton
    >
      Launch Drawer
    </button>

    <ng-template #drawer let-close="close">
      <div
        class="animate-fade fixed inset-0 flex items-stretch justify-end bg-black/50 backdrop-blur-sm"
        ngpDialogOverlay
      >
        <div class="animate-drawer h-full w-80 max-w-full bg-white p-6 dark:bg-zinc-950" ngpDialog>
          <h1 class="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100" ngpDialogTitle>
            Settings
          </h1>
          <p class="text-sm text-zinc-600 dark:text-zinc-400" ngpDialogDescription>
            Change your preferences or manage your account in this drawer.
          </p>
          <div class="mt-8 flex justify-end gap-x-2">
            <button
              class="h-10 rounded-lg border-none bg-white px-4 font-medium text-zinc-900 shadow-sm ring-1 ring-black/5 transition-colors duration-300 ease-in-out data-hover:bg-zinc-50 data-press:bg-zinc-100 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
              (click)="close()"
              ngpButton
            >
              Cancel
            </button>
            <button
              class="h-10 rounded-lg border-none bg-white px-4 font-medium text-blue-600 shadow-sm ring-1 ring-black/5 transition-colors duration-300 ease-in-out data-hover:bg-blue-50 data-press:bg-blue-100 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 dark:bg-zinc-950 dark:text-blue-400 dark:ring-white/10 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
              (click)="close()"
              ngpButton
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    @keyframes fadeIn {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }

    @keyframes fadeOut {
      0% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }

    @keyframes drawerSlideIn {
      0% {
        transform: translateX(100%);
        opacity: 0;
      }
      100% {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes drawerSlideOut {
      0% {
        transform: translateX(0);
        opacity: 1;
      }
      100% {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    .animate-fade {
      animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .animate-fade[data-exit] {
      animation: fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .animate-drawer {
      animation: drawerSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .animate-drawer[data-exit] {
      animation: drawerSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `,
})
export default class DialogDrawerExample {}
