import { Component } from '@angular/core';
import { NgpSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack } from 'ng-primitives/slider';

@Component({
  standalone: true,
  selector: 'app-slider',
  imports: [NgpSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack],
  styles: `
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
      background-color: light-dark(rgb(0 0 0 / 20%), rgb(255 255 255 / 20%));
    }

    [ngpSliderRange] {
      position: absolute;
      height: 100%;
      border-radius: 999px;
      background-color: light-dark(rgb(9 9 11), rgb(255 255 255));
    }

    [ngpSliderThumb] {
      position: absolute;
      display: block;
      height: 20px;
      width: 20px;
      border-radius: 10px;
      background-color: rgb(255 255 255);
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
      outline: none;
      transform: translateX(-50%);
    }

    [ngpSliderThumb][data-focus-visible] {
      box-shadow:
        0 0 0 1px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05)),
        0 0 0 2px rgb(59 130 246);
    }
  `,
  template: `
    <div [(ngpSliderValue)]="value" ngpSlider>
      <div ngpSliderTrack>
        <div ngpSliderRange></div>
      </div>
      <div ngpSliderThumb></div>
    </div>
  `,
})
export default class SliderExample {
  value = 50;
}
