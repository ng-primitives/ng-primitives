import { Component } from '@angular/core';
import { Tooltip } from './tooltip';

@Component({
  selector: 'app-tooltip-example',
  imports: [Tooltip],
  template: `
    <button [trigger]="tooltip" app-tooltip>button</button>

    <ng-template #tooltip>
      <div ngpTooltip>
        Hover over items to reveal additional context or details. Tooltips provide quick insights
        without cluttering your screen.
      </div>
    </ng-template>
  `,
})
export default class App {}
