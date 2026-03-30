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
      [ngpPopoverTrigger]="popover"
      [ngpPopoverTriggerCloseOnOutsideClick]="canDismiss"
      [ngpPopoverTriggerCloseOnEscape]="canDismiss"
      ngpButton
      type="button"
    >
      Quick Note
    </button>

    <ng-template #popover>
      <div ngpPopover>
        <h3>Quick Note</h3>
        <textarea (input)="dirty.set(true)" rows="3" placeholder="Type something..."></textarea>
        <div class="popover-footer">
          <button (click)="dirty.set(false)" ngpButton type="button">Save</button>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    button {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: var(--ngp-text-primary);
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
    }

    button[data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpPopover] {
      position: absolute;
      display: flex;
      flex-direction: column;
      row-gap: 8px;
      width: 260px;
      border-radius: 0.75rem;
      background: var(--ngp-background);
      padding: 0.75rem 1rem;
      box-shadow: var(--ngp-shadow);
      border: 1px solid var(--ngp-border);
      outline: none;
      animation: popover-show 0.1s ease-out;
      transform-origin: var(--ngp-popover-transform-origin);
    }

    [ngpPopover][data-exit] {
      animation: popover-hide 0.1s ease-out;
    }

    [ngpPopover] h3 {
      font-size: 13px;
      font-weight: 500;
      margin: 0;
      color: var(--ngp-text-primary);
    }

    [ngpPopover] textarea {
      font-size: 13px;
      border-radius: 0.375rem;
      border: 1px solid var(--ngp-border);
      background-color: var(--ngp-background);
      color: var(--ngp-text-primary);
      padding: 0.5rem;
      resize: none;
      outline: none;
      font-family: inherit;
    }

    [ngpPopover] textarea:focus {
      border-color: var(--ngp-focus-ring);
      box-shadow: 0 0 0 1px var(--ngp-focus-ring);
    }

    .popover-footer {
      display: flex;
      justify-content: flex-end;
    }

    .popover-footer button {
      height: 1.75rem;
      font-size: 12px;
      padding-left: 0.75rem;
      padding-right: 0.75rem;
      color: var(--ngp-text-blue);
    }

    @keyframes popover-show {
      0% {
        opacity: 0;
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes popover-hide {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(0.9);
      }
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
    <div ngpDialogOverlay>
      <div ngpDialog>
        <h1 ngpDialogTitle>Discard changes?</h1>
        <p ngpDialogDescription>You have unsaved changes that will be lost.</p>
        <div class="dialog-footer">
          <button (click)="dialogRef.close(false)" ngpButton>Keep Editing</button>
          <button (click)="dialogRef.close(true)" ngpButton>Discard</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    button {
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

    [ngpDialogOverlay] {
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      position: fixed;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
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

    .dialog-footer [ngpButton]:last-of-type {
      color: var(--ngp-text-red, #dc2626);
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
class DiscardConfirmDialog {
  protected readonly dialogRef = injectDialogRef<void, boolean>();
}
