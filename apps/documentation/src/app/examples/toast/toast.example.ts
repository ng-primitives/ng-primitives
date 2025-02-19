import { Component } from '@angular/core';
import { NgpToast } from 'ng-primitives/toast';

@Component({
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
    .toast-trigger {
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

    .toast-trigger[data-hover] {
      background-color: var(--background-hover);
    }

    .toast-trigger[data-focus-visible] {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    .toast-trigger[data-press] {
      background-color: var(--background-active);
    }

    .toast {
      position: fixed;
      display: inline-grid;
      background: var(--background);
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
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
      color: var(--text-primary);
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
      color: var(--text-secondary);
      grid-column: 1 / 2;
      grid-row: 2;
      line-height: 16px;
    }

    .toast-dismiss {
      background: var(--background-inverse);
      color: var(--text-inverse);
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
