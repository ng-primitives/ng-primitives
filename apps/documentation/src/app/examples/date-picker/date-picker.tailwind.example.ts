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
  providers: [provideIcons({ heroChevronRightMini, heroChevronLeftMini })],
  template: `
    <div
      class="inline-block rounded-xl border border-gray-200 bg-white p-4 shadow-md dark:border-zinc-800 dark:bg-zinc-950"
      [(ngpDatePickerDate)]="date"
      [(ngpDatePickerFocusedDate)]="focused"
      ngpDatePicker
    >
      <div class="mb-4 flex h-9 items-center justify-between">
        <button
          class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 outline-hidden hover:bg-gray-50 data-focus-visible:outline-2 data-focus-visible:outline-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-gray-200 dark:hover:bg-gray-900 dark:data-focus-visible:outline-blue-400"
          ngpDatePickerPreviousMonth
          aria-label="previous month"
        >
          <ng-icon name="heroChevronLeftMini" />
        </button>
        <h2 class="text-sm font-medium text-gray-900 dark:text-gray-100" ngpDatePickerLabel>
          {{ label() }}
        </h2>
        <button
          class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 outline-hidden hover:bg-gray-50 data-focus-visible:outline-2 data-focus-visible:outline-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-gray-200 dark:hover:bg-gray-900 dark:data-focus-visible:outline-blue-400"
          ngpDatePickerNextMonth
          aria-label="next month"
        >
          <ng-icon name="heroChevronRightMini" />
        </button>
      </div>
      <table class="w-full border-collapse select-none" ngpDatePickerGrid>
        <thead>
          <tr>
            <th class="h-10 w-10 text-center text-xs font-medium text-gray-500 dark:text-gray-300">
              S
            </th>
            <th class="h-10 w-10 text-center text-xs font-medium text-gray-500 dark:text-gray-300">
              M
            </th>
            <th class="h-10 w-10 text-center text-xs font-medium text-gray-500 dark:text-gray-300">
              T
            </th>
            <th class="h-10 w-10 text-center text-xs font-medium text-gray-500 dark:text-gray-300">
              W
            </th>
            <th class="h-10 w-10 text-center text-xs font-medium text-gray-500 dark:text-gray-300">
              T
            </th>
            <th class="h-10 w-10 text-center text-xs font-medium text-gray-500 dark:text-gray-300">
              F
            </th>
            <th class="h-10 w-10 text-center text-xs font-medium text-gray-500 dark:text-gray-300">
              S
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngpDatePickerRowRender>
            <td *ngpDatePickerCellRender="let date" ngpDatePickerCell>
              <button
                class="data-[selected][data-outside-month]:bg-gray-100 data-[selected][data-outside-month]:text-gray-300 data-[selected][data-today]:text-white dark:data-[selected][data-today]:text-white flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-zinc-600 outline-hidden transition-colors data-disabled:cursor-not-allowed data-disabled:text-gray-300 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-gray-100 data-outside-month:text-gray-300 data-press:bg-gray-200 data-selected:bg-[#f01e2b] data-selected:text-white data-today:text-[#f01e2b] dark:text-gray-300 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-800 dark:data-outside-month:text-gray-600 dark:data-press:bg-zinc-700 dark:data-selected:bg-[#ff4651] dark:data-selected:text-white dark:data-today:text-[#ff4651]"
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
export default class DatePicker {
  /** The selected date. */
  readonly date = signal<Date>(new Date());

  /** Store the current focused date. */
  readonly focused = signal<Date>(new Date());

  /** Get the current focused date in string format. */
  readonly label = computed(
    () =>
      `${this.focused().toLocaleString('default', { month: 'long' })} ${this.focused().getFullYear()}`,
  );
}
