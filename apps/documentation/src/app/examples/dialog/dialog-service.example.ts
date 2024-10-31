import { Component, inject, OnInit } from '@angular/core';
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
  standalone: true,
  selector: 'app-dialog',
  imports: [NgpButton],
  template: `
    <button (click)="openDialogService()" ngpButton>Launch Dialog Service</button>
  `,
  styles: `
    :host,
    [ngpDialogOverlay] {
      --button-color: rgb(10 10 10);
      --button-background-color: rgb(255 255 255);
      --button-hover-color: rgb(10 10 10);
      --button-hover-background-color: rgb(250 250 250);
      --button-focus-shadow: rgb(59 130 246);
      --button-pressed-background-color: rgb(245 245 245);

      --button-color-dark: rgb(255 255 255);
      --button-background-color-dark: rgb(43 43 43);
      --button-hover-color-dark: rgb(255 255 255);
      --button-hover-background-color-dark: rgb(63, 63, 70);
      --button-focus-shadow-dark: rgb(59 130 246);
      --button-pressed-background-color-dark: rgb(39, 39, 42);
    }

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

    button[data-hover] {
      background-color: light-dark(
        var(--button-hover-background-color),
        var(--button-hover-background-color-dark)
      );
    }

    button[data-focus-visible] {
      box-shadow: 0 0 0 2px light-dark(var(--button-focus-shadow), var(--button-focus-shadow-dark));
    }

    button[data-press] {
      background-color: light-dark(
        var(--button-pressed-background-color),
        var(--button-pressed-background-color-dark)
      );
    }
  `,
})
export default class DialogExample {
  private dialogManager = inject(NgpDialogManager);

  openDialogService() {
    const dialogRef = this.dialogManager.open(DialogServiceExample, {
      data: 'test',
    });
    dialogRef.closed.subscribe(result => {
      console.log(result);
    });
  }
}

@Component({
  standalone: true,
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
  `,
  styles: `
    :host,
    [ngpDialogOverlay] {
      --button-color: rgb(10 10 10);
      --button-background-color: rgb(255 255 255);
      --button-hover-color: rgb(10 10 10);
      --button-hover-background-color: rgb(250 250 250);
      --button-focus-shadow: rgb(59 130 246);
      --button-pressed-background-color: rgb(245 245 245);

      --button-color-dark: rgb(255 255 255);
      --button-background-color-dark: rgb(43 43 43);
      --button-hover-color-dark: rgb(255 255 255);
      --button-hover-background-color-dark: rgb(63, 63, 70);
      --button-focus-shadow-dark: rgb(59 130 246);
      --button-pressed-background-color-dark: rgb(39, 39, 42);

      --dialog-bg: #fff;
      --dialog-title-color: rgba(0, 0, 0, 0.87);
      --dialog-description-color: rgba(0, 0, 0, 0.6);

      --dialog-bg-dark: #121212;
      --dialog-title-color-dark: #fff;
      --dialog-description-color-dark: rgba(255, 255, 255, 0.6);
    }

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

    button[data-hover] {
      background-color: light-dark(
        var(--button-hover-background-color),
        var(--button-hover-background-color-dark)
      );
    }

    button[data-focus-visible] {
      box-shadow: 0 0 0 2px light-dark(var(--button-focus-shadow), var(--button-focus-shadow-dark));
    }

    button[data-press] {
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
export class DialogServiceExample implements OnInit {
  private dialogRef = injectDialogRef<string>();

  ngOnInit() {
    console.log(this.dialogRef.data);
  }

  close() {
    this.dialogRef.close();
  }
}
