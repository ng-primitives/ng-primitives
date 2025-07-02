import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpTooltip, NgpTooltipArrow, NgpTooltipTrigger } from 'ng-primitives/tooltip';

@Component({
  selector: 'app-tooltip',
  imports: [NgpTooltipTrigger, NgpTooltip, NgpTooltipArrow, NgpButton],
  template: `
    <button [ngpTooltipTrigger]="tooltip" ngpButton type="button">Tooltip</button>

    <ng-template #tooltip>
      <div ngpTooltip>
        Hover over items to reveal additional context or details. Tooltips provide quick insights
        without cluttering your screen.

        <div ngpTooltipArrow></div>
      </div>
    </ng-template>
  `,
  styles: `
    button {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: var(--ngp-text-primary);
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: var(--ngp-background);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--ngp-button-shadow);
    }

    button[data-hover] {
      background-color: var(--ngp-background-hover);
    }

    button[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }

    button[data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpTooltip] {
      position: absolute;
      max-width: 16rem;
      border-radius: 0.5rem;
      background-color: var(--ngp-background-inverse);
      padding: 0.5rem 0.75rem;
      border: none;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--ngp-text-inverse);
      animation: tooltip-show 200ms ease-in-out;
      transform-origin: var(--ngp-tooltip-transform-origin);
    }

    [ngpTooltip][data-exit] {
      animation: tooltip-hide 200ms ease-in-out;
    }

    [ngpTooltipArrow] {
      position: absolute;
      pointer-events: none;
      background-color: var(--ngp-background-inverse);
      width: 8px;
      height: 8px;
      top: calc(100% - 5px);
      transform: rotate(45deg);
      border-radius: 2px;
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
export default class TooltipExample {}
