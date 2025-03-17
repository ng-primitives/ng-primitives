import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Component, computed, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronLeftMini, heroChevronRightMini } from '@ng-icons/heroicons/mini';
import {
  injectDatePicker,
  NgpDatePicker,
  NgpDatePickerCell,
  NgpDatePickerCellRender,
  NgpDatePickerDateButton,
  NgpDatePickerGrid,
  NgpDatePickerLabel,
  NgpDatePickerNextMonth,
  NgpDatePickerPreviousMonth,
  NgpDatePickerRowRender,
} from 'ng-primitives/date-picker';
import { controlState } from 'ng-primitives/forms';

@Component({
  selector: 'app-date-picker',
  hostDirectives: [
    {
      directive: NgpDatePicker,
      inputs: [
        'ngpDatePickerDate: date',
        'ngpDatePickerMin: min',
        'ngpDatePickerMax: max',
        'ngpDatePickerDisabled: disabled',
      ],
      outputs: ['ngpDatePickerDateChange: dateChange'],
    },
  ],
  imports: [
    NgIcon,
    NgpDatePickerLabel,
    NgpDatePickerNextMonth,
    NgpDatePickerPreviousMonth,
    NgpDatePickerGrid,
    NgpDatePickerCell,
    NgpDatePickerRowRender,
    NgpDatePickerCellRender,
    NgpDatePickerDateButton,
  ],
  providers: [
    provideIcons({ heroChevronRightMini, heroChevronLeftMini }),
    { provide: NG_VALUE_ACCESSOR, useExisting: DatePicker, multi: true },
  ],
  template: `
    <div>
      <button ngpDatePickerPreviousMonth aria-label="previous month">
        <ng-icon name="heroChevronLeftMini" />
      </button>
      <h2 ngpDatePickerLabel>{{ label() }}</h2>
      <button ngpDatePickerNextMonth aria-label="next month">
        <ng-icon name="heroChevronRightMini" />
      </button>
    </div>
    <table ngpDatePickerGrid>
      <thead>
        <tr>
          <th scope="col" abbr="Sunday">S</th>
          <th scope="col" abbr="Monday">M</th>
          <th scope="col" abbr="Tuesday">T</th>
          <th scope="col" abbr="Wednesday">W</th>
          <th scope="col" abbr="Thursday">T</th>
          <th scope="col" abbr="Friday">F</th>
          <th scope="col" abbr="Saturday">S</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngpDatePickerRowRender>
          <td *ngpDatePickerCellRender="let date" ngpDatePickerCell>
            <button ngpDatePickerDateButton>{{ date.getDate() }}</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styles: ``,
  host: {
    '(focusout)': 'state.markAsTouched()',
  },
})
export class DatePicker implements ControlValueAccessor {
  /** Access the date picker host directive */
  private readonly datePicker = injectDatePicker<Date>();

  /** The selected date. */
  readonly date = input<Date>(new Date());

  /** The minimum date that can be selected. */
  readonly min = input<Date>();

  /** The maximum date that can be selected. */
  readonly max = input<Date>();

  /** Determine if the date picker is disabled. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * Get the current focused date in string format.
   * @returns The focused date in "February 2024" format.
   */
  readonly label = computed(
    () =>
      `${this.datePicker.focusedDate().toLocaleString('default', { month: 'long' })} ${this.datePicker.focusedDate().getFullYear()}`,
  );

  /**
   * This connects the state of the date picker to the form control and host directives and keeps them in sync.
   * Use `state.value()` to get the current value of the date picker and `state.disabled()` to get the current disabled state
   * rather than accessing the inputs directly.
   * @internal
   */
  readonly state = controlState({
    value: this.date,
    disabled: this.disabled,
  });

  writeValue(date: Date): void {
    this.state.writeValue(date);
  }

  registerOnChange(fn: (date: Date) => void): void {
    this.state.setOnChangeFn(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.state.setOnTouchedFn(fn);
  }

  setDisabledState(isDisabled: boolean): void {
    this.state.setDisabled(isDisabled);
  }
}
