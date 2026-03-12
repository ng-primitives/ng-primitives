import { Component, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpDialog,
  NgpDialogDescription,
  NgpDialogManager,
  NgpDialogOverlay,
  NgpDialogTitle,
} from 'ng-primitives/dialog';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';

@Component({
  selector: 'app-popover-dismiss-guard-tailwind',
  imports: [
    NgpPopoverTrigger,
    NgpPopover,
    NgpButton,
    NgpDialogOverlay,
    NgpDialog,
    NgpDialogTitle,
    NgpDialogDescription,
  ],
  template: `
    <button
      class="h-10 rounded-lg border-none bg-white px-4 font-medium text-zinc-900 shadow-sm ring-1 ring-black/5 transition-colors data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
      #trigger="ngpPopoverTrigger"
      [ngpPopoverTrigger]="popover"
      [ngpPopoverTriggerCloseOnOutsideClick]="confirmBeforeClose"
      ngpButton
      type="button"
    >
      Unsaved Changes
    </button>

    <ng-template #popover>
      <div
        class="animate-popover absolute z-50 flex w-[260px] flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg outline-hidden dark:border-zinc-700 dark:bg-zinc-950"
        ngpPopover
      >
        <p class="m-0 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Edit Settings</p>
        <label class="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
          Name
          <input
            class="h-8 rounded-md border border-zinc-200 bg-transparent px-2 text-sm text-zinc-900 outline-hidden focus:border-blue-500 dark:border-zinc-700 dark:text-zinc-100"
            [(value)]="name"
            type="text"
          />
        </label>
        <p class="m-0 text-xs text-zinc-400 italic dark:text-zinc-500">
          Click outside to trigger the dismiss guard.
        </p>
      </div>
    </ng-template>

    <ng-template #confirmDialog let-close="close">
      <div
        class="animate-fade fixed inset-0 z-[1001] flex items-center justify-center bg-black/50 backdrop-blur-xs"
        ngpDialogOverlay
      >
        <div
          class="animate-slide w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-950"
          ngpDialog
        >
          <h1 class="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100" ngpDialogTitle>
            Discard changes?
          </h1>
          <p class="text-sm text-zinc-600 dark:text-zinc-400" ngpDialogDescription>
            You have unsaved changes. Are you sure you want to close?
          </p>
          <div class="mt-6 flex justify-end gap-2">
            <button
              class="h-10 rounded-lg border-none bg-white px-4 font-medium text-zinc-900 shadow-sm ring-1 ring-black/5 transition-colors data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
              (click)="onCancel(close)"
              ngpButton
            >
              Keep Editing
            </button>
            <button
              class="h-10 rounded-lg border-none bg-white px-4 font-medium text-red-600 shadow-sm ring-1 ring-black/5 transition-colors data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-red-100 dark:bg-zinc-950 dark:text-red-400 dark:ring-white/10 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
              (click)="onDiscard(close)"
              ngpButton
            >
              Discard
            </button>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    @keyframes popover-show {
      0% {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

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

    .animate-popover {
      animation: popover-show 0.1s ease-out;
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
export default class PopoverDismissGuardTailwindExample {
  private readonly dialogManager = inject(NgpDialogManager);
  private readonly confirmDialogRef = viewChild.required<TemplateRef<any>>('confirmDialog');
  private readonly trigger = viewChild.required(NgpPopoverTrigger);

  readonly name = signal('John Doe');

  private resolveGuard: ((value: boolean) => void) | null = null;

  readonly confirmBeforeClose = (): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
      this.resolveGuard = resolve;
      this.dialogManager.open(this.confirmDialogRef());
    });
  };

  onCancel(closeDialog: () => void): void {
    closeDialog();
    this.resolveGuard?.(false);
    this.resolveGuard = null;
  }

  onDiscard(closeDialog: () => void): void {
    closeDialog();
    this.resolveGuard?.(true);
    this.resolveGuard = null;
  }
}
