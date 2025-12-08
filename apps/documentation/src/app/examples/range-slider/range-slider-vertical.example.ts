import { Component, signal } from '@angular/core';
import { NgpRangeSlider, NgpRangeSliderThumb, NgpRangeSliderTrack } from 'ng-primitives/slider';

@Component({
  selector: 'app-range-slider-vertical',
  imports: [NgpRangeSlider, NgpRangeSlider, NgpRangeSliderThumb, NgpRangeSliderTrack],
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

    [ngpRangeSlider] {
      position: absolute;
      width: 100%;
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
      transform: translateY(-50%);
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
      ngpRangeSliderOrientation="vertical"
    >
      <div ngpRangeSliderTrack>
        <div ngpRangeSlider></div>
      </div>
      <div ngpRangeSliderThumb></div>
      <div ngpRangeSliderThumb></div>
    </div>
  `,
})
export default class RangeSliderVerticalExample {
  low = signal(25);
  high = signal(75);
}
