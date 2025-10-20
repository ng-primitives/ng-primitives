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
        #emailInput
        class="h-9 flex-1 min-w-0 rounded-lg border-none bg-white px-4 text-gray-900 shadow-sm outline-none ring-1 ring-black/10 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-zinc-900 dark:text-gray-100 dark:placeholder:text-gray-500"
        ngpInput
        type="email"
        placeholder="Enter your email address"
      />
      <button
        class="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-medium text-gray-900 shadow ring-1 ring-black/5 transition-colors duration-300 ease-in-out data-[hover]:bg-gray-50 data-[press]:bg-gray-100 data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-blue-500 dark:bg-transparent dark:text-gray-100 dark:shadow dark:ring-white/10 dark:data-[hover]:bg-black dark:data-[press]:bg-black"
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
        class="animate-in fade-in scale-in absolute flex max-w-[280px] flex-col gap-1 rounded-xl border border-gray-200 bg-white p-3 shadow-lg outline-none dark:border-zinc-800 dark:bg-black"
        ngpPopover
      >
        <h3 class="m-0 text-[13px] font-medium text-gray-900 dark:text-gray-100">Email Format</h3>
        <p class="m-0 text-[13px] text-gray-600 dark:text-gray-400">
          Please enter a valid email address in the format: name&#64;domain.com
        </p>
        <p class="m-0 text-[13px] text-gray-600 dark:text-gray-400">
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
            class="block h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-gray-950 dark:border-t-white"
          ></span>
          <span
            class="-mt-[6px] block h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-white dark:border-t-gray-950"
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
