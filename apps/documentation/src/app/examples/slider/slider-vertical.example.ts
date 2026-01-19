import { Component } from '@angular/core';
import { NgpSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack } from 'ng-primitives/slider';

@Component({
  selector: 'app-slider-vertical',
  imports: [NgpSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack],
  styles: `
    [ngpSlider] {
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
      left: 50%;
      transform: translate(-50%, -50%);
    }

    [ngpSliderThumb][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 0;
    }
  `,
  template: `
    <div [(ngpSliderValue)]="value" ngpSlider ngpSliderOrientation="vertical">
      <div ngpSliderTrack>
        <div ngpSliderRange></div>
      </div>
      <div ngpSliderThumb></div>
    </div>
  `,
})
export default class SliderVerticalExample {
  value = 50;
}
