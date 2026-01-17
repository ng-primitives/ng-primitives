import { Component, inject, TemplateRef } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpToastManager, NgpToast } from 'ng-primitives/toast';

/**
 * This example demonstrates the sequential toast feature.
 * When sequential mode is enabled, only the front-most toast's timer runs.
 * When that toast is dismissed, the timer starts on the next toast.
 *
 * To enable sequential mode globally:
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideToastConfig({
 *       sequential: true,
 *     }),
 *   ],
 * });
 */
@Component({
  selector: 'app-toast-sequential',
  imports: [NgpToast, NgpButton],
  template: `
    <div class="container">
      <h2>Sequential Toast Example</h2>
      <p>Click the button to show multiple toasts. Notice how only the front toast's timer runs.</p>
      <button class="toast-trigger" (click)="showMultipleToasts(toast)" ngpButton>Show 3 Toasts</button>

      <ng-template #toast let-dismiss="dismiss">
        <div ngpToast animate.enter="toast-enter" animate.leave="toast-leave">
          <p class="toast-title">Sequential Toast</p>
          <p class="toast-description">Only front toast timer runs in sequential mode.</p>
          <button class="toast-dismiss" (click)="dismiss()" ngpButton>Dismiss</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: `
    .container {
      padding: 2rem;
    }

    h2 {
      margin-top: 0;
      margin-bottom: 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
    }

    p {
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
      color: var(--ngp-text-secondary);
    }

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

    [ngpToast] {
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

    [ngpToast][data-position-x='end'] {
      right: 0;
    }

    [ngpToast][data-position-x='start'] {
      left: 0;
    }

    [ngpToast][data-position-y='top'] {
      top: 0;
      --lift: 1;
      --lift-amount: calc(var(--lift) * var(--ngp-toast-gap));
      --y: translateY(-100%);
    }

    [ngpToast][data-position-y='bottom'] {
      bottom: 0;
      --lift: -1;
      --lift-amount: calc(var(--lift) * var(--ngp-toast-gap));
      --y: translateY(100%);
    }

    [ngpToast][data-enter] {
      opacity: 1;
      --y: translateY(0);
    }

    [ngpToast][data-exit] {
      opacity: 0;
      --y: translateY(calc(calc(var(--lift) * var(--ngp-toast-gap)) * -1));
    }

    [ngpToast][data-visible='false'] {
      opacity: 0;
      pointer-events: none;
    }

    [ngpToast][data-expanded='true']::after {
      content: '';
      position: absolute;
      left: 0;
      height: calc(var(--ngp-toast-gap) + 1px);
      bottom: 100%;
      width: 100%;
    }

    [ngpToast][data-expanded='false'][data-front='false'] {
      --scale: var(--ngp-toasts-before) * 0.05 + 1;
      --y: translateY(calc(var(--lift-amount) * var(--ngp-toasts-before)))
        scale(calc(-1 * var(--scale)));
      height: var(--ngp-toast-front-height);
    }

    [ngpToast][data-expanded='true'] {
      --y: translateY(calc(var(--lift) * var(--ngp-toast-offset)));
      height: auto;
    }

    [ngpToast][data-swiping='true'] {
      transform: var(--y) translateY(var(--ngp-toast-swipe-amount-y, 0))
        translateX(var(--ngp-toast-swipe-amount-x, 0));
      transition: none;
    }

    [ngpToast][data-swiping='true'][data-swipe-direction='left'] {
      /* Fade out from -45px to -100px swipe */
      opacity: calc(1 - clamp(0, ((-1 * var(--ngp-toast-swipe-x, 0px)) - 45) / 55, 1));
    }

    [ngpToast][data-swiping='true'][data-swipe-direction='right'] {
      /* Fade out from 45px to 100px swipe */
      opacity: calc(1 - clamp(0, (var(--ngp-toast-swipe-x, 0px) - 45) / 55, 1));
    }

    [ngpToast][data-swiping='true'][data-swipe-direction='top'] {
      /* Fade out from -45px to -100px swipe */
      opacity: calc(1 - clamp(0, ((-1 * var(--ngp-toast-swipe-y, 0px)) - 45) / 55, 1));
    }

    [ngpToast][data-swiping='true'][data-swipe-direction='bottom'] {
      /* Fade out from 45px to 100px swipe */
      opacity: calc(1 - clamp(0, (var(--ngp-toast-swipe-y, 0px) - 45) / 55, 1));
    }

    /* Truncate text only when toast is not front AND not expanded */
    [ngpToast][data-front='false'][data-expanded='false'] .toast-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    [ngpToast][data-front='false'][data-expanded='false'] .toast-description {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Angular animations using animate.enter and animate.leave */
    .toast-enter {
      animation: toast-slide-in 400ms cubic-bezier(0.215, 0.61, 0.355, 1);
    }

    .toast-leave {
      opacity: 0;
      transform: translateY(100%);
      transition:
        opacity 400ms cubic-bezier(0.215, 0.61, 0.355, 1),
        transform 400ms cubic-bezier(0.215, 0.61, 0.355, 1);
    }

    @keyframes toast-slide-in {
      from {
        opacity: 0;
        transform: translateY(100%);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
})
export default class ToastSequentialExample {
  private readonly toastManager = inject(NgpToastManager);

  showMultipleToasts(toast: TemplateRef<void>): void {
    // Show 3 toasts with a small delay between each
    // Each toast has sequential mode enabled
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.toastManager.show(toast, {
          placement: 'bottom-end',
          sequential: true,
        });
      }, i * 300);
    }
  }
}
