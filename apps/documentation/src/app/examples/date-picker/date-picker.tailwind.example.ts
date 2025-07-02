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
      class="inline-block rounded-xl border border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-zinc-950"
      [(ngpDatePickerDate)]="date"
      [(ngpDatePickerFocusedDate)]="focused"
      ngpDatePicker
    >
      <div class="mb-4 flex h-9 items-center justify-between">
        <button
          class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-700 dark:bg-black dark:text-gray-200 dark:hover:bg-gray-900"
          ngpDatePickerPreviousMonth
          aria-label="previous month"
        >
          <ng-icon name="heroChevronLeftMini" />
        </button>
        <h2 class="text-sm font-medium text-gray-900 dark:text-gray-100" ngpDatePickerLabel>
          {{ label() }}
        </h2>
        <button
          class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-700 dark:bg-black dark:text-gray-200 dark:hover:bg-gray-900"
          ngpDatePickerNextMonth
          aria-label="next month"
        >
          <ng-icon name="heroChevronRightMini" />
        </button>
      </div>
      <table class="w-full border-collapse select-none" ngpDatePickerGrid>
        <thead>
          <tr>
            <th class="h-10 w-10 text-center text-xs font-medium text-black dark:text-gray-300">
              S
            </th>
            <th class="h-10 w-10 text-center text-xs font-medium text-black dark:text-gray-300">
              M
            </th>
            <th class="h-10 w-10 text-center text-xs font-medium text-black dark:text-gray-300">
              T
            </th>
            <th class="h-10 w-10 text-center text-xs font-medium text-black dark:text-gray-300">
              W
            </th>
            <th class="h-10 w-10 text-center text-xs font-medium text-black dark:text-gray-300">
              T
            </th>
            <th class="h-10 w-10 text-center text-xs font-medium text-black dark:text-gray-300">
              F
            </th>
            <th class="h-10 w-10 text-center text-xs font-medium text-black dark:text-gray-300">
              S
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngpDatePickerRowRender>
            <td *ngpDatePickerCellRender="let date" ngpDatePickerCell>
              <button
                class="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-zinc-600 transition-colors focus:outline-none data-[disabled]:cursor-not-allowed data-[press]:bg-white data-[selected]:bg-gray-900 data-[selected][data-outside-month]:bg-gray-100 data-[disabled]:text-gray-300 data-[outside-month]:text-gray-300 data-[selected]:text-white data-[selected][data-outside-month]:text-gray-300 data-[selected][data-today]:text-white data-[today]:text-blue-600 dark:text-gray-300 dark:data-[selected]:bg-white dark:data-[outside-month]:text-gray-600 dark:data-[selected]:text-black dark:data-[selected][data-today]:text-black dark:data-[today]:text-blue-400"
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
