import { Component, effect, signal } from '@angular/core';
import {
  NgpRangeSlider,
  NgpSliderRange,
  NgpSliderThumb,
  NgpSliderTrack,
} from 'ng-primitives/range-slider';

@Component({
  selector: 'app-range-slider-vertical',
  imports: [NgpRangeSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack],
  styles: `
    [ngpRangeSlider] {
      display: flex;
      position: relative;
      width: 20px;
      height: 200px;
      touch-action: none;
      user-select: none;
      justify-content: center;
    }

    [ngpSliderTrack] {
      position: relative;
      width: 5px;
      height: 100%;
      border-radius: 999px;
      background-color: var(--ngp-background-secondary);
    }

    [ngpSliderRange] {
      position: absolute;
      width: 100%;
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
      transform: translateY(-50%);
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
      [ngpRangeSliderLow]="low()"
      [ngpRangeSliderHigh]="high()"
      (ngpRangeSliderLowChange)="low.set($event)"
      (ngpRangeSliderHighChange)="high.set($event)"
      ngpRangeSlider
      ngpRangeSliderOrientation="vertical"
    >
      <div ngpSliderTrack>
        <div ngpSliderRange></div>
      </div>
      <div ngpSliderThumb ngpSliderThumbType="low"></div>
      <div ngpSliderThumb ngpSliderThumbType="high"></div>
    </div>
  `,
})
export default class RangeSliderVerticalExample {
  low = signal(25);
  high = signal(75);

  constructor() {
    effect(() => {
      console.log('low', this.low());
      console.log('high', this.high());
    });
  }
}
