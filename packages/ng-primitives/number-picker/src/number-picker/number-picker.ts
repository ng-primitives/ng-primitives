import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute, output } from '@angular/core';
import { injectFormControlState, NgpFormControl } from 'ng-primitives/form-field';
import { syncState } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectNumberPickerConfig } from '../config/number-picker-config';
import { numberPickerState, provideNumberPickerState } from './number-picker-state';

@Directive({
  selector: '[ngpNumberPicker]',
  exportAs: 'ngpNumberPicker',
  providers: [provideNumberPickerState()],
  hostDirectives: [NgpFormControl],
  host: {
    '[attr.data-disabled]': 'state.disabled()',
    '[attr.data-readonly]': 'state.readonly()',
  },
})
export class NgpNumberPicker {
  /** The global configuration for the number picker. */
  private readonly config = injectNumberPickerConfig();

  /** Access the form control state */
  private readonly formControl = injectFormControlState();

  /** The id of the number picker. */
  readonly id = input<string>(uniqueId('ngp-number-picker'));

  /** The current value. */
  readonly value = input<number, NumberInput>(undefined, {
    alias: 'ngpNumberPickerValue',
    transform: numberAttribute,
  });

  /** Event emitted when the value changes. */
  readonly valueChange = output<number | undefined>();

  /** Whether the number picker is disabled. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpNumberPickerDisabled',
    transform: booleanAttribute,
  });

  /** Whether the number picker is readonly. */
  readonly readonly = input<boolean, BooleanInput>(false, {
    alias: 'ngpNumberPickerReadonly',
    transform: booleanAttribute,
  });

  /** The minimum value. */
  readonly min = input<number, NumberInput>(this.config.min, {
    alias: 'ngpNumberPickerMin',
    transform: numberAttribute,
  });

  /** The maximum value. */
  readonly max = input<number, NumberInput>(this.config.max, {
    alias: 'ngpNumberPickerMax',
    transform: numberAttribute,
  });

  /** The step value. */
  readonly step = input<number, NumberInput>(this.config.step, {
    alias: 'ngpNumberPickerStep',
    transform: numberAttribute,
  });

  /** The small step value. */
  readonly smallStep = input<number, NumberInput>(this.config.smallStep, {
    alias: 'ngpNumberPickerSmallStep',
    transform: numberAttribute,
  });

  /** The large step value. */
  readonly largeStep = input<number, NumberInput>(this.config.largeStep, {
    alias: 'ngpNumberPickerLargeStep',
    transform: numberAttribute,
  });

  /** Whether the user can use the mouse wheel to change the value. */
  readonly allowWheelScrub = input<boolean, BooleanInput>(this.config.allowWheelScrub, {
    alias: 'ngpNumberPickerAllowWheelScrub',
    transform: booleanAttribute,
  });

  /** The format of the number picker. */
  readonly format = input<Intl.NumberFormatOptions | undefined>(this.config.format, {
    alias: 'ngpNumberPickerFormat',
  });

  /** The state of the number picker. */
  private readonly state = numberPickerState<NgpNumberPicker>(this);

  constructor() {
    syncState(this.state.id, this.formControl().id);
    syncState(this.state.disabled, this.formControl().disabled);
  }

  /** Increment the value. */
  increment(event?: PointerEvent | MouseEvent): void {
    const value = this.state.value();
    const amount = this.getStepAmount(event);

    const newValue =
      typeof value === 'number' ? value + amount : Math.max(0, this.state.min() ?? 0);

    this.state.value.set(newValue);
  }

  /** Decrement the value. */
  decrement(event?: PointerEvent | MouseEvent): void {
    const value = this.state.value();
    const amount = this.getStepAmount(event);

    const newValue =
      typeof value === 'number' ? value - amount : Math.min(0, this.state.max() ?? 0);

    this.state.value.set(newValue);
  }

  /** Determine the step value based on the event. */
  getStepAmount(event?: PointerEvent | MouseEvent): number {
    if (event?.altKey) {
      return this.state.smallStep();
    }

    if (event?.shiftKey) {
      return this.state.largeStep();
    }

    return this.state.step();
  }
}
