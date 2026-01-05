import { Component, inject } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { injectToastContext, NgpToast, NgpToastManager } from 'ng-primitives/toast';

@Component({
  selector: 'app-toast',
  imports: [NgpButton],
  hostDirectives: [NgpToast],
  host: {
    'animate.enter': 'toast-enter',
    'animate.leave': 'toast-leave',
  },
  template: `
    <p class="toast-title">{{ context.header }}</p>
    <p class="toast-description">{{ context.description }}</p>
    <button class="toast-dismiss" (click)="dismiss()" ngpButton>Dismiss</button>
  `,
  styles: `
    :host {
      position: absolute;
      touch-action: none;
      box-sizing: border-box;
      align-items: center;
      gap: 6px;
      display: inline-grid;
      background: var(--ngp-background);
      box-shadow: var(--ngp-shadow);
      border: 1px solid var(--ngp-border);
      padding: 12px 16px;
      opacity: 0;
      border-radius: 8px;
      z-index: var(--ngp-toast-z-index);
      grid-template-columns: 1fr auto;
      grid-template-rows: min-content min-content;
      column-gap: 12px;
      align-items: center;
      width: 350px;
      height: fit-content;
      transform: var(--y);
      transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
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

    :host[data-position-x='end'] {
      right: 0;
    }

    :host[data-position-x='start'] {
      left: 0;
    }

    :host[data-position-y='top'] {
      top: 0;
      --lift: 1;
      --lift-amount: calc(var(--lift) * var(--ngp-toast-gap));
      --y: translateY(-100%);
    }

    :host[data-position-y='bottom'] {
      bottom: 0;
      --lift: -1;
      --lift-amount: calc(var(--lift) * var(--ngp-toast-gap));
      --y: translateY(100%);
    }

    :host[data-enter] {
      opacity: 1;
      --y: translateY(0);
    }

    :host[data-exit] {
      opacity: 0;
      --y: translateY(calc(calc(var(--lift) * var(--ngp-toast-gap)) * -1));
    }

    :host[data-visible='false'] {
      opacity: 0;
      pointer-events: none;
    }

    :host[data-expanded='true']::after {
      content: '';
      position: absolute;
      left: 0;
      height: calc(var(--ngp-toast-gap) + 1px);
      bottom: 100%;
      width: 100%;
    }

    :host[data-expanded='false'][data-front='false'] {
      --scale: var(--ngp-toasts-before) * 0.05 + 1;
      --y: translateY(calc(var(--lift-amount) * var(--ngp-toasts-before)))
        scale(calc(-1 * var(--scale)));
      height: var(--ngp-toast-front-height);
    }

    :host[data-expanded='true'] {
      --y: translateY(calc(var(--lift) * var(--ngp-toast-offset)));
      height: auto;
    }

    :host[data-swiping='true'] {
      transform: var(--y) translateY(var(--ngp-toast-swipe-amount-y, 0))
        translateX(var(--ngp-toast-swipe-amount-x, 0));
      transition: none;
    }

    :host[data-swiping='true'][data-swipe-direction='left'] {
      /* Fade out from -45px to -100px swipe */
      opacity: calc(1 - clamp(0, ((-1 * var(--ngp-toast-swipe-x, 0px)) - 45) / 55, 1));
    }

    :host[data-swiping='true'][data-swipe-direction='right'] {
      /* Fade out from 45px to 100px swipe */
      opacity: calc(1 - clamp(0, (var(--ngp-toast-swipe-x, 0px) - 45) / 55, 1));
    }

    :host[data-swiping='true'][data-swipe-direction='top'] {
      /* Fade out from -45px to -100px swipe */
      opacity: calc(1 - clamp(0, ((-1 * var(--ngp-toast-swipe-y, 0px)) - 45) / 55, 1));
    }

    :host[data-swiping='true'][data-swipe-direction='bottom'] {
      /* Fade out from 45px to 100px swipe */
      opacity: calc(1 - clamp(0, (var(--ngp-toast-swipe-y, 0px) - 45) / 55, 1));
    }

    /* Truncate text only when toast is not front AND not expanded */
    :host[data-front='false'][data-expanded='false'] .toast-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :host[data-front='false'][data-expanded='false'] .toast-description {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Angular animations based on position */

    /* Bottom position animations */
    :host[data-position-y='bottom'].toast-enter {
      animation: toast-slide-in-bottom 400ms cubic-bezier(0.215, 0.61, 0.355, 1);
    }

    :host[data-position-y='bottom'].toast-leave {
      opacity: 0;
      transform: translateY(100%);
      transition:
        opacity 400ms cubic-bezier(0.215, 0.61, 0.355, 1),
        transform 400ms cubic-bezier(0.215, 0.61, 0.355, 1);
    }

    /* Top position animations */
    :host[data-position-y='top'].toast-enter {
      animation: toast-slide-in-top 400ms cubic-bezier(0.215, 0.61, 0.355, 1);
    }

    :host[data-position-y='top'].toast-leave {
      opacity: 0;
      transform: translateY(-100%);
      transition:
        opacity 400ms cubic-bezier(0.215, 0.61, 0.355, 1),
        transform 400ms cubic-bezier(0.215, 0.61, 0.355, 1);
    }

    /* Keyframes for bottom position */
    @keyframes toast-slide-in-bottom {
      from {
        opacity: 0;
        transform: translateY(100%);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Keyframes for top position */
    @keyframes toast-slide-in-top {
      from {
        opacity: 0;
        transform: translateY(-100%);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
})
export class Toast {
  private readonly toastManager = inject(NgpToastManager);
  private readonly toast = inject(NgpToast);
  protected readonly context = injectToastContext<ToastContext>();

  dismiss(): void {
    this.toastManager.dismiss(this.toast);
  }
}

interface ToastContext {
  header: string;
  description: string;
}
