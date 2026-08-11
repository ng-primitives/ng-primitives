import { Component, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor } from '@angular/forms';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';
import { merge } from 'rxjs';
import { NgpRangeSliderRange } from '../../range-slider-range/range-slider-range';
import { NgpRangeSliderThumb } from '../../range-slider-thumb/range-slider-thumb';
import { NgpRangeSliderTrack } from '../../range-slider-track/range-slider-track';
import { NgpRangeSlider } from '../range-slider';
import { injectRangeSliderState, provideRangeSliderState } from '../range-slider-state';

/**
 * Inline fixture mirroring
 * `apps/components/.../reusable-components/range-slider/range-slider.ts`.
 * Used by the reusable-component test suites. The bound value is a `[low, high]`
 * pair.
 */
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
  providers: [provideRangeSliderState(), provideValueAccessor(RangeSlider)],
  template: `
    <div ngpRangeSliderTrack data-testid="track">
      <div ngpRangeSliderRange data-testid="range"></div>
    </div>
    <div ngpRangeSliderThumb data-testid="low-thumb"></div>
    <div ngpRangeSliderThumb data-testid="high-thumb"></div>
  `,
  host: {
    '(focusout)': 'onTouched?.()',
  },
})
export class RangeSlider implements ControlValueAccessor {
  /** Access the range slider state */
  private readonly state = injectRangeSliderState();

  /** Forward aria-labels to each thumb */
  readonly ariaLabelLow = input<string | null>(null);
  readonly ariaLabelHigh = input<string | null>(null);

  /** The onChange callback function. */
  private onChange?: ChangeFn<[number, number]>;

  /** The onTouched callback function. */
  protected onTouched?: TouchedFn;

  constructor() {
    // Whenever either value changes, call onChange with the new tuple [low, high].
    merge(this.state().lowChange, this.state().highChange)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.onChange?.([this.state().low(), this.state().high()]));
  }

  writeValue(value: [number, number]): void {
    if (!value || value.length !== 2) {
      return;
    }

    const [low, high] = value;
    // Use the directive's clamping setters to respect min/max and ordering.
    // writing a value from the model must not re-emit through onChange
    this.state().setLowValue(low, { emit: false });
    this.state().setHighValue(high, { emit: false });
  }

  registerOnChange(fn: ChangeFn<[number, number]>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.state().setDisabled(isDisabled);
  }
}
