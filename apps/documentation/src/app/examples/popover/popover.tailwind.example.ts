import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpPopover, NgpPopoverArrow, NgpPopoverTrigger } from 'ng-primitives/popover';

@Component({
  selector: 'app-popover-tailwind',
  imports: [NgpPopoverTrigger, NgpPopover, NgpPopoverArrow, NgpButton],
  template: `
    <button
      class="h-[2.125rem] rounded-lg bg-white px-3.5 font-[500] text-zinc-900 shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05)] transition-colors duration-300 ease-in-out data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05)] dark:data-hover:bg-black dark:data-press:bg-black"
      [ngpPopoverTrigger]="popover"
      ngpButton
      type="button"
    >
      Popover
    </button>

    <ng-template #popover>
      <div
        class="animate-in fade-in scale-in absolute flex max-w-[280px] flex-col gap-1 rounded-xl border border-gray-200 bg-white p-3 shadow-lg outline-hidden dark:border-zinc-800 dark:bg-zinc-950"
        ngpPopover
      >
        <h3 class="m-0 text-[13px] font-medium text-zinc-900 dark:text-zinc-100">Need Help?</h3>
        <p class="m-0 text-[13px] text-zinc-600 dark:text-zinc-400">
          Get quick tips and guidance on how to use this feature effectively. Check out our
          documentation for more details!
        </p>
        <a
          class="text-[13px] text-[#f01e2b] no-underline dark:text-[#ff4651]"
          target="_blank"
          href="https://www.youtube.com/watch?v=xvFZjo5PgG0"
        >
          Learn More
        </a>
        <div
          class="pointer-events-none absolute -top-[0.3rem] left-1/2 z-10 -translate-x-1/2"
          ngpPopoverArrow
        >
          <span
            class="block h-0 w-0 border-x-[6px] border-b-[6px] border-x-transparent border-b-zinc-950 dark:border-b-white"
          ></span>
          <span
            class="-mt-[6px] block h-0 w-0 border-x-[6px] border-b-[6px] border-x-transparent border-b-white dark:border-b-zinc-950"
          ></span>
        </div>
      </div>
    </ng-template>
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
export default class PopoverTailwindExample {}
