import { Component } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import {
  injectSliderState,
  NgpSlider,
  NgpSliderRange,
  NgpSliderThumb,
  NgpSliderTrack,
} from 'ng-primitives/slider';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

@Component({
  selector: 'app-slider',
  hostDirectives: [
    {
      directive: NgpSlider,
      inputs: [
        'ngpSliderValue:value',
        'ngpSliderMin:min',
        'ngpSliderMax:max',
        'ngpSliderDisabled:disabled',
      ],
      outputs: ['ngpSliderValueChange:valueChange'],
    },
  ],
  imports: [NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
  viewProviders: [provideValueAccessor(Slider)],
  template: `
    <div ngpSliderTrack>
      <div ngpSliderRange></div>
    </div>
    <div ngpSliderThumb></div>
  `,
  styles: `
    :host {
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
  `,
  host: {
    '(focusout)': 'onTouched?.()',
  },
})
export class Slider implements ControlValueAccessor {
  /** Access the slider state */
  private readonly state = injectSliderState();

  /**
   * The onChange callback function.
   */
  private onChange?: ChangeFn<number>;

  /**
   * The onTouched callback function.
   */
  protected onTouched?: TouchedFn;

  constructor() {
    // Whenever the user interacts with the slider, call the onChange function with the new value.
    this.state().valueChange.subscribe(value => this.onChange?.(value));
  }

  writeValue(value: number): void {
    this.state().value.set(value);
  }

  registerOnChange(fn: ChangeFn<number>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.state().disabled.set(isDisabled);
  }
}
