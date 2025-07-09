import { Component, inject, TemplateRef } from '@angular/core';
import { NgpToast, NgpToastManager } from 'ng-primitives/toast';

@Component({
  selector: 'app-toast',
  imports: [NgpToast],
  template: `
    <button class="toast-trigger" (click)="show(toast)" ngpButton>Show Toast</button>

    <ng-template #toast let-dismiss="dismiss">
      <div class="toast" ngpToast>
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
      position: absolute;
      opacity: 0;
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

      display: inline-grid;
      background: var(--ngp-background);
      box-shadow: var(--ngp-shadow);
      border: 1px solid var(--ngp-border);
      padding: 12px 16px;
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
      border-radius: 8px;
      z-index: var(--ngp-toast-z-index);
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto;
      column-gap: 12px;
      align-items: center;
      width: var(--ngp-toast-width);
      height: fit-content;
      transform: var(--y);
      overflow-wrap: anywhere;
    }

    .toast-title {
      color: var(--ngp-text-primary);
      font-size: 0.75rem;
      font-weight: 600;
      margin: 0;
      grid-column: 1 / 2;
      grid-row: 1;
      line-height: 16px;
      user-select: none;
    }

    .toast-description {
      font-size: 0.75rem;
      margin: 0;
      color: var(--ngp-text-secondary);
      grid-column: 1 / 2;
      grid-row: 2;
      line-height: 16px;
      user-select: none;
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
      right: 0;
    }

    .toast[data-position-x='start'] {
      left: 0;
    }

    .toast[data-position-y='top'] {
      top: 0;
      --lift: 1;
      --lift-amount: calc(var(--lift) * var(--ngp-toast-gap));
      --y: translateY(-100%);
    }

    .toast[data-position-y='bottom'] {
      bottom: 0;
      --lift: -1;
      --lift-amount: calc(var(--lift) * var(--ngp-toast-gap));
      --y: translateY(100%);
    }

    .toast[data-enter] {
      opacity: 1;
      --y: translateY(0);
    }

    .toast[data-exit] {
      opacity: 0;
      --y: translateY(calc(calc(var(--lift) * var(--ngp-toast-gap)) * -1));
    }

    .toast[data-visible='false'] {
      opacity: 0;
      pointer-events: none;
    }

    .toast[data-expanded='false'][data-front='false'] {
      --scale: var(--ngp-toasts-before) * 0.05 + 1;
      --y: translateY(calc(var(--lift-amount) * var(--ngp-toasts-before)))
        scale(calc(-1 * var(--scale)));
      height: var(--ngp-toast-front-height);
    }

    .toast[data-expanded='true'] {
      --y: translateY(calc(var(--lift) * var(--ngp-toast-offset)));
      height: var(--ngp-toast-height);
    }

    .toast[data-swiping='true'] {
      transform: var(--y) translateY(var(--ngp-toast-swipe-amount-y, 0))
        translateX(var(--ngp-toast-swipe-amount-x, 0));
      transition: none;
    }

    .toast[data-exit][data-y-position='bottom'],
    .toast[data-exit][data-y-position='top'] {
      animation-duration: 200ms;
      animation-timing-function: ease-out;
      animation-fill-mode: forwards;
    }

    .toast[data-exit][data-swipe-direction='left'] {
      animation-name: swipe-out-left;
    }

    .toast[data-exit][data-swipe-direction='right'] {
      animation-name: swipe-out-right;
    }

    .toast[data-exit][data-swipe-direction='up'] {
      animation-name: swipe-out-up;
    }

    .toast[data-exit][data-swipe-direction='down'] {
      animation-name: swipe-out-down;
    }

    @keyframes swipe-out-left {
      from {
        transform: var(--y) translateX(var(--ngp-toast-swipe-amount-x));
        opacity: 1;
      }

      to {
        transform: var(--y) translateX(calc(var(--ngp-toast-swipe-amount-x) - 100%));
        opacity: 0;
      }
    }

    @keyframes swipe-out-right {
      from {
        transform: var(--y) translateX(var(--ngp-toast-swipe-amount-x));
        opacity: 1;
      }

      to {
        transform: var(--y) translateX(calc(var(--ngp-toast-swipe-amount-x) + 100%));
        opacity: 0;
      }
    }

    @keyframes swipe-out-up {
      from {
        transform: var(--y) translateY(var(--ngp-toast-swipe-amount-y));
        opacity: 1;
      }

      to {
        transform: var(--y) translateY(calc(var(--ngp-toast-swipe-amount-y) - 100%));
        opacity: 0;
      }
    }

    @keyframes swipe-out-down {
      from {
        transform: var(--y) translateY(var(--ngp-toast-swipe-amount-y));
        opacity: 1;
      }

      to {
        transform: var(--y) translateY(calc(var(--ngp-toast-swipe-amount-y) + 100%));
        opacity: 0;
      }
    }
  `,
})
export default class ToastExample {
  private readonly toastManager = inject(NgpToastManager);

  show(toast: TemplateRef<void>): void {
    const toastRef = this.toastManager.show(toast, {
      placement: 'bottom-end',
    });
  }
}
