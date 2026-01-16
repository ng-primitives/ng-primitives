import { Component, inject } from '@angular/core';
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
  imports: [],
  template: `
    <div class="container">
      <h2>Sequential Toast Example</h2>
      <p>Click the button to show multiple toasts. Notice how only the front toast's timer runs.</p>
      <button class="toast-trigger" (click)="showMultipleToasts()" ngpButton>Show 3 Toasts</button>
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
      height: fit-content;
    }

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

  showMultipleToasts(): void {
    // Show 3 toasts with a small delay between each
    // Each toast has sequential mode enabled
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.toastManager.show(ToastContent, {
          placement: 'bottom-end',
          sequential: true,
        });
      }, i * 300);
    }
  }
}

@Component({
  selector: 'app-toast-content',
  template: `
    <div ngpToast animate.enter="toast-enter" animate.leave="toast-leave">
      <p class="toast-title">Sequential Toast</p>
      <p class="toast-description">In sequential mode, only the front toast's timer runs.</p>
    </div>
  `,
  styles: `
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
      grid-template-columns: 1fr;
      grid-template-rows: min-content min-content;
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
class ToastContent {}
