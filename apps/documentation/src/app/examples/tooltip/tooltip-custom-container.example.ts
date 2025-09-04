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
    <div class="tooltip-container"></div>

    <div class="examples">
      <button [ngpTooltipTrigger]="tooltip1" ngpButton type="button">
        Custom Container Tooltip
      </button>

      <button class="ellipsis-text" [ngpTooltipTrigger]="tooltip2">
        This text uses custom container for tooltip rendering
      </button>
    </div>

    <!-- Tooltip templates -->
    <ng-template #tooltip1>
      <div ngpTooltip>
        This tooltip is rendered in a custom container! Check the DOM
        <div ngpTooltipArrow></div>
      </div>
    </ng-template>

    <ng-template #tooltip2>
      <div ngpTooltip>
        String selectors work great for SSR compatibility!
        <div ngpTooltipArrow></div>
      </div>
    </ng-template>
  `,
  styles: `
    app-tooltip-custom-container {
      .tooltip-container {
        position: relative;
      }

      .examples {
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;
        margin: 20px 0;
      }

      .ellipsis-text {
        max-width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 0.875rem;
      }

      .ellipsis-text:hover {
        background-color: var(--ngp-background-hover);
      }

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
      border-radius: 2px;
      transform: rotate(45deg);
    }

    [ngpTooltipArrow][data-placement='top'] {
      top: calc(100% - 5px);
    }

    [ngpTooltipArrow][data-placement='bottom'] {
      bottom: calc(100% - 5px);
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
