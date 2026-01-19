import { Component, signal } from '@angular/core';
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

    /* Increase the click area of the track without changing its visual size */
    [ngpRangeSliderTrack]::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 20px;
      transform: translateY(-50%);
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
      [ngpRangeSliderLow]="low()"
      [ngpRangeSliderHigh]="high()"
      (ngpRangeSliderLowChange)="low.set($event)"
      (ngpRangeSliderHighChange)="high.set($event)"
      ngpRangeSlider
    >
      <div ngpRangeSliderTrack>
        <div ngpRangeSliderRange></div>
      </div>
      <div ngpRangeSliderThumb></div>
      <div ngpRangeSliderThumb></div>
    </div>
  `,
})
export default class RangeSliderExample {
  low = signal(25);
  high = signal(75);
}
