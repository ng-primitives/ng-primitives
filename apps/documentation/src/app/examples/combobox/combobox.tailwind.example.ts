import { Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown } from '@ng-icons/heroicons/outline';
import {
  NgpCombobox,
  NgpComboboxButton,
  NgpComboboxDropdown,
  NgpComboboxInput,
  NgpComboboxOption,
  NgpComboboxPortal,
} from 'ng-primitives/combobox';

@Component({
  selector: 'app-combobox-tailwind',
  imports: [
    NgpCombobox,
    NgpComboboxDropdown,
    NgpComboboxOption,
    NgpComboboxInput,
    NgpComboboxPortal,
    NgpComboboxButton,
    NgIcon,
  ],
  providers: [provideIcons({ heroChevronDown })],
  template: `
    <div
      class="relative box-border flex h-[2.125rem] w-[300px] items-center justify-between rounded-lg border border-gray-200 bg-white transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-500 dark:border-gray-700 dark:bg-transparent dark:focus-within:outline-blue-400"
      [(ngpComboboxValue)]="value"
      (ngpComboboxValueChange)="onValueChange($event)"
      (ngpComboboxOpenChange)="resetOnClose($event)"
      ngpCombobox
    >
      <input
        class="font-inherit h-full flex-1 border-none bg-transparent px-4 text-[14px] text-gray-900 outline-hidden focus:ring-0 dark:bg-transparent dark:text-gray-100"
        [value]="inputValue()"
        (input)="onFilterChange($event)"
        placeholder="Select an option"
        ngpComboboxInput
      />

      <button
        class="box-border inline-flex h-full w-9 cursor-pointer items-center justify-center border-none bg-transparent text-gray-900 focus:outline-hidden dark:text-gray-100 dark:hover:text-gray-200"
        ngpComboboxButton
        aria-label="Toggle dropdown"
      >
        <ng-icon name="heroChevronDown" />
      </button>

      <div
        class="absolute left-0 z-1001 mt-1 box-border max-h-[240px] w-[300px] overflow-y-auto rounded-[12px] border border-gray-200 bg-white p-1 shadow-lg outline-hidden dark:border-zinc-800 dark:bg-zinc-950"
        *ngpComboboxPortal
        ngpComboboxDropdown
      >
        @for (option of filteredOptions(); track option) {
          <div
            class="box-border flex h-[2.125rem] w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-sm tracking-[-0.006em] text-gray-900 transition-colors hover:bg-gray-100 data-active:bg-gray-100 data-press:bg-gray-100 data-selected:font-[510] data-selected:text-[#f01e2b] dark:text-gray-100 dark:hover:bg-white/10 dark:data-active:bg-white/10 dark:data-press:bg-white/20 dark:data-selected:text-[#ff4651]"
            [ngpComboboxOptionValue]="option"
            ngpComboboxOption
          >
            {{ option }}
          </div>
        } @empty {
          <div
            class="flex items-center justify-center p-2 text-center text-sm font-[510] text-gray-400 dark:text-gray-600"
          >
            No options found
          </div>
        }
      </div>
    </div>
  `,
})
export default class ComboboxExample {
  /** The options for the combobox. */
  readonly options: string[] = [
    'Marty McFly',
    'Doc Brown',
    'Biff Tannen',
    'George McFly',
    'Jennifer Parker',
    'Emmett Brown',
    'Einstein',
    'Clara Clayton',
    'Needles',
    'Goldie Wilson',
    'Marvin Berry',
    'Lorraine Baines',
    'Strickland',
  ];

  /** The selected value. */
  readonly value = signal<string | undefined>(undefined);

  /** The input value. */
  readonly inputValue = signal<string>('');

  /** The filter value. */
  readonly filter = signal<string>('');

  /** Get the filtered options. */
  protected readonly filteredOptions = computed(() =>
    this.options.filter(option => option.toLowerCase().includes(this.filter().toLowerCase())),
  );

  protected onFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.inputValue.set(input.value);
    this.filter.set(input.value);
  }

  protected onValueChange(value: string | undefined): void {
    this.inputValue.set(value ?? '');
    this.filter.set('');
  }

  protected resetOnClose(open: boolean): void {
    // if the dropdown is closed, reset the filter value
    if (open) {
      return;
    }

    // if the input value is empty, set the value to undefined
    if (this.inputValue() === '') {
      this.value.set(undefined);
    } else {
      // otherwise set the input value to the selected value
      this.inputValue.set(this.value() ?? '');
    }

    this.filter.set('');
  }
}
