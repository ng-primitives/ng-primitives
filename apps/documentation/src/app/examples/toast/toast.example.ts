import { Component } from '@angular/core';
import { NgpToast } from 'ng-primitives/toast';

@Component({
  standalone: true,
  selector: 'app-toast',
  imports: [NgpToast],
  template: `
    <button class="toast-trigger" (click)="toast.show()" ngpButton>Show Toast</button>

    <ng-template #toast="ngpToast" ngpToast let-dismiss="dismiss">
      <div class="toast">
        <p class="toast-title">This is a toast message</p>
        <p class="toast-description">It will disappear in 3 seconds</p>
        <button class="toast-dismiss" (click)="dismiss()" ngpButton>Dismiss</button>
      </div>
    </ng-template>
  `,
  styles: `
    :host {
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

    .toast-trigger {
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

    .toast-trigger[data-hover='true'] {
      background-color: light-dark(
        var(--button-hover-background-color),
        var(--button-hover-background-color-dark)
      );
    }

    .toast-trigger[data-focus-visible='true'] {
      box-shadow: 0 0 0 2px light-dark(var(--button-focus-shadow), var(--button-focus-shadow-dark));
    }

    .toast-trigger[data-press='true'] {
      background-color: light-dark(
        var(--button-pressed-background-color),
        var(--button-pressed-background-color-dark)
      );
    }

    .toast {
      position: fixed;
      display: inline-grid;
      background: light-dark(#fff, #27272a);
      box-shadow: inset 0 0 0 1px light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1));
      padding: 12px 16px;
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
      border-radius: 8px;
      z-index: 9999;
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto;
      column-gap: 12px;
      align-items: center;
    }

    .toast-title {
      color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
      font-size: 0.75rem;
      font-weight: 600;
      margin: 0;
      grid-column: 1 / 2;
      grid-row: 1;
      line-height: 16px;
    }

    .toast-description {
      font-size: 0.75rem;
      margin: 0;
      color: light-dark(rgba(0, 0, 0, 0.7), rgba(255, 255, 255, 0.7));
      grid-column: 1 / 2;
      grid-row: 2;
      line-height: 16px;
    }

    .toast-dismiss {
      background: light-dark(#27272a, #fff);
      color: light-dark(rgb(255, 255, 255), rgb(0, 0, 0));
      border: none;
      border-radius: 8px;
      padding: 4px 8px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      grid-column: 2 / 3;
      grid-row: 1 / 3;
      max-height: 27px;
    }

    .toast[data-toast='visible'] {
      opacity: 1;
    }

    .toast[data-position='end'] {
      right: 16px;
    }

    .toast[data-position='start'] {
      left: 16px;
    }

    .toast[data-gravity='top'] {
      top: -150px;
    }

    .toast[data-gravity='bottom'] {
      bottom: -150px;
    }

    .toast[data-position='center'] {
      margin-left: auto;
      margin-right: auto;
      left: 0;
      right: 0;
      max-width: fit-content;
    }
  `,
})
export default class ToastExample {}
