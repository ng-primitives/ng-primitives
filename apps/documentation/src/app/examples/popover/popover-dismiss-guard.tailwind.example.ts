import { Component, inject, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpDialog,
  NgpDialogDescription,
  NgpDialogManager,
  NgpDialogOverlay,
  NgpDialogTitle,
  injectDialogRef,
} from 'ng-primitives/dialog';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';

@Component({
  selector: 'app-popover-dismiss-guard',
  imports: [NgpPopoverTrigger, NgpPopover, NgpButton],
  template: `
    <button
      class="h-10 rounded-lg bg-white px-4 font-medium text-gray-900 shadow-sm ring-1 ring-black/5 transition-colors duration-300 ease-in-out data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-gray-50 data-press:bg-gray-100 dark:bg-transparent dark:text-gray-100 dark:shadow-sm dark:ring-white/10 dark:data-hover:bg-black dark:data-press:bg-black"
      [ngpPopoverTrigger]="popover"
      [ngpPopoverTriggerCloseOnOutsideClick]="canDismiss"
      [ngpPopoverTriggerCloseOnEscape]="canDismiss"
      ngpButton
      type="button"
    >
      Quick Note
    </button>

    <ng-template #popover>
      <div
        class="animate-in absolute flex w-[260px] flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-lg outline-hidden dark:border-zinc-800 dark:bg-black"
        ngpPopover
      >
        <h3 class="m-0 text-[13px] font-medium text-gray-900 dark:text-gray-100">Quick Note</h3>
        <textarea
          class="resize-none rounded-md border border-gray-300 bg-white p-2 font-[inherit] text-[13px] text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-black dark:text-gray-100"
          (input)="dirty.set(true)"
          rows="3"
          placeholder="Type something..."
        ></textarea>
        <div class="flex justify-end">
          <button
            class="h-7 rounded-lg bg-white px-3 text-xs font-medium text-blue-600 shadow-sm ring-1 ring-black/5 transition-colors data-hover:bg-gray-50 dark:bg-transparent dark:text-blue-400 dark:ring-white/10 dark:data-hover:bg-black"
            (click)="dirty.set(false)"
            ngpButton
            type="button"
          >
            Save
          </button>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    @keyframes fade-in {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
    @keyframes scale-in {
      0% {
        transform: scale(0.9);
      }
      100% {
        transform: scale(1);
      }
    }
    .animate-in {
      animation:
        fade-in 0.1s ease-out,
        scale-in 0.1s ease-out;
    }
  `,
})
export default class PopoverDismissGuardExample {
  private readonly dialogManager = inject(NgpDialogManager);

  readonly dirty = signal(false);

  readonly canDismiss = () => {
    if (!this.dirty()) {
      return true;
    }

    return new Promise<boolean>(resolve => {
      const ref = this.dialogManager.open(DiscardConfirmDialog, {
        closeOnEscape: false,
        closeOnOutsideClick: false,
      });
      ref.closed.subscribe(({ result }) => resolve(result === true));
    });
  };
}

@Component({
  imports: [NgpButton, NgpDialog, NgpDialogOverlay, NgpDialogTitle, NgpDialogDescription],
  template: `
    <div
      class="animate-fade fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-xs"
      ngpDialogOverlay
    >
      <div
        class="animate-slide w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-950"
        ngpDialog
      >
        <h1 class="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100" ngpDialogTitle>
          Discard changes?
        </h1>
        <p class="text-sm text-zinc-600 dark:text-zinc-400" ngpDialogDescription>
          You have unsaved changes that will be lost.
        </p>
        <div class="mt-6 flex justify-end gap-2">
          <button
            class="h-10 rounded-lg border-none bg-white px-4 font-medium text-zinc-900 shadow-sm ring-1 ring-black/5 transition-colors duration-300 ease-in-out data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
            (click)="dialogRef.close(false)"
            ngpButton
          >
            Keep Editing
          </button>
          <button
            class="h-10 rounded-lg border-none bg-white px-4 font-medium text-red-600 shadow-sm ring-1 ring-black/5 transition-colors duration-300 ease-in-out data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-red-100 dark:bg-zinc-950 dark:text-red-400 dark:ring-white/10 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
            (click)="dialogRef.close(true)"
            ngpButton
          >
            Discard
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
class DiscardConfirmDialog {
  protected readonly dialogRef = injectDialogRef<void, boolean>();
}
