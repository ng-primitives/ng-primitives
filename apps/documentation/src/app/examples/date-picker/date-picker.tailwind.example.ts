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
      class="inline-block rounded-xl border border-black/10 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950"
      [(ngpDatePickerDate)]="date"
      [(ngpDatePickerFocusedDate)]="focused"
      ngpDatePicker
    >
      <div class="mb-4 flex h-9 items-center justify-between">
        <button
          class="box-content flex size-8 cursor-pointer items-center justify-center rounded-lg border border-black/10 text-[20px] [line-height:normal] data-disabled:cursor-not-allowed data-disabled:text-zinc-400 data-focus-visible:outline-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:border-zinc-800 dark:data-disabled:text-zinc-500 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
          ngpDatePickerPreviousMonth
          aria-label="previous month"
        >
          <ng-icon name="heroChevronLeftMini" />
        </button>
        <!-- the ! modifier keeps the docs site's prose heading styles from bleeding in -->
        <h2 class="text-[14px]! font-[500]! text-zinc-900 dark:text-zinc-100" ngpDatePickerLabel>
          {{ label() }}
        </h2>
        <button
          class="box-content flex size-8 cursor-pointer items-center justify-center rounded-lg border border-black/10 text-[20px] [line-height:normal] data-disabled:cursor-not-allowed data-disabled:text-zinc-400 data-focus-visible:outline-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:border-zinc-800 dark:data-disabled:text-zinc-500 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
          ngpDatePickerNextMonth
          aria-label="next month"
        >
          <ng-icon name="heroChevronRightMini" />
        </button>
      </div>
      <table ngpDatePickerGrid>
        <thead>
          <tr>
            <th class="size-10 text-center text-[14px] font-[500] text-zinc-600 dark:text-zinc-300">
              S
            </th>
            <th class="size-10 text-center text-[14px] font-[500] text-zinc-600 dark:text-zinc-300">
              M
            </th>
            <th class="size-10 text-center text-[14px] font-[500] text-zinc-600 dark:text-zinc-300">
              T
            </th>
            <th class="size-10 text-center text-[14px] font-[500] text-zinc-600 dark:text-zinc-300">
              W
            </th>
            <th class="size-10 text-center text-[14px] font-[500] text-zinc-600 dark:text-zinc-300">
              T
            </th>
            <th class="size-10 text-center text-[14px] font-[500] text-zinc-600 dark:text-zinc-300">
              F
            </th>
            <th class="size-10 text-center text-[14px] font-[500] text-zinc-600 dark:text-zinc-300">
              S
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngpDatePickerRowRender>
            <td *ngpDatePickerCellRender="let date" ngpDatePickerCell>
              <!--
                The colour states are written as mutually exclusive variants so they never
                depend on the order Tailwind happens to emit them in: today only shows red
                when the day is neither selected nor outside the month, and so on.
              -->
              <button
                class="flex size-10 cursor-pointer items-center justify-center rounded-lg outline-none data-disabled:cursor-not-allowed data-disabled:text-zinc-400 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 not-data-selected:data-outside-month:text-zinc-400 data-press:bg-zinc-100 data-selected:not-data-outside-month:bg-[#f01e2b] data-selected:not-data-outside-month:text-white data-selected:data-outside-month:bg-zinc-100 data-selected:data-outside-month:text-zinc-400 not-data-selected:not-data-outside-month:data-today:text-[#f01e2b] dark:data-disabled:text-zinc-500 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:not-data-selected:data-outside-month:text-zinc-500 dark:data-press:bg-zinc-800 dark:data-selected:not-data-outside-month:bg-[#ff4651] dark:data-selected:data-outside-month:bg-zinc-900 dark:data-selected:data-outside-month:text-zinc-500 dark:not-data-selected:not-data-outside-month:data-today:text-[#ff4651]"
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
