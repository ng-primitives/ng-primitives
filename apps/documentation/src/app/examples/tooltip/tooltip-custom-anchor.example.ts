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
      class="pill"
      [ngpTooltipTrigger]="tooltip"
      [ngpTooltipTriggerAnchor]="infoIcon"
      ngpTooltipTriggerPlacement="bottom-end"
      ngpTooltipTriggerOffset="12"
    >
      Custom Anchor
      <span class="info-icon" #infoIcon>
        <ng-icon #icon name="heroInformationCircle" size="20" />
      </span>
    </span>

    <ng-template #tooltip>
      <div ngpTooltip>
        The tooltip is anchored to the info icon, but the entire pill acts as the trigger.
        <div ngpTooltipArrow ngpTooltipArrowPadding="12"></div>
      </div>
    </ng-template>
  `,
  styles: `
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      color: var(--ngp-text-primary);
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-button-shadow);
    }

    .pill[data-open] {
      background-color: var(--ngp-background-hover);
    }

    .info-icon {
      height: 20px;
      width: 20px;
      display: grid;
      place-items: center;
    }

    [ngpTooltip] {
      position: absolute;
      max-width: 16rem;
      border-radius: 0.5rem;
      background-color: var(--ngp-background-inverse);
      padding: 0.5rem 0.75rem;
      border: none;
      font-size: 0.75rem;
      font-weight: 510;
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

    [ngpTooltipArrow][data-placement^='top'] {
      top: calc(100% - 5px);
    }

    [ngpTooltipArrow][data-placement^='bottom'] {
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
})
export default class TooltipCustomAnchorExample {}
