import { Component, ViewEncapsulation } from '@angular/core';
import { NgpSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack } from 'ng-primitives/slider';
import { NgpTooltip, NgpTooltipTrigger } from 'ng-primitives/tooltip';

@Component({
  selector: 'app-slider-tooltip',
  imports: [
    NgpSlider,
    NgpSliderRange,
    NgpSliderThumb,
    NgpSliderTrack,
    NgpTooltipTrigger,
    NgpTooltip,
  ],
  styles: `
    app-slider-tooltip {
      display: block;
    }

    [ngpSlider] {
      display: flex;
      position: relative;
      width: 200px;
      height: 20px;
      touch-action: none;
      user-select: none;
      align-items: center;
    }

    [ngpSliderTrack] {
      position: relative;
      height: 5px;
      width: 100%;
      border-radius: 999px;
      background-color: var(--ngp-background-secondary);
    }

    [ngpSliderRange] {
      position: absolute;
      height: 100%;
      border-radius: 999px;
      background-color: var(--ngp-background-inverse);
    }

    [ngpSliderThumb] {
      position: absolute;
      display: block;
      height: 20px;
      width: 20px;
      border-radius: 10px;
      background-color: white;
      box-shadow: var(--ngp-button-shadow);
      outline: none;
      transform: translateX(-50%);
    }

    [ngpSliderThumb][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 0;
    }

    [ngpTooltip] {
      position: absolute;
      border-radius: 0.25rem;
      background-color: var(--ngp-background-inverse);
      padding: 0.25rem 0.5rem;
      border: none;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--ngp-text-inverse);
      white-space: nowrap;
    }
  `,
  template: `
    <div [(ngpSliderValue)]="value" ngpSlider>
      <div ngpSliderTrack>
        <div ngpSliderRange></div>
      </div>
      <div
        #tooltipTrigger="ngpTooltipTrigger"
        [ngpTooltipTrigger]="tooltip"
        (ngpSliderThumbDragStart)="tooltipTrigger.show()"
        (ngpSliderThumbDragEnd)="tooltipTrigger.hide()"
        ngpTooltipTriggerPlacement="top"
        ngpTooltipTriggerHideDelay="200"
        ngpTooltipTriggerTrackPosition="true"
        ngpTooltipTriggerDisabled="true"
        ngpSliderThumb
      ></div>
    </div>

    <ng-template #tooltip>
      <div ngpTooltip>{{ value }}</div>
    </ng-template>
  `,
  encapsulation: ViewEncapsulation.None,
})
export default class SliderTooltipExample {
  value = 50;
}
