import { Component, inject, TemplateRef } from '@angular/core';
import { NgpToast, NgpToastManager } from 'ng-primitives/toast';

@Component({
  selector: 'app-toast',
  imports: [NgpToast],
  template: `
    <button class="toast-trigger" (click)="show(toast)" ngpButton>Show Toast</button>

    <ng-template #toast>
      <div class="toast" ngpToast>
        <p class="toast-title">This is a toast message</p>
        <p class="toast-description">It will disappear in 3 seconds</p>
        <button class="toast-dismiss" ngpButton>Dismiss</button>
      </div>
    </ng-template>
  `,
  styles: `
    .toast-trigger {
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

    .toast-trigger[data-hover] {
      background-color: var(--ngp-background-hover);
    }

    .toast-trigger[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .toast-trigger[data-press] {
      background-color: var(--ngp-background-active);
    }

    .toast {
      z-index: var(--z-index);
      position: absolute;
      opacity: 0;
      transform: var(--y);
      touch-action: none;
      transition:
        transform 0.4s,
        opacity 0.4s,
        height 0.4s,
        box-shadow 0.2s;
      box-sizing: border-box;
      outline: 0;
      overflow-wrap: anywhere;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      width: var(--ngp-toast-width);
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;

      position: absolute;
      display: inline-grid;
      background: var(--ngp-background);
      box-shadow: var(--ngp-shadow);
      border: 1px solid var(--ngp-border);
      padding: 12px 16px;
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
      border-radius: 8px;
      z-index: 9999;
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto;
      column-gap: 12px;
      align-items: center;
      bottom: 0;
      height: fit-content;

      &[data-enter] {
        opacity: 1;
      }
    }

    .toast-title {
      color: var(--ngp-text-primary);
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
      color: var(--ngp-text-secondary);
      grid-column: 1 / 2;
      grid-row: 2;
      line-height: 16px;
    }

    .toast-dismiss {
      background: var(--ngp-background-inverse);
      color: var(--ngp-text-inverse);
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

    .toast[data-position-x='end'] {
      right: var(--ngp-toast-offset-right);
    }

    .toast[data-position-x='start'] {
      left: var(--ngp-toast-offset-left);
    }

    .toast[data-position-y='top'] {
      top: var(--ngp-toast-offset-top);
    }

    .toast[data-position-y='bottom'] {
      bottom: var(--ngp-toast-offset-bottom);
    }
  `,
})
export default class ToastExample {
  private readonly toastManager = inject(NgpToastManager);

  show(toast: TemplateRef<void>): void {
    const toastRef = this.toastManager.show(toast);
  }
}
