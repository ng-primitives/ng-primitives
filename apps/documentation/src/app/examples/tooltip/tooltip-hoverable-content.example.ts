import { Component, ViewEncapsulation } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpTooltip, NgpTooltipArrow, NgpTooltipTrigger } from 'ng-primitives/tooltip';

@Component({
  selector: 'app-tooltip-hoverable-content',
  imports: [NgpTooltipTrigger, NgpTooltip, NgpTooltipArrow, NgpButton],
  template: `
    <div class="examples">
      <button [ngpTooltipTrigger]="defaultTooltip" ngpButton type="button">Default (Close on Leave)</button>

      <button
        [ngpTooltipTrigger]="hoverableTooltip"
        ngpTooltipTriggerHoverableContent="true"
        ngpTooltipTriggerOffset="12"
        ngpButton
        type="button"
      >
        Hoverable Content Enabled
      </button>
    </div>

    <ng-template #defaultTooltip>
      <div ngpTooltip>
        This tooltip closes when pointer leaves the trigger.
        <div ngpTooltipArrow></div>
      </div>
    </ng-template>

    <ng-template #hoverableTooltip>
      <div ngpTooltip>
        Move your pointer from the trigger into this tooltip; it stays open while hovered.
        <div ngpTooltipArrow></div>
      </div>
    </ng-template>
  `,
  styles: `
    app-tooltip-hoverable-content {
      .examples {
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;
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
      max-width: 18rem;
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
export default class TooltipHoverableContentExample {}
