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
  selector: 'app-popover-dismiss-guard',
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
      #trigger="ngpPopoverTrigger"
      [ngpPopoverTrigger]="popover"
      [ngpPopoverTriggerCloseOnOutsideClick]="confirmBeforeClose"
      ngpButton
      type="button"
    >
      Unsaved Changes
    </button>

    <ng-template #popover>
      <div ngpPopover>
        <p class="popover-title">Edit Settings</p>
        <label>
          Name
          <input [(value)]="name" type="text" />
        </label>
        <p class="hint">Click outside to trigger the dismiss guard.</p>
      </div>
    </ng-template>

    <ng-template #confirmDialog let-close="close">
      <div ngpDialogOverlay>
        <div ngpDialog>
          <h1 ngpDialogTitle>Discard changes?</h1>
          <p ngpDialogDescription>You have unsaved changes. Are you sure you want to close?</p>
          <div class="dialog-footer">
            <button (click)="onCancel(close)" ngpButton>Keep Editing</button>
            <button class="destructive" (click)="onDiscard(close)" ngpButton>Discard</button>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    button[ngpButton] {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: var(--ngp-text-primary);
      border: none;
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: var(--ngp-background);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--ngp-button-shadow);
    }

    button[data-hover] {
      background-color: var(--ngp-background-hover);
    }

    button[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    button[data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpPopover] {
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      padding: 1rem;
      border-radius: 0.75rem;
      outline: none;
      position: absolute;
      animation: popover-show 0.1s ease-out;
      box-shadow: var(--ngp-shadow-lg);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 260px;
    }

    [ngpPopover][data-exit] {
      animation: popover-hide 0.1s ease-out;
    }

    .popover-title {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--ngp-text-primary);
      margin: 0;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--ngp-text-secondary);
    }

    input {
      height: 2rem;
      border-radius: 0.375rem;
      border: 1px solid var(--ngp-border);
      padding: 0 0.5rem;
      font-size: 0.875rem;
      outline: none;
      background-color: transparent;
      color: var(--ngp-text-primary);
    }

    input:focus {
      border-color: var(--ngp-focus-ring);
    }

    .hint {
      font-size: 0.75rem;
      color: var(--ngp-text-secondary);
      margin: 0;
      font-style: italic;
    }

    [ngpDialogOverlay] {
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      position: fixed;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1001;
    }

    [ngpDialogOverlay][data-exit] {
      animation: fadeOut 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpDialog] {
      background-color: var(--ngp-background);
      padding: 24px;
      border-radius: 8px;
      box-shadow: var(--ngp-shadow);
      animation: slideIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpDialog][data-exit] {
      animation: slideOut 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpDialogTitle] {
      font-size: 18px;
      line-height: 28px;
      font-weight: 600;
      color: var(--ngp-text-primary);
      margin: 0 0 4px;
    }

    [ngpDialogDescription] {
      font-size: 14px;
      line-height: 20px;
      color: var(--ngp-text-secondary);
      margin: 0;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
      column-gap: 8px;
    }

    .destructive {
      color: var(--ngp-text-red) !important;
    }

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

    @keyframes popover-hide {
      0% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      100% {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
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
  `,
})
export default class PopoverDismissGuardExample {
  private readonly dialogManager = inject(NgpDialogManager);
  private readonly confirmDialogRef = viewChild.required<TemplateRef<any>>('confirmDialog');
  private readonly trigger = viewChild.required(NgpPopoverTrigger);

  readonly name = signal('John Doe');

  /** Resolve function to settle the guard promise. */
  private resolveGuard: ((value: boolean) => void) | null = null;

  /**
   * Guard function passed to closeOnOutsideClick.
   * Opens a confirmation dialog and returns a promise that resolves
   * based on the user's choice.
   */
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
