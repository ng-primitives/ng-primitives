import { Component } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { injectRadioGroupState, NgpRadioGroup, NgpRadioItem } from 'ng-primitives/radio';
import {
  ChangeFn,
  provideValueAccessor,
  safeTakeUntilDestroyed,
  TouchedFn,
} from 'ng-primitives/utils';

/**
 * Inline fixtures mirroring
 * `apps/components/.../reusable-components/radio/radio-group.ts` and
 * `radio-item.ts`. Used by the reusable-component test suites.
 */
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
  host: {
    '(focusout)': 'onTouched?.()',
  },
})
export class RadioGroup implements ControlValueAccessor {
  private readonly state = injectRadioGroupState<string>();
  private onChange?: ChangeFn<string | null>;
  protected onTouched?: TouchedFn;

  constructor() {
    this.state()
      .valueChange.pipe(safeTakeUntilDestroyed())
      .subscribe(value => this.onChange?.(value));
  }

  writeValue(value: string | null): void {
    this.state().setValue(value, { emit: false });
  }

  registerOnChange(onChange: ChangeFn<string | null>): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: TouchedFn): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.state().setDisabled(isDisabled);
  }
}

@Component({
  selector: 'app-radio-item',
  hostDirectives: [
    {
      directive: NgpRadioItem,
      inputs: ['ngpRadioItemValue:value', 'ngpRadioItemDisabled:disabled'],
    },
  ],
  template: `
    <ng-content />
  `,
})
export class RadioItemFixture {}
