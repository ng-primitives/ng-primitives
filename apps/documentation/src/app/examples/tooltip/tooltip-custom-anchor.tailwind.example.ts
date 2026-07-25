import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroInformationCircle } from '@ng-icons/heroicons/outline';
import { NgpTooltip, NgpTooltipArrow, NgpTooltipTrigger } from 'ng-primitives/tooltip';

@Component({
  selector: 'app-tooltip-custom-anchor',
  imports: [NgpTooltipTrigger, NgpTooltip, NgpTooltipArrow, NgIcon],
  viewProviders: [provideIcons({ heroInformationCircle })],
  template: `
    <span
      class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-zinc-900 shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05)] data-open:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05)] dark:data-open:bg-zinc-900"
      [ngpTooltipTrigger]="tooltip"
      [ngpTooltipTriggerAnchor]="infoIcon"
      ngpTooltipTriggerPlacement="bottom-end"
      ngpTooltipTriggerOffset="12"
    >
      Custom Anchor
      <span class="grid h-5 w-5 place-items-center" #infoIcon>
        <ng-icon #icon name="heroInformationCircle" size="20" />
      </span>
    </span>

    <ng-template #tooltip>
      <div
        class="absolute max-w-64 rounded-lg border-none bg-black px-3 py-2 text-xs font-[510] text-white dark:bg-white dark:text-black"
        ngpTooltip
      >
        The tooltip is anchored to the info icon, but the entire pill acts as the trigger.
        <div
          class="pointer-events-none absolute h-2 w-2 rotate-45 rounded-[2px] bg-black data-[placement^=bottom]:bottom-[calc(100%-5px)] data-[placement^=top]:top-[calc(100%-5px)] dark:bg-white"
          ngpTooltipArrow
          ngpTooltipArrowPadding="12"
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
})
export default class TooltipCustomAnchorExample {}
