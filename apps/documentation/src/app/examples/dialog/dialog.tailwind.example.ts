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
  selector: 'app-dialog',
  standalone: true,
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
      class="h-10 rounded-lg border-none bg-white px-4 font-medium text-gray-900 shadow ring-1 ring-black/5 transition-colors duration-300 ease-in-out data-[hover]:bg-gray-50 data-[press]:bg-gray-100 data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-blue-500 dark:bg-gray-950 dark:text-gray-100 dark:ring-white/10 dark:data-[hover]:bg-gray-900 dark:data-[press]:bg-gray-800"
      [ngpDialogTrigger]="dialog"
      ngpButton
    >
      Launch Dialog
    </button>

    <ng-template #dialog let-close="close">
      <div
        class="animate-fadeIn data-[state=closed]:animate-fadeOut fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        ngpDialogOverlay
      >
        <div
          class="animate-slideIn data-[state=closed]:animate-slideOut w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-950"
          ngpDialog
        >
          <h1 class="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100" ngpDialogTitle>
            Publish this article?
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400" ngpDialogDescription>
            Are you sure you want to publish this article? This action is irreversible.
          </p>
          <div class="mt-8 flex justify-end gap-2">
            <button
              class="h-10 rounded-lg border-none bg-white px-4 font-medium text-gray-900 shadow ring-1 ring-black/5 transition-colors duration-300 ease-in-out data-[hover]:bg-gray-50 data-[press]:bg-gray-100 data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-blue-500 dark:bg-gray-950 dark:text-gray-100 dark:ring-white/10 dark:data-[hover]:bg-gray-900 dark:data-[press]:bg-gray-800"
              (click)="close()"
              ngpButton
            >
              Cancel
            </button>
            <button
              class="h-10 rounded-lg border-none bg-white px-4 font-medium text-blue-600 shadow ring-1 ring-black/5 transition-colors duration-300 ease-in-out data-[hover]:bg-blue-50 data-[press]:bg-blue-100 data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-blue-500 dark:bg-gray-950 dark:text-blue-400 dark:ring-white/10 dark:data-[hover]:bg-gray-900 dark:data-[press]:bg-gray-800"
              (click)="close()"
              ngpButton
            >
              Confirm
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
    .animate-fadeIn {
      animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .animate-fadeOut {
      animation: fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .animate-slideIn {
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .animate-slideOut {
      animation: slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `,
})
export default class DialogExample {}
