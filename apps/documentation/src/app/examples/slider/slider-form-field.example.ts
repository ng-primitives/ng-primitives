import { Component } from '@angular/core';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack } from 'ng-primitives/slider';

@Component({
  standalone: true,
  selector: 'app-slider-form-field',
  imports: [
    NgpFormField,
    NgpLabel,
    NgpDescription,
    NgpSlider,
    NgpSliderRange,
    NgpSliderThumb,
    NgpSliderTrack,
  ],
  styles: `
    :host {
      display: contents;
    }

    [ngpFormField] {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    [ngpLabel] {
      color: rgb(9 9 11);
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      margin: 0;
    }

    [ngpDescription] {
      color: rgb(113 113 122);
      font-size: 0.75rem;
      line-height: 1rem;
      margin: 0 0 4px;
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
      background-color: rgb(0 0 0 / 20%);
    }

    [ngpSliderRange] {
      position: absolute;
      height: 100%;
      border-radius: 999px;
      background-color: rgb(9 9 11);
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

    [ngpSliderThumb][data-focus-visible='true'] {
      box-shadow:
        0 0 0 1px rgb(0 0 0 / 0.05),
        0 0 0 2px rgb(59 130 246);
    }
  `,
  template: `
    <div ngpFormField>
      <label ngpLabel>Volume</label>
      <p ngpDescription>Adjust the volume of the speaker.</p>

      <div [(ngpSliderValue)]="value" ngpSlider>
        <div ngpSliderTrack>
          <div ngpSliderRange></div>
        </div>
        <div ngpSliderThumb></div>
      </div>
    </div>
  `,
})
export default class SliderFormFieldExample {
  value = 50;
}
