import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpDialogTrigger } from 'ng-primitives/dialog';
import { Dialog } from './dialog';

@Component({
  selector: 'app-dialog-example',
  imports: [Dialog, NgpDialogTrigger, NgpButton],
  template: `
    <button [ngpDialogTrigger]="dialog" ngpButton>Open Dialog</button>

    <ng-template #dialog let-close="close">
      <app-dialog header="Dialog header">
        <p>This is a dialog. It can be used to display information or to ask for confirmation.</p>
        <p>
          You can use the dialog to display any content you want. It can be used to display forms,
          images, or any other content.
        </p>
        <p>
          You can also use the dialog to ask for confirmation. For example, you can use it to ask
          the user if they want to delete an item.
        </p>

        <button (click)="close()" ngpButton>Close</button>
        <button (click)="close()" ngpButton>Delete</button>
      </app-dialog>
    </ng-template>
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
export default class App {}
