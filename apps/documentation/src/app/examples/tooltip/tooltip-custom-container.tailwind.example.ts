import { Component, ViewEncapsulation } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpTooltip,
  NgpTooltipArrow,
  NgpTooltipTrigger,
  provideTooltipConfig,
} from 'ng-primitives/tooltip';

@Component({
  selector: 'app-tooltip-custom-container',
  imports: [NgpTooltipTrigger, NgpTooltip, NgpTooltipArrow, NgpButton],
  providers: [
    provideTooltipConfig({
      container: '.tooltip-container',
    }),
  ],
  template: `
    <div class="tooltip-container relative"></div>

    <div class="my-5 flex flex-wrap items-center gap-4">
      <button
        class="h-[2.125rem] rounded-lg bg-white px-4 font-[510] text-gray-900 shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05)] transition-colors duration-300 outline-none data-focus-visible:outline-2 data-focus-visible:outline-blue-500 data-hover:bg-gray-50 data-press:bg-gray-100 dark:bg-zinc-950 dark:text-gray-100 dark:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05)] dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
        [ngpTooltipTrigger]="tooltip1"
        ngpButton
        type="button"
      >
        Custom Container Tooltip
      </button>

      <button
        class="h-[2.125rem] max-w-[200px] overflow-hidden rounded-lg bg-white px-4 text-sm font-[510] overflow-ellipsis whitespace-nowrap text-gray-900 shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05)] transition-colors duration-300 outline-none hover:bg-gray-50 data-focus-visible:outline-2 data-focus-visible:outline-blue-500 data-hover:bg-gray-50 data-press:bg-gray-100 dark:bg-zinc-950 dark:text-gray-100 dark:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05)] dark:hover:bg-zinc-900 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
        [ngpTooltipTrigger]="tooltip2"
      >
        This text uses custom container for tooltip rendering
      </button>
    </div>

    <!-- Tooltip templates -->
    <ng-template #tooltip1>
      <div
        class="absolute max-w-64 rounded-lg border-none bg-black px-3 py-2 text-xs font-[510] text-white dark:bg-white dark:text-black"
        ngpTooltip
      >
        This tooltip is rendered in a custom container! Check the DOM
        <div
          class="pointer-events-none absolute h-2 w-2 rotate-45 rounded-[2px] bg-black data-[placement=bottom]:bottom-[calc(100%-5px)] data-[placement=top]:top-[calc(100%-5px)] dark:bg-white"
          ngpTooltipArrow
        ></div>
      </div>
    </ng-template>

    <ng-template #tooltip2>
      <div
        class="absolute max-w-64 rounded-lg border-none bg-black px-3 py-2 text-xs font-[510] text-white dark:bg-white dark:text-black"
        ngpTooltip
      >
        String selectors work great for SSR compatibility!
        <div
          class="pointer-events-none absolute h-2 w-2 rotate-45 rounded-[2px] bg-black data-[placement=bottom]:bottom-[calc(100%-5px)] data-[placement=top]:top-[calc(100%-5px)] dark:bg-white"
          ngpTooltipArrow
        ></div>
      </div>
    </ng-template>
  `,
  styles: `
    [ngpTooltip] {
      animation: tooltip-show 200ms ease-in-out;
      transform-origin: var(--ngp-tooltip-transform-origin);
    }

    [ngpTooltip][data-exit] {
      animation: tooltip-hide 200ms ease-in-out;
    }

    @keyframes tooltip-show {
      0% {
        opacity: 0;
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes tooltip-hide {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(0.9);
      }
    }
  `,
  encapsulation: ViewEncapsulation.None,
})
export default class TooltipCustomContainerExample {}
