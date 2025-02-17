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
    [ngpDatePicker] {
      display: inline-block;
      background-color: var(--background);
      border-radius: 12px;
      padding: 16px;
      box-shadow: var(--shadow);
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
      color: var(--text-secondary);
    }

    [ngpDatePickerLabel] {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
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
      border: 1px solid var(--border);
      cursor: pointer;
    }

    [ngpDatePickerPreviousMonth][data-hover],
    [ngpDatePickerNextMonth][data-hover] {
      background-color: var(--background-hover);
    }

    [ngpDatePickerPreviousMonth][data-focus-visible],
    [ngpDatePickerNextMonth][data-focus-visible] {
      outline: 2px solid var(--focus-ring);
    }

    [ngpDatePickerPreviousMonth][data-press],
    [ngpDatePickerNextMonth][data-press] {
      background-color: var(--background-active);
    }

    [ngpDatePickerPreviousMonth][data-disabled],
    [ngpDatePickerNextMonth][data-disabled] {
      cursor: not-allowed;
      color: var(--text-disabled);
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
      color: var(--text-blue);
    }

    [ngpDatePickerDateButton][data-hover] {
      background-color: var(--background-hover);
    }

    [ngpDatePickerDateButton][data-focus-visible] {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    [ngpDatePickerDateButton][data-press] {
      background-color: var(--background-active);
    }

    [ngpDatePickerDateButton][data-outside-month] {
      color: var(--text-disabled);
    }

    [ngpDatePickerDateButton][data-selected] {
      background-color: var(--background-inverse);
      color: var(--text-inverse);
    }

    [ngpDatePickerDateButton][data-selected][data-outside-month] {
      background-color: var(--background-disabled);
      color: var(--text-disabled);
    }

    [ngpDatePickerDateButton][data-disabled] {
      cursor: not-allowed;
      color: var(--text-disabled);
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
