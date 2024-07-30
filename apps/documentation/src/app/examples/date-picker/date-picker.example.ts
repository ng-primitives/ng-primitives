import { Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronLeftMini, heroChevronRightMini } from '@ng-icons/heroicons/mini';
import {
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

@Component({
  standalone: true,
  selector: 'app-date-picker',
  imports: [
    NgIcon,
    NgpDatePicker,
    NgpDatePickerLabel,
    NgpDatePickerNextMonth,
    NgpDatePickerPreviousMonth,
    NgpDatePickerGrid,
    NgpDatePickerCell,
    NgpDatePickerRowRender,
    NgpDatePickerCellRender,
    NgpDatePickerDateButton,
  ],
  viewProviders: [provideIcons({ heroChevronRightMini, heroChevronLeftMini })],
  template: `
    <div [(ngpDatePickerDate)]="date" [(ngpDatePickerFocusedDate)]="focused" ngpDatePicker>
      <div class="date-picker-header">
        <button ngpDatePickerPreviousMonth type="button" aria-label="previous month">
          <ng-icon name="heroChevronLeftMini" />
        </button>
        <h2 ngpDatePickerLabel>{{ label() }}</h2>
        <button ngpDatePickerNextMonth type="button" aria-label="next month">
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
    </div>
  `,
  styles: `
    [ngpDatePicker] {
      background-color: white;
      border-radius: 12px;
      padding: 16px;
      box-shadow:
        0 0 0 1px rgba(0, 0, 0, 0.05),
        0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .date-picker-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 36px;
      margin-bottom: 16px;
    }

    th {
      font-size: 14px;
      font-weight: 500;
      width: 40px;
      height: 40px;
      text-align: center;
      color: rgba(0, 0, 0, 0.5);
    }

    [ngpDatePickerLabel] {
      font-size: 14px;
      font-weight: 500;
      color: #000;
    }

    [ngpDatePickerPreviousMonth],
    [ngpDatePickerNextMonth] {
      all: unset;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-size: 20px;
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
      cursor: pointer;
    }

    [ngpDatePickerPreviousMonth][data-hover='true'],
    [ngpDatePickerNextMonth][data-hover='true'] {
      background-color: rgba(0, 0, 0, 0.05);
    }

    [ngpDatePickerPreviousMonth][data-focus-visible='true'],
    [ngpDatePickerNextMonth][data-focus-visible='true'] {
      outline: 2px solid rgb(59 130 246);
    }

    [ngpDatePickerPreviousMonth][data-press='true'],
    [ngpDatePickerNextMonth][data-press='true'] {
      background-color: rgba(0, 0, 0, 0.1);
    }

    [ngpDatePickerDateButton] {
      all: unset;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      cursor: pointer;
    }

    [ngpDatePickerDateButton][data-hover='true'] {
      background-color: rgba(0, 0, 0, 0.05);
    }

    [ngpDatePickerDateButton][data-focus-visible='true'] {
      outline: 2px solid rgb(59 130 246);
      outline-offset: 2px;
    }

    [ngpDatePickerDateButton][data-press='true'] {
      background-color: rgba(0, 0, 0, 0.1);
    }

    [ngpDatePickerDateButton][data-outside-month='true'] {
      color: rgba(0, 0, 0, 0.25);
    }

    [ngpDatePickerDateButton][data-selected='true'] {
      background-color: rgb(59 130 246);
      color: white;
    }

    [ngpDatePickerDateButton][data-selected='true'][data-outside-month='true'] {
      background-color: rgb(0, 0, 0, 0.1);
      color: rgba(0, 0, 0, 0.2);
    }
  `,
})
export default class DatePickerExample {
  /**
   * The selected date.
   */
  readonly date = signal<Date>(new Date());

  /**
   * Store the current focused date.
   */
  readonly focused = signal<Date>(new Date());

  /**
   * Get the current focused date in string format.
   * @returns The focused date in "February 2024" format.
   */
  readonly label = computed(
    () =>
      `${this.focused().toLocaleString('default', { month: 'long' })} ${this.focused().getFullYear()}`,
  );
}
