import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpTooltip, NgpTooltipTrigger } from 'ng-primitives/tooltip';

@Component({
  standalone: true,
  selector: 'app-tooltip',
  imports: [NgpTooltipTrigger, NgpTooltip, NgpButton],
  template: `
    <button [ngpTooltipTrigger]="tooltip" ngpButton type="button">Tooltip</button>

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
  styles: `
    button {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: rgb(10 10 10);
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: #fff;
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
    }

    button[data-hover='true'] {
      background-color: rgb(250 250 250);
    }

    button[data-focus-visible='true'] {
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05),
        0 0 0 2px #f5f5f5,
        0 0 0 4px rgb(59 130 246);
    }

    button[data-press='true'] {
      background-color: rgb(245 245 245);
    }

    [ngpTooltip] {
      position: absolute;
      max-width: 16rem;
      border-radius: 0.5rem;
      background-color: rgb(10 10 10);
      padding: 0.5rem 0.75rem;
      border: none;
      font-size: 0.75rem;
      font-weight: 500;
      color: white;
    }
  `,
})
export default class TooltipExample {}
