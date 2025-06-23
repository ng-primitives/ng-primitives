import { ComponentType } from '@angular/cdk/overlay';
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
    <button (click)="openDialog()" ngpButton>Launch Dialog</button>
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
  `,
})
export default class DialogDataExample {
  private dialogManager = inject(NgpDialogManager);

  openDialog() {
    this.dialogManager.open(Dialog as ComponentType<any>, {
      data: 'This came from the dialog opener!',
    });
  }
}

@Component({
  imports: [NgpButton, NgpDialog, NgpDialogOverlay, NgpDialogTitle, NgpDialogDescription],
  template: `
    <div ngpDialogOverlay>
      <div ngpDialog>
        <h1 ngpDialogTitle>Dialog data example</h1>
        <p ngpDialogDescription>The following value was passed to the dialog:</p>

        <p class="dialog-data">{{ dialogRef.data }}</p>

        <div class="dialog-footer">
          <button (click)="close()" ngpButton>Cancel</button>
          <button (click)="close()" ngpButton>Confirm</button>
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

    .dialog-data {
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      color: var(--ngp-text-primary);
      margin: 8px 0 0;
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
      margin-top: 32px;
      column-gap: 8px;
    }

    .dialog-footer [ngpButton]:last-of-type {
      color: var(--ngp-text-blue);
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
export class Dialog {
  protected readonly dialogRef = injectDialogRef<string>();

  close() {
    this.dialogRef.close();
  }
}
