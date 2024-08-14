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
  standalone: true,
  selector: 'app-dialog',
  imports: [
    NgpButton,
    NgpDialog,
    NgpDialogOverlay,
    NgpDialogTitle,
    NgpDialogDescription,
    NgpDialogTrigger,
  ],
  template: `
    <button [ngpDialogTrigger]="dialog">Launch Dialog</button>

    <ng-template #dialog>
      <div ngpDialogOverlay>
        <div ngpDialog>
          <h1 ngpDialogTitle>Publish this article?</h1>
          <p ngpDialogDescription>
            Are you sure you want to publish this article? This action is irreversible.
          </p>
          <div class="dialog-footer">
            <button ngpButton>Cancel</button>
            <button ngpButton>Confirm</button>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    button {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: light-dark(var(--button-color), var(--button-color-dark));
      border: none;
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: light-dark(
        var(--button-background-color),
        var(--button-background-color-dark)
      );
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
    }

    button[data-hover='true'] {
      background-color: light-dark(
        var(--button-hover-background-color),
        var(--button-hover-background-color-dark)
      );
    }

    button[data-focus-visible='true'] {
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05),
        0 0 0 2px light-dark(#005fcc, #99c8ff);
    }

    button[data-press='true'] {
      background-color: light-dark(
        var(--button-pressed-background-color),
        var(--button-pressed-background-color-dark)
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
      background-color: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
    }

    [ngpDialogTitle] {
      font-size: 18px;
      line-height: 28px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.87);
      margin: 0 0 4px;
    }

    [ngpDialogDescription] {
      font-size: 14px;
      line-height: 20px;
      color: rgba(0, 0, 0, 0.6);
      margin: 0;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 32px;
    }

    .dialog-footer [ngpButton]:not([data-focus-visible='true']) {
      box-shadow: none;
    }

    .dialog-footer [ngpButton]:last-of-type {
      color: rgb(59 130 246);
    }
  `,
})
export default class DialogExample {}
