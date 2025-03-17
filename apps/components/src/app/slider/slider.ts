import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Component, input, model, numberAttribute } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { controlState } from 'ng-primitives/forms';
import { NgpSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack } from 'ng-primitives/slider';

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
  template: `
    <div ngpSliderTrack>
      <div ngpSliderRange></div>
    </div>
    <div ngpSliderThumb></div>
  `,
  styles: `
    :host {
    }

    [ngpSliderTrack] {
    }

    [ngpSliderRange] {
    }

    [ngpSliderThumb] {
    }

    [ngpSliderThumb][data-focus-visible] {
    }
  `,
})
export class Slider implements ControlValueAccessor {
  /** The value of the slider. */
  readonly value = model<number>(0);

  /** The minimum value of the slider. */
  readonly min = input<number, NumberInput>(0, { transform: numberAttribute });

  /** The maximum value of the slider. */
  readonly max = input<number, NumberInput>(100, { transform: numberAttribute });

  /** Whether the slider is disabled. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * This connects the state of the slider to the form control and host directives and keeps them in sync.
   * Use `state.value()` to get the current value of the checkbox and `state.disabled()` to get the current disabled state
   * rather than accessing the inputs directly.
   */
  protected readonly state = controlState({
    value: this.value,
    disabled: this.disabled,
  });

  writeValue(value: number): void {
    this.state.writeValue(value);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.state.setOnChangeFn(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.state.setOnTouchedFn(fn);
  }

  setDisabledState(isDisabled: boolean): void {
    this.state.setDisabled(isDisabled);
  }
}
