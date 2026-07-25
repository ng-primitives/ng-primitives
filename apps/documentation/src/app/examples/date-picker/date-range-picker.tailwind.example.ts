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
      class="inline-block rounded-xl border border-black/10 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950"
      [(ngpDateRangePickerStartDate)]="startDate"
      [(ngpDateRangePickerEndDate)]="endDate"
      [(ngpDateRangePickerFocusedDate)]="focused"
      ngpDateRangePicker
    >
      <div class="mb-4 flex h-9 items-center justify-between">
        <button
          class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-black/10 text-xl data-disabled:cursor-not-allowed data-disabled:text-gray-400 data-focus-visible:outline-2 data-focus-visible:outline-blue-500 data-hover:bg-gray-50 data-press:bg-gray-100 dark:border-zinc-800 dark:data-disabled:text-gray-500 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
          ngpDatePickerPreviousMonth
          aria-label="previous month"
        >
          <ng-icon name="heroChevronLeftMini" />
        </button>
        <!-- the ! modifier keeps the docs site's prose heading styles from bleeding in -->
        <h2 class="text-sm! font-[500]! text-gray-900 dark:text-gray-100" ngpDatePickerLabel>
          {{ label() }}
        </h2>
        <button
          class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-black/10 text-xl data-disabled:cursor-not-allowed data-disabled:text-gray-400 data-focus-visible:outline-2 data-focus-visible:outline-blue-500 data-hover:bg-gray-50 data-press:bg-gray-100 dark:border-zinc-800 dark:data-disabled:text-gray-500 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
          ngpDatePickerNextMonth
          aria-label="next month"
        >
          <ng-icon name="heroChevronRightMini" />
        </button>
      </div>
      <table ngpDatePickerGrid>
        <thead>
          <tr>
            <th
              class="h-10 w-10 text-center text-sm font-[500] text-gray-600 dark:text-gray-300"
              scope="col"
              abbr="Sunday"
            >
              S
            </th>
            <th
              class="h-10 w-10 text-center text-sm font-[500] text-gray-600 dark:text-gray-300"
              scope="col"
              abbr="Monday"
            >
              M
            </th>
            <th
              class="h-10 w-10 text-center text-sm font-[500] text-gray-600 dark:text-gray-300"
              scope="col"
              abbr="Tuesday"
            >
              T
            </th>
            <th
              class="h-10 w-10 text-center text-sm font-[500] text-gray-600 dark:text-gray-300"
              scope="col"
              abbr="Wednesday"
            >
              W
            </th>
            <th
              class="h-10 w-10 text-center text-sm font-[500] text-gray-600 dark:text-gray-300"
              scope="col"
              abbr="Thursday"
            >
              T
            </th>
            <th
              class="h-10 w-10 text-center text-sm font-[500] text-gray-600 dark:text-gray-300"
              scope="col"
              abbr="Friday"
            >
              F
            </th>
            <th
              class="h-10 w-10 text-center text-sm font-[500] text-gray-600 dark:text-gray-300"
              scope="col"
              abbr="Saturday"
            >
              S
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngpDatePickerRowRender>
            <td class="p-0" *ngpDatePickerCellRender="let date" ngpDatePickerCell>
              <button
                class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg outline-none data-disabled:cursor-not-allowed data-disabled:text-gray-400 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-gray-50 data-outside-month:text-gray-400 data-press:bg-gray-100 data-range-between:rounded-none data-range-between:bg-[#f01e2b]/5 data-selected:bg-[#f01e2b] data-selected:text-white data-today:text-[#f01e2b] dark:data-disabled:text-gray-500 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-outside-month:text-gray-500 dark:data-press:bg-zinc-800 dark:data-range-between:bg-[#ff4651]/5 dark:data-selected:bg-[#ff4651] dark:data-today:text-[#ff4651] [&[data-selected]:not([data-range-end])]:rounded-l-lg [&[data-selected]:not([data-range-end])]:rounded-r-none [&[data-selected][data-outside-month]]:bg-gray-100 [&[data-selected][data-outside-month]]:text-gray-400 dark:[&[data-selected][data-outside-month]]:bg-zinc-900 dark:[&[data-selected][data-outside-month]]:text-gray-500 [&[data-selected][data-range-end]]:rounded-l-none [&[data-selected][data-range-end]]:rounded-r-lg [&[data-selected][data-range-start][data-range-end]]:rounded-lg"
                ngpDatePickerDateButton
              >
                {{ date.getDate() }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
