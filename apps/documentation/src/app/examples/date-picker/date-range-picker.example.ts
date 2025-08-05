import { Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronLeftMini, heroChevronRightMini } from '@ng-icons/heroicons/mini';
import {
  NgpDatePickerCell,
  NgpDatePickerCellRender,
  NgpDatePickerDateButton,
  NgpDatePickerGrid,
  NgpDatePickerLabel,
  NgpDatePickerNextMonth,
  NgpDatePickerPreviousMonth,
  NgpDatePickerRowRender,
  NgpDateRangePicker,
} from 'ng-primitives/date-picker';

@Component({
  selector: 'app-date-range-picker',
  imports: [
    NgIcon,
    NgpDateRangePicker,
    NgpDatePickerLabel,
    NgpDatePickerNextMonth,
    NgpDatePickerPreviousMonth,
    NgpDatePickerGrid,
    NgpDatePickerCell,
    NgpDatePickerRowRender,
    NgpDatePickerCellRender,
    NgpDatePickerDateButton,
  ],
  providers: [provideIcons({ heroChevronRightMini, heroChevronLeftMini })],
  template: `
    <div
      [(ngpDateRangePickerStartDate)]="startDate"
      [(ngpDateRangePickerEndDate)]="endDate"
      [(ngpDateRangePickerFocusedDate)]="focused"
      ngpDateRangePicker
    >
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
    [ngpDateRangePicker] {
      display: inline-block;
      background-color: var(--ngp-background);
      border-radius: 12px;
      padding: 16px;
      box-shadow: var(--ngp-shadow);
      border: 1px solid var(--ngp-border);
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
      color: var(--ngp-text-secondary);
    }

    [ngpDatePickerLabel] {
      font-size: 14px;
      font-weight: 500;
      color: var(--ngp-text-primary);
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
      border: 1px solid var(--ngp-border);
      cursor: pointer;
    }

    [ngpDatePickerPreviousMonth][data-hover],
    [ngpDatePickerNextMonth][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpDatePickerPreviousMonth][data-focus-visible],
    [ngpDatePickerNextMonth][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }

    [ngpDatePickerPreviousMonth][data-press],
    [ngpDatePickerNextMonth][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpDatePickerPreviousMonth][data-disabled],
    [ngpDatePickerNextMonth][data-disabled] {
      cursor: not-allowed;
      color: var(--ngp-text-disabled);
    }

    [ngpDatePickerCell] {
      padding: 0;
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
      color: var(--ngp-text-blue);
    }

    [ngpDatePickerDateButton][data-hover] {
      background: var(--ngp-background-hover);
    }

    [ngpDatePickerDateButton][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpDatePickerDateButton][data-press] {
      background: var(--ngp-background-active);
    }

    [ngpDatePickerDateButton][data-outside-month] {
      color: var(--ngp-text-disabled);
    }

    [ngpDatePickerDateButton][data-selected] {
      background: var(--ngp-background-inverse);
      color: var(--ngp-text-inverse);
    }

    [ngpDatePickerDateButton][data-selected]:not([data-range-end]) {
      border-radius: 8px 0 0 8px;
    }

    [ngpDatePickerDateButton][data-selected][data-range-end] {
      border-radius: 0 8px 8px 0;
    }

    [ngpDatePickerDateButton][data-selected][data-range-start][data-range-end] {
      border-radius: 8px;
    }

    [ngpDatePickerDateButton][data-range-between] {
      background: color-mix(in srgb, var(--ngp-background-inverse) 5%, transparent);
      border-radius: 0;
    }

    [ngpDatePickerDateButton][data-selected][data-outside-month] {
      background-color: var(--ngp-background-disabled);
      color: var(--ngp-text-disabled);
    }

    [ngpDatePickerDateButton][data-disabled] {
      cursor: not-allowed;
      color: var(--ngp-text-disabled);
    }
  `,
})
export default class DateRangePickerExample {
  /**
   * The start date of the range.
   */
  readonly startDate = signal<Date>(new Date(2025, 7, 10));

  /**
   * The end date of the range.
   */
  readonly endDate = signal<Date>(new Date(2025, 7, 14));

  /**
   * Store the current focused date.
   */
  readonly focused = signal<Date>(new Date(2025, 7, 10));

  /**
   * Get the current focused date in string format.
   * @returns The focused date in "February 2024" format.
   */
  readonly label = computed(
    () =>
      `${this.focused().toLocaleString('default', { month: 'long' })} ${this.focused().getFullYear()}`,
  );
}
