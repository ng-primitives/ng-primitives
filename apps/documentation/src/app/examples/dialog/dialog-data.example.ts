import { Component, inject } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  injectDialogRef,
  NgpDialog,
  NgpDialogDescription,
  NgpDialogManager,
  NgpDialogOverlay,
  NgpDialogTitle,
  NgpDialogTrigger,
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
      border: 1px solid var(--ngp-border);
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: var(--ngp-background);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--ngp-shadow);
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
    }

    [ngpDialog] {
      background-color: var(--ngp-background);
      padding: 24px;
      border-radius: 8px;
      box-shadow: var(--ngp-shadow);
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
      column-gap: 4px;
    }

    .dialog-footer [ngpButton]:last-of-type {
      color: var(--ngp-text-blue);
    }
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
  imports: [
    NgpButton,
    NgpDialog,
    NgpDialogOverlay,
    NgpDialogTitle,
    NgpDialogDescription,
    NgpDialogTrigger,
  ],
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
    :host,
    [ngpDialogOverlay] {
      --ngp-button-color: rgb(10 10 10);
      --ngp-button-background-color: rgb(255 255 255);
      --ngp-button-hover-color: rgb(10 10 10);
      --ngp-button-hover-background-color: rgb(250 250 250);
      --ngp-button-focus-shadow: rgb(59 130 246);
      --ngp-button-pressed-background-color: rgb(245 245 245);

      --ngp-button-color-dark: rgb(255 255 255);
      --ngp-button-background-color-dark: rgb(43 43 43);
      --ngp-button-hover-color-dark: rgb(255 255 255);
      --ngp-button-hover-background-color-dark: rgb(63, 63, 70);
      --ngp-button-focus-shadow-dark: rgb(59 130 246);
      --ngp-button-pressed-background-color-dark: rgb(39, 39, 42);

      --dialog-bg: #fff;
      --dialog-title-color: rgba(0, 0, 0, 0.87);
      --dialog-description-color: rgba(0, 0, 0, 0.6);

      --dialog-bg-dark: #121212;
      --dialog-title-color-dark: #fff;
      --dialog-description-color-dark: rgba(255, 255, 255, 0.6);

      --dialog-data-color: rgba(0, 0, 0, 0.87);
      --dialog-data-color-dark: #fff;
    }

    button {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: light-dark(var(--ngp-button-color), var(--ngp-button-color-dark));
      border: none;
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: light-dark(
        var(--ngp-button-background-color),
        var(--ngp-button-background-color-dark)
      );
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
    }

    button[data-hover] {
      background-color: light-dark(
        var(--ngp-button-hover-background-color),
        var(--ngp-button-hover-background-color-dark)
      );
    }

    button[data-focus-visible] {
      box-shadow: 0 0 0 2px
        light-dark(var(--ngp-button-focus-shadow), var(--ngp-button-focus-shadow-dark));
    }

    button[data-press] {
      background-color: light-dark(
        var(--ngp-button-pressed-background-color),
        var(--ngp-button-pressed-background-color-dark)
      );
    }

    [ngpDialogOverlay] {
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      position: fixed;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    [ngpDialog] {
      background-color: light-dark(var(--dialog-bg), var(--dialog-bg-dark));
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
    }

    [ngpDialogTitle] {
      font-size: 18px;
      line-height: 28px;
      font-weight: 600;
      color: light-dark(var(--dialog-title-color), var(--dialog-title-color-dark));
      margin: 0 0 4px;
    }

    [ngpDialogDescription] {
      font-size: 14px;
      line-height: 20px;
      color: light-dark(var(--dialog-description-color), var(--dialog-description-color-dark));
      margin: 0;
    }

    .dialog-data {
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      color: light-dark(var(--dialog-data-color), var(--dialog-data-color-dark));
      margin: 8px 0 0;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 32px;
      column-gap: 4px;
    }

    .dialog-footer [ngpButton]:not([data-focus-visible]) {
      box-shadow: none;
    }

    .dialog-footer [ngpButton]:last-of-type {
      color: rgb(59 130 246);
    }
  `,
})
export class Dialog {
  protected readonly dialogRef = injectDialogRef<string>();

  close() {
    this.dialogRef.close();
  }
}
