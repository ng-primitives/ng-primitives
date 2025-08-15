import { Component } from '@angular/core';
import {
  NgpRangeSlider,
  NgpSliderRange,
  NgpSliderThumb,
  NgpSliderTrack,
} from 'ng-primitives/range-slider';

@Component({
  selector: 'app-range-slider',
  imports: [NgpRangeSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack],
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
      z-index: 1;
    }

    [ngpSliderThumb][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 0;
    }

    [ngpSliderThumb][data-thumb='high'] {
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
      <div ngpSliderTrack>
        <div ngpSliderRange></div>
      </div>
      <div ngpSliderThumb ngpSliderThumbType="low"></div>
      <div ngpSliderThumb ngpSliderThumbType="high"></div>
    </div>
  `,
})
export default class RangeSliderExample {
  low = 25;
  high = 75;
}
