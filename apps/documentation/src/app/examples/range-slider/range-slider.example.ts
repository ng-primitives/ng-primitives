import { Component } from '@angular/core';
import {
  NgpRangeSlider,
  NgpRangeSliderRange,
  NgpRangeSliderThumb,
  NgpRangeSliderTrack,
} from 'ng-primitives/slider';

@Component({
  selector: 'app-range-slider',
  imports: [NgpRangeSlider, NgpRangeSliderRange, NgpRangeSliderThumb, NgpRangeSliderTrack],
  styles: `
    [ngpRangeSlider] {
      display: flex;
      position: relative;
      width: 200px;
      height: 20px;
      touch-action: none;
      user-select: none;
      align-items: center;
    }

    [ngpRangeSliderTrack] {
      position: relative;
      height: 5px;
      width: 100%;
      border-radius: 999px;
      background-color: var(--ngp-background-secondary);
    }

    [ngpRangeSliderRange] {
      position: absolute;
      height: 100%;
      border-radius: 999px;
      background-color: var(--ngp-background-inverse);
    }

    [ngpRangeSliderThumb] {
      position: absolute;
      display: block;
      height: 20px;
      width: 20px;
      border-radius: 10px;
      background-color: white;
      box-shadow: var(--ngp-button-shadow);
      outline: none;
      transform: translateX(-50%);
      z-index: 1;
    }

    [ngpRangeSliderThumb][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 0;
    }

    [ngpRangeSliderThumb][data-thumb='high'] {
      z-index: 2;
    }
  `,
  template: `
    <div
      [ngpRangeSliderLow]="low"
      [ngpRangeSliderHigh]="high"
      (ngpRangeSliderLowChange)="low = $event"
      (ngpRangeSliderHighChange)="high = $event"
      ngpRangeSlider
    >
      <div ngpRangeSliderTrack>
        <div ngpRangeSliderRange></div>
      </div>
      <div ngpRangeSliderThumb ngpRangeSliderThumbType="low"></div>
      <div ngpRangeSliderThumb ngpRangeSliderThumbType="high"></div>
    </div>
  `,
})
export default class RangeSliderExample {
  low = 25;
  high = 75;
}
