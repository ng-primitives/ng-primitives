import { Component } from '@angular/core';
import { NgpTooltip, NgpTooltipTrigger } from '@ng-primitives/ng-primitives/tooltip';

@Component({
  standalone: true,
  selector: 'app-tooltip',
  imports: [NgpTooltipTrigger, NgpTooltip],
  template: `
    <button
      class="h-10 rounded-lg bg-white px-4 font-medium text-neutral-950 shadow outline-none ring-1 ring-black/5 transition-all hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100 active:bg-neutral-100"
      [ngpTooltipTrigger]="tooltip"
      type="button"
    >
      Tooltip
    </button>

    <ng-template #tooltip>
      <div
        class="absolute max-w-64 rounded-lg bg-neutral-950 px-3 py-2 text-xs font-medium text-white"
        ngpTooltip
      >
        Hover over items to reveal additional context or details. Tooltips provide quick insights
        without cluttering your screen.
      </div>
    </ng-template>
  `,
})
export default class TooltipExample {}
