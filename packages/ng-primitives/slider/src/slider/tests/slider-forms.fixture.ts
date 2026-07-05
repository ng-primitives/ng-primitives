import { Component, input } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NgpSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack } from 'ng-primitives/slider';
import {
  ChangeFn,
  provideValueAccessor,
  safeTakeUntilDestroyed,
  TouchedFn,
} from 'ng-primitives/utils';
import { injectSliderState } from '../slider-state';

/**
 * Inline fixture mirroring `apps/components/.../reusable-components/slider/slider.ts`.
 * Used by the reusable-component test suites.
 */
@Component({
  selector: 'app-slider',
  hostDirectives: [
    {
      directive: NgpSlider,
      inputs: [
        'ngpSliderValue:value',
        'ngpSliderMin:min',
        'ngpSliderMax:max',
        'ngpSliderStep:step',
        'ngpSliderDisabled:disabled',
      ],
      outputs: ['ngpSliderValueChange:valueChange'],
    },
  ],
  imports: [NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
  providers: [provideValueAccessor(Slider)],
  template: `
    <div ngpSliderTrack>
      <div ngpSliderRange></div>
    </div>
    <div [attr.aria-label]="ariaLabel()" ngpSliderThumb></div>
  `,
  host: {
    '(focusout)': 'onTouched?.()',
  },
})
export class Slider implements ControlValueAccessor {
  private readonly state = injectSliderState();
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  private onChange?: ChangeFn<number>;
  protected onTouched?: TouchedFn;

  constructor() {
    this.state()
      .valueChange.pipe(safeTakeUntilDestroyed())
      .subscribe(value => this.onChange?.(value));
  }

  writeValue(value: number): void {
    // writing a value from the model must not re-emit through onChange
    this.state().setValue(value, { emit: false });
  }

  registerOnChange(fn: ChangeFn<number>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.state().setDisabled(isDisabled);
  }
}
