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
  imports: [
    NgpButton,
    NgpDialog,
    NgpDialogOverlay,
    NgpDialogTitle,
    NgpDialogDescription,
    NgpDialogTrigger,
  ],
  template: `
    <button [ngpDialogTrigger]="dialog" ngpButton>Launch Dialog</button>

    <ng-template #dialog let-close="close">
      <div ngpDialogOverlay>
        <div ngpDialog>
          <h1 ngpDialogTitle>Publish this article?</h1>
          <p ngpDialogDescription>
            Are you sure you want to publish this article? This action is irreversible.
          </p>
          <div class="dialog-footer">
            <button (click)="close()" ngpButton>Cancel</button>
            <button (click)="close()" ngpButton>Confirm</button>
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
      color: var(--text-primary);
      border: none;
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: var(--background);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--button-shadow);
    }

    button[data-hover] {
      background-color: var(--background-hover);
    }

    button[data-focus-visible] {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    button[data-press] {
      background-color: var(--background-active);
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
      background-color: var(--background);
      padding: 24px;
      border-radius: 8px;
      box-shadow: var(--shadow);
    }

    [ngpDialogTitle] {
      font-size: 18px;
      line-height: 28px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 4px;
    }

    [ngpDialogDescription] {
      font-size: 14px;
      line-height: 20px;
      color: var(--text-secondary);
      margin: 0;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 32px;
      column-gap: 8px;
    }

    .dialog-footer [ngpButton]:last-of-type {
      color: var(--text-blue);
    }
  `,
})
export default class DialogExample {}
