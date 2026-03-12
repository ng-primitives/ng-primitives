import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';

@Component({
  selector: 'app-popover-controlled-tailwind',
  imports: [NgpPopoverTrigger, NgpPopover, NgpButton],
  template: `
    <div class="flex flex-col items-center gap-3">
      <div class="flex gap-2">
        <button
          class="h-10 rounded-lg bg-white px-4 font-medium text-gray-900 shadow-sm ring-1 ring-black/5 transition-colors data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-gray-50 data-press:bg-gray-100 dark:bg-transparent dark:text-gray-100 dark:ring-white/10 dark:data-hover:bg-black dark:data-press:bg-black"
          (click)="open.set(true)"
          ngpButton
          type="button"
        >
          Open
        </button>
        <button
          class="h-10 rounded-lg bg-white px-4 font-medium text-gray-900 shadow-sm ring-1 ring-black/5 transition-colors data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-gray-50 data-press:bg-gray-100 dark:bg-transparent dark:text-gray-100 dark:ring-white/10 dark:data-hover:bg-black dark:data-press:bg-black"
          (click)="open.set(false)"
          ngpButton
          type="button"
        >
          Close
        </button>
      </div>

      <button
        class="h-10 rounded-lg bg-white px-4 font-medium text-gray-900 shadow-sm ring-1 ring-black/5 transition-colors data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-gray-50 data-press:bg-gray-100 dark:bg-transparent dark:text-gray-100 dark:ring-white/10 dark:data-hover:bg-black dark:data-press:bg-black"
        [ngpPopoverTrigger]="popover"
        [ngpPopoverTriggerOpen]="open()"
        (ngpPopoverTriggerOpenChange)="open.set($event)"
        ngpButton
        type="button"
      >
        Controlled Popover
      </button>

      <ng-template #popover>
        <div
          class="animate-in fade-in scale-in absolute flex max-w-[280px] flex-col gap-1 rounded-xl border border-gray-200 bg-white p-3 shadow-lg outline-hidden dark:border-zinc-800 dark:bg-black"
          ngpPopover
        >
          <h3 class="m-0 text-[13px] font-medium text-gray-900 dark:text-gray-100">Controlled</h3>
          <p class="m-0 text-[13px] text-gray-600 dark:text-gray-400">
            This popover's open state is managed externally via the
            <code class="rounded bg-gray-100 px-1 text-xs dark:bg-zinc-800">open</code>
            input.
          </p>
        </div>
      </ng-template>
    </div>
  `,
  styles: `
    @keyframes fade-in {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
    @keyframes scale-in {
      0% {
        transform: scale(0.9);
      }
      100% {
        transform: scale(1);
      }
    }
    .animate-in {
      animation:
        fade-in 0.1s ease-out,
        scale-in 0.1s ease-out;
    }
  `,
})
export default class PopoverControlledTailwindExample {
  readonly open = signal<boolean | undefined>(false);
}
