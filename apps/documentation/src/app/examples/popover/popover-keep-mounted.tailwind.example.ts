import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';

@Component({
  selector: 'app-popover-keep-mounted-tailwind',
  imports: [NgpPopoverTrigger, NgpPopover, NgpButton],
  template: `
    <p class="mb-3 text-center text-[13px] tracking-[-0.011em] text-gray-500 dark:text-gray-400">
      Type a note, close the popover, then open it again.
    </p>

    <div class="flex justify-center gap-2">
      <button
        class="h-[2.125rem] rounded-lg bg-white px-3.5 font-[510] tracking-[-0.006em] text-gray-900 shadow-sm ring-1 ring-black/5 transition-colors duration-150 ease-in-out outline-none data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-hover:bg-gray-50 data-press:bg-gray-100 dark:bg-transparent dark:text-gray-100 dark:ring-white/10 dark:data-focus-visible:ring-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
        [ngpPopoverTrigger]="defaultPopover"
        ngpButton
        type="button"
      >
        Default
      </button>

      <button
        class="h-[2.125rem] rounded-lg bg-white px-3.5 font-[510] tracking-[-0.006em] text-gray-900 shadow-sm ring-1 ring-black/5 transition-colors duration-150 ease-in-out outline-none data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-hover:bg-gray-50 data-press:bg-gray-100 dark:bg-transparent dark:text-gray-100 dark:ring-white/10 dark:data-focus-visible:ring-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
        [ngpPopoverTrigger]="keptPopover"
        ngpButton
        ngpPopoverTriggerKeepMounted
        type="button"
      >
        Keep mounted
      </button>
    </div>

    <ng-template #defaultPopover>
      <div
        class="animate-in absolute flex w-[260px] flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-lg outline-hidden dark:border-zinc-800 dark:bg-zinc-950"
        ngpPopover
      >
        <h3 class="m-0 text-[13px] font-[590] tracking-[-0.014em] text-gray-900 dark:text-gray-100">
          Default
        </h3>
        <textarea
          class="resize-none rounded-lg border border-gray-200 bg-white p-2 text-[13px] tracking-[-0.006em] text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          rows="2"
          placeholder="Discarded on close..."
        ></textarea>
        <p class="m-0 text-[12px] tracking-[-0.011em] text-gray-500 dark:text-gray-400">
          Starts empty every time.
        </p>
      </div>
    </ng-template>

    <ng-template #keptPopover>
      <div
        class="animate-in absolute flex w-[260px] flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-lg outline-hidden dark:border-zinc-800 dark:bg-zinc-950"
        ngpPopover
      >
        <h3 class="m-0 text-[13px] font-[590] tracking-[-0.014em] text-gray-900 dark:text-gray-100">
          Kept mounted
        </h3>
        <textarea
          class="resize-none rounded-lg border border-gray-200 bg-white p-2 text-[13px] tracking-[-0.006em] text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          rows="2"
          placeholder="Still here on reopen..."
        ></textarea>
        <p class="m-0 text-[12px] tracking-[-0.011em] text-gray-500 dark:text-gray-400">
          Whatever you typed is still here.
        </p>
      </div>
    </ng-template>
  `,
  styles: `
    @keyframes popover-show {
      0% {
        opacity: 0;
        transform: scale(0.96);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes popover-hide {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(0.96);
      }
    }

    [ngpPopover] {
      transform-origin: var(--ngp-popover-transform-origin);
    }

    .animate-in {
      animation: popover-show 0.15s ease-out;
    }

    [ngpPopover][data-exit] {
      animation: popover-hide 0.15s ease-out;
    }
  `,
})
export default class PopoverKeepMountedTailwindExample {}
