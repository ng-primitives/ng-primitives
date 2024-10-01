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
    </div>
  `,
  styles: `
    :host {
      --datepicker-background-color: rgb(255 255 255);
      --datepicker-day-color: rgba(0, 0, 0, 0.5);
      --datepicker-label-color: #000;
      --datepicker-navigation-button-hover-background-color: rgba(0, 0, 0, 0.05);
      --datepicker-date-button-today-color: rgb(59 130 246);
      --datepicker-date-button-hover-background-color: rgba(0, 0, 0, 0.05);
      --datepicker-date-button-pressed-background-color: rgba(0, 0, 0, 0.1);
      --datepicker-date-button-outside-month-color: rgba(0, 0, 0, 0.25);
      --datepicker-date-button-outside-selected-month-color: rgba(0, 0, 0, 0.2);
      --datepicker-date-button-outside-selected-month-background-color: rgba(0, 0, 0, 0.1);

      --datepicker-background-color-dark: rgb(43 43 43);
      --datepicker-day-color-dark: rgba(255, 255, 255, 0.5);
      --datepicker-label-color-dark: #fff;
      --datepicker-navigation-button-hover-background-color-dark: rgba(255, 255, 255, 0.05);
      --datepicker-date-button-today-color-dark: rgb(59 130 246);
      --datepicker-date-button-hover-background-color-dark: rgba(255, 255, 255, 0.05);
      --datepicker-date-button-pressed-background-color-dark: rgba(255, 255, 255, 0.1);
      --datepicker-date-button-outside-month-color-dark: rgba(255, 255, 255, 0.25);
      --datepicker-date-button-outside-selected-month-color-dark: rgba(255, 255, 255, 0.2);
      --datepicker-date-button-outside-selected-month-background-color-dark: rgba(
        255,
        255,
        255,
        0.1
      );
    }

    [ngpDatePicker] {
      display: inline-block;
      background-color: light-dark(
        var(--datepicker-background-color),
        var(--datepicker-background-color-dark)
      );
      border-radius: 12px;
      padding: 16px;
      box-shadow:
        0 0 0 1px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05)),
        0 1px 2px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05));
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
      color: light-dark(var(--datepicker-day-color), var(--datepicker-day-color-dark));
    }

    [ngpDatePickerLabel] {
      font-size: 14px;
      font-weight: 500;
      color: light-dark(var(--datepicker-label-color), var(--datepicker-label-color-dark));
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
        0 1px 3px 0 light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.007)),
        0 1px 2px -1px light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1)),
        0 0 0 1px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05));
      cursor: pointer;
    }

    [ngpDatePickerPreviousMonth][data-hover],
    [ngpDatePickerNextMonth][data-hover] {
      background-color: light-dark(
        var(--datepicker-navigation-button-hover-background-color),
        var(--datepicker-navigation-button-hover-background-color-dark)
      );
    }

    [ngpDatePickerPreviousMonth][data-focus-visible],
    [ngpDatePickerNextMonth][data-focus-visible] {
      outline: 2px solid rgb(59 130 246);
    }

    [ngpDatePickerPreviousMonth][data-press],
    [ngpDatePickerNextMonth][data-press] {
      background-color: rgba(0, 0, 0, 0.1);
    }

    [ngpDatePickerPreviousMonth][data-disabled],
    [ngpDatePickerNextMonth][data-disabled] {
      cursor: not-allowed;
      color: rgba(0, 0, 0, 0.25);
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

    [ngpDatePickerDateButton][data-today] {
      color: light-dark(
        var(--datepicker-date-button-today-color),
        var(--datepicker-date-button-today-color-dark)
      );
    }

    [ngpDatePickerDateButton][data-hover] {
      background-color: light-dark(
        var(--datepicker-date-button-hover-background-color),
        var(--datepicker-date-button-hover-background-color-dark)
      );
    }

    [ngpDatePickerDateButton][data-focus-visible] {
      outline: 2px solid rgb(59 130 246);
      outline-offset: 2px;
    }

    [ngpDatePickerDateButton][data-press] {
      background-color: light-dark(
        var(--datepicker-date-button-pressed-background-color),
        var(--datepicker-date-button-pressed-background-color-dark)
      );
    }

    [ngpDatePickerDateButton][data-outside-month] {
      color: light-dark(
        var(--datepicker-date-button-outside-month-color),
        var(--datepicker-date-button-outside-month-color-dark)
      );
    }

    [ngpDatePickerDateButton][data-selected] {
      background-color: rgb(59 130 246);
      color: white;
    }

    [ngpDatePickerDateButton][data-selected][data-outside-month] {
      background-color: light-dark(
        var(--datepicker-date-button-outside-selected-month-background-color),
        var(--datepicker-date-button-outside-selected-month-background-color-dark)
      );
      color: light-dark(
        var(--datepicker-date-button-outside-selected-month-color),
        var(--datepicker-date-button-outside-selected-month-color-dark)
      );
    }

    [ngpDatePickerDateButton][data-disabled] {
      cursor: not-allowed;
      color: rgba(0, 0, 0, 0.25);
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
