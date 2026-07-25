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
    <button
      class="h-[2.125rem] rounded-lg border-none bg-white px-3.5 font-[510] text-gray-900 shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05)] transition-colors duration-300 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-gray-50 data-press:bg-gray-100 dark:bg-zinc-950 dark:text-gray-100 dark:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05)] dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
      (click)="showMultipleToasts(toast)"
      ngpButton
    >
      Show 3 Toasts
    </button>

    <ng-template #toast let-dismiss="dismiss">
      <div
        class="absolute inline-grid h-fit w-[350px] touch-none grid-cols-[1fr_auto] grid-rows-[min-content_min-content] items-center gap-1.5 gap-x-3 rounded-lg border border-black/10 bg-white px-4 py-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-950"
        ngpToast
        animate.enter="toast-enter"
        animate.leave="toast-leave"
      >
        <p
          class="toast-title col-start-1 col-end-2 row-start-1 m-0 text-xs/4! font-[590] text-gray-900 select-none dark:text-gray-100"
        >
          Sequential Toast
        </p>
        <p
          class="toast-description col-start-1 col-end-2 row-start-2 m-0 text-xs/4! text-gray-600 select-none dark:text-gray-300"
        >
          Only front toast timer runs in sequential mode.
        </p>
        <button
          class="col-start-2 col-end-3 row-start-1 row-end-3 max-h-[27px] cursor-pointer rounded-lg border-none bg-[#f01e2b] px-2 py-1 text-xs font-[590] text-white dark:bg-[#ff4651]"
          (click)="dismiss()"
          ngpButton
        >
          Dismiss
        </button>
      </div>
    </ng-template>
  `,
  styles: `
    [ngpToast] {
      opacity: 0;
      z-index: var(--ngp-toast-z-index);
      transform: var(--y);
      transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
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
