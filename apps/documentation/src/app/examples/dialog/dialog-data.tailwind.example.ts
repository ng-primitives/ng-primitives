import { Component, inject } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  injectDialogRef,
  NgpDialog,
  NgpDialogDescription,
  NgpDialogManager,
  NgpDialogOverlay,
  NgpDialogTitle,
} from 'ng-primitives/dialog';

@Component({
  selector: 'app-dialog',
  imports: [NgpButton],
  template: `
    <button
      class="h-10 rounded-lg border-none bg-white px-4 font-medium text-zinc-900 shadow-sm ring-1 ring-black/5 transition-colors duration-300 ease-in-out data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
      (click)="openDialog()"
      ngpButton
    >
      Launch Dialog
    </button>
  `,
})
export default class DialogDataExample {
  private dialogManager = inject(NgpDialogManager);

  openDialog() {
    this.dialogManager.open(Dialog, {
      data: 'This came from the dialog opener!',
    });
  }
}

@Component({
  imports: [NgpButton, NgpDialog, NgpDialogOverlay, NgpDialogTitle, NgpDialogDescription],
  template: `
    <div
      class="animate-fade fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-xs"
      ngpDialogOverlay
    >
      <div
        class="animate-slide w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-950"
        ngpDialog
      >
        <h1 class="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100" ngpDialogTitle>
          Dialog data example
        </h1>
        <p class="text-sm text-zinc-600 dark:text-zinc-400" ngpDialogDescription>
          The following value was passed to the dialog:
        </p>

        <p class="mt-2 text-sm leading-5 font-semibold text-zinc-900 dark:text-zinc-100">
          {{ dialogRef.data }}
        </p>

        <div class="mt-8 flex justify-end gap-2">
          <button
            class="h-10 rounded-lg border-none bg-white px-4 font-medium text-zinc-900 shadow-sm ring-1 ring-black/5 transition-colors duration-300 ease-in-out data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
            (click)="close()"
            ngpButton
          >
            Cancel
          </button>
          <button
            class="h-10 rounded-lg border-none bg-white px-4 font-medium text-blue-600 shadow-sm ring-1 ring-black/5 transition-colors duration-300 ease-in-out data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-blue-50 data-press:bg-blue-100 dark:bg-zinc-950 dark:text-blue-400 dark:ring-white/10 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
            (click)="close()"
            ngpButton
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
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

    @keyframes slideIn {
      0% {
        transform: translateY(-20px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      0% {
        transform: translateY(0);
        opacity: 1;
      }
      100% {
        transform: translateY(-20px);
        opacity: 0;
      }
    }

    .animate-fade {
      animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .animate-fade[data-exit] {
      animation: fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .animate-slide {
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .animate-slide[data-exit] {
      animation: slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `,
})
export class Dialog {
  protected readonly dialogRef = injectDialogRef<string>();

  close() {
    this.dialogRef.close();
  }
}
