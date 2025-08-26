import { Component, effect, input } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import {
  NgpRangeSlider,
  NgpRangeSliderRange,
  NgpRangeSliderThumb,
  NgpRangeSliderTrack,
  injectRangeSliderState,
} from 'ng-primitives/slider';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

@Component({
  selector: 'app-range-slider',
  hostDirectives: [
    {
      directive: NgpRangeSlider,
      inputs: [
        'ngpRangeSliderLow:low',
        'ngpRangeSliderHigh:high',
        'ngpRangeSliderMin:min',
        'ngpRangeSliderMax:max',
        'ngpRangeSliderStep:step',
        'ngpRangeSliderDisabled:disabled',
        'ngpRangeSliderOrientation:orientation',
      ],
      outputs: ['ngpRangeSliderLowChange:lowChange', 'ngpRangeSliderHighChange:highChange'],
    },
  ],
  imports: [NgpRangeSliderTrack, NgpRangeSliderRange, NgpRangeSliderThumb],
  providers: [provideValueAccessor(RangeSlider)],
  template: `
    <div ngpRangeSliderTrack>
      <div ngpRangeSliderRange></div>
    </div>
    <div ngpRangeSliderThumb></div>
    <div ngpRangeSliderThumb></div>
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
    }

    [ngpRangeSliderThumb][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 0;
    }

    [ngpRangeSliderThumb][data-thumb='high'] {
      z-index: 2;
      background-color: red; // TODO: Remove this
    }
  `,
  host: {
    '(focusout)': 'onTouched?.()',
  },
})
export class RangeSlider implements ControlValueAccessor {
  /** Access the range slider state */
  private readonly state = injectRangeSliderState();

  /** Forward aria-labels to each thumb */
  readonly ariaLabelLow = input<string | null>(null, { alias: 'aria-label-low' });
  readonly ariaLabelHigh = input<string | null>(null, { alias: 'aria-label-high' });

  /** The onChange callback function. */
  private onChange?: ChangeFn<[number, number]>;

  /** The onTouched callback function. */
  private onTouched?: TouchedFn;

  constructor() {
    // Whenever either value changes, call the onChange function with the new tuple [low, high].
    effect(() => {
      const low = this.state().low();
      const high = this.state().high();
      this.onChange?.([low, high]);

      console.log(this.state().thumbs());
    });
  }

  writeValue(value: [number, number]): void {
    if (!value || value.length !== 2) return;
    const [low, high] = value;
    // Use the directive's clamping setters to respect min/max and ordering
    this.state().setLowValue(low);
    this.state().setHighValue(high);
  }

  registerOnChange(fn: ChangeFn<[number, number]>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.state().disabled.set(isDisabled);
  }
}
