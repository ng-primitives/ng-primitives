import { Component } from '@angular/core';
import {
  NgpTooltipDirective,
  NgpTooltipTriggerDirective,
} from '@ng-primitives/ng-primitives/tooltip';

@Component({
  standalone: true,
  selector: 'app-tooltip',
  imports: [NgpTooltipTriggerDirective, NgpTooltipDirective],
  template: `<button
      class="h-10 rounded-lg bg-white px-4 text-sm font-medium text-neutral-950 shadow-md outline-none transition-all hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
      [ngpTooltipTrigger]="tooltip"
      type="button"
    >
      Tooltip
    </button>

    <ng-template #tooltip>
      <div
        class="fixed max-w-64 rounded-lg bg-white px-2 py-1 text-sm text-neutral-950 shadow-md"
        ngpTooltip
      >
        Tooltip content
      </div>
    </ng-template> `,
})
export default class TooltipExample {}
