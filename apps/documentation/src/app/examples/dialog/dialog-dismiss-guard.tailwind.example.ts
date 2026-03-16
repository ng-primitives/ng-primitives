import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpDialog,
  NgpDialogDescription,
  NgpDialogOverlay,
  NgpDialogTitle,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';

@Component({
  selector: 'app-dialog-dismiss-guard',
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
      class="h-10 rounded-lg border-none bg-white px-4 font-medium text-zinc-900 shadow-sm ring-1 ring-black/5 transition-colors duration-300 ease-in-out data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
      [ngpDialogTrigger]="dialog"
      [ngpDialogTriggerCloseOnEscape]="canDismiss"
      [ngpDialogTriggerCloseOnOutsideClick]="canDismiss"
      ngpButton
    >
      Edit Profile
    </button>

    <ng-template #dialog let-close="close">
      <div
        class="animate-fade fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-xs"
        ngpDialogOverlay
      >
        <div
          class="animate-slide w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-950"
          ngpDialog
        >
          <h1 class="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100" ngpDialogTitle>
            Edit Profile
          </h1>
          <p class="text-sm text-zinc-600 dark:text-zinc-400" ngpDialogDescription>
            Make changes to your profile. Unsaved changes will be lost.
          </p>

          <div class="mt-4 flex flex-col gap-1">
            <label class="text-sm font-medium text-zinc-900 dark:text-zinc-100" for="name">
              Name
            </label>
            <input
              class="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              id="name"
              (input)="dirty.set(true)"
              type="text"
              value="John Doe"
              placeholder="Enter your name"
            />
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button
              class="h-10 rounded-lg border-none bg-white px-4 font-medium text-zinc-900 shadow-sm ring-1 ring-black/5 transition-colors duration-300 ease-in-out data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
              (click)="discard(close)"
              ngpButton
            >
              Discard
            </button>
            <button
              class="h-10 rounded-lg border-none bg-white px-4 font-medium text-blue-600 shadow-sm ring-1 ring-black/5 transition-colors duration-300 ease-in-out data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-blue-100 dark:bg-zinc-950 dark:text-blue-400 dark:ring-white/10 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
              (click)="save(close)"
              ngpButton
            >
              Save Changes
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
export default class DialogDismissGuardExample {
  readonly dirty = signal(false);

  readonly canDismiss = () => {
    if (!this.dirty()) {
      return true;
    }
    return confirm('You have unsaved changes. Discard them?');
  };

  discard(close: () => void) {
    this.dirty.set(false);
    close();
  }

  save(close: () => void) {
    this.dirty.set(false);
    close();
  }
}
