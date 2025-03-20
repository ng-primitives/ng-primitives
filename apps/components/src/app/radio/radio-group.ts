import { Component } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { injectRadioGroupState, NgpRadioGroup } from 'ng-primitives/radio';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

@Component({
  selector: 'app-radio-group',
  hostDirectives: [
    {
      directive: NgpRadioGroup,
      inputs: [
        'ngpRadioGroupValue:value',
        'ngpRadioGroupDisabled:disabled',
        'ngpRadioGroupOrientation:orientation',
      ],
      outputs: ['ngpRadioGroupValueChange:valueChange'],
    },
  ],
  providers: [provideValueAccessor(RadioGroup)],
  template: `
    <ng-content />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
    }
  `,
  host: {
    '(focusout)': 'onTouched?.()',
  },
})
export class RadioGroup implements ControlValueAccessor {
  /** Access the radio group state */
  protected readonly state = injectRadioGroupState();

  /** The on change callback */
  private onChange?: ChangeFn<string | null>;

  /** The on touched callback */
  protected onTouched?: TouchedFn;

  constructor() {
    this.state.valueChange.subscribe(value => this.onChange?.(value));
  }

  /** Write a new value to the radio group */
  writeValue(value: string): void {
    this.state.value.set(value);
  }

  /** Register the on change callback */
  registerOnChange(onChange: ChangeFn<string | null>): void {
    this.onChange = onChange;
  }

  /** Register the on touched callback */
  registerOnTouched(onTouched: TouchedFn): void {
    this.onTouched = onTouched;
  }
}
