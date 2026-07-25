import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpInput } from 'ng-primitives/input';
import { NgpPopover, NgpPopoverArrow, NgpPopoverTrigger } from 'ng-primitives/popover';

@Component({
  selector: 'app-popover-anchor-tailwind',
  imports: [NgpPopoverTrigger, NgpPopover, NgpPopoverArrow, NgpButton, NgpInput],
  template: `
    <div class="flex w-full items-center gap-2">
      <input
        class="h-[2.125rem] min-w-0 flex-1 rounded-lg border-none bg-white px-4 text-[0.875rem] tracking-[-0.006em] text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.1)] outline-hidden placeholder:text-zinc-400 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[0_1px_2px_rgba(255,255,255,0.007),0_0_0_1px_rgba(255,255,255,0.1)]"
        #emailInput
        ngpInput
        type="email"
        placeholder="Enter your email address"
      />
      <button
        class="flex size-[2.125rem] items-center justify-center rounded-full bg-white p-0 text-[0.875rem] font-[500] text-zinc-900 shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05)] transition-colors duration-300 ease-in-out data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05)] dark:data-hover:bg-black dark:data-press:bg-black"
        [ngpPopoverTrigger]="popover"
        [ngpPopoverTriggerAnchor]="emailInput"
        ngpPopoverTriggerPlacement="bottom"
        ngpButton
        type="button"
        aria-label="Email format help"
      >
        ?
      </button>
    </div>

    <ng-template #popover>
      <div
        class="animate-in fade-in scale-in absolute flex max-w-[280px] flex-col gap-1 rounded-xl border border-gray-200 bg-white p-3 shadow-lg outline-hidden dark:border-zinc-800 dark:bg-zinc-950"
        ngpPopover
      >
        <h3 class="m-0 text-[13px] font-medium text-zinc-900 dark:text-zinc-100">Email Format</h3>
        <p class="m-0 text-[13px] text-zinc-600 dark:text-zinc-400">
          Please enter a valid email address in the format: name&#64;domain.com
        </p>
        <p class="m-0 text-[13px] text-zinc-600 dark:text-zinc-400">
          Examples:
          <br />
          • john.doe&#64;company.com
          <br />
          • user123&#64;example.org
          <br />
          • contact&#64;website.co.uk
        </p>
        <div
          class="pointer-events-none absolute -bottom-[0.3rem] left-1/2 z-10 -translate-x-1/2"
          ngpPopoverArrow
        >
          <span
            class="block h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-zinc-950 dark:border-t-white"
          ></span>
          <span
            class="-mt-[6px] block h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-white dark:border-t-zinc-950"
          ></span>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: contents;
    }

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
export default class PopoverAnchorTailwindExample {}
