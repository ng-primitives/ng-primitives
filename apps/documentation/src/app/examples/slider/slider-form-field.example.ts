import { Component } from '@angular/core';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack } from 'ng-primitives/slider';

@Component({
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
      color: var(--text-primary);
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      margin: 0;
    }

    [ngpDescription] {
      color: var(--text-secondary);
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
      background-color: var(--background-secondary);
    }

    [ngpSliderRange] {
      position: absolute;
      height: 100%;
      border-radius: 999px;
      background-color: var(--background-inverse);
    }

    [ngpSliderThumb] {
      position: absolute;
      display: block;
      height: 20px;
      width: 20px;
      border-radius: 10px;
      background-color: white;
      box-shadow: var(--button-shadow);
      outline: none;
      transform: translateX(-50%);
    }

    [ngpSliderThumb][data-focus-visible] {
      outline: 2px solid var(--focus-ring);
      outline-offset: 0;
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
