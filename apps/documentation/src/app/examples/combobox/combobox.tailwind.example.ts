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
      class="relative box-border flex h-[36px] w-[300px] items-center justify-between rounded-[8px] border border-gray-200 bg-white transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-500 dark:border-gray-700 dark:bg-black dark:focus-within:outline-blue-400"
      [(ngpComboboxValue)]="value"
      (ngpComboboxValueChange)="filter.set($event)"
      (ngpComboboxOpenChange)="resetOnClose($event)"
      ngpCombobox
    >
      <input
        class="font-inherit h-full flex-1 border-none bg-transparent px-4 text-[14px] text-gray-900 outline-none focus:ring-0 dark:bg-transparent dark:text-gray-100"
        [value]="filter()"
        (input)="onFilterChange($event)"
        placeholder="Select an option"
        ngpComboboxInput
      />

      <button
        class="box-border inline-flex h-full w-9 cursor-pointer items-center justify-center border-none bg-transparent text-gray-900 focus:outline-none dark:text-gray-100 dark:hover:text-gray-200"
        ngpComboboxButton
        aria-label="Toggle dropdown"
      >
        <ng-icon name="heroChevronDown" />
      </button>

      <div
        class="absolute left-0 z-[1001] mt-1 box-border max-h-[240px] w-[300px] overflow-y-auto rounded-[12px] border border-gray-200 bg-white p-1 shadow-lg outline-none dark:border-gray-700 dark:bg-black dark:ring-white/10"
        *ngpComboboxPortal
        ngpComboboxDropdown
      >
        @for (option of filteredOptions(); track option) {
          <div
            class="box-border flex h-[36px] w-full cursor-pointer items-center gap-2 rounded-[8px] px-3 text-[14px] text-gray-900 transition-colors hover:bg-gray-100 data-[active]:bg-gray-100 data-[press]:bg-gray-100 dark:text-gray-100 dark:hover:bg-white/10 dark:data-[active]:bg-white/10 dark:data-[press]:bg-white/20"
            [ngpComboboxOptionValue]="option"
            ngpComboboxOption
          >
            {{ option }}
          </div>
        } @empty {
          <div
            class="flex items-center justify-center p-2 text-center text-sm font-medium text-gray-400 dark:text-gray-600"
          >
            No options found
          </div>
        }
      </div>
    </div>
  `,
})
export default class ComboboxTailwind {
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

  /** The filter value. */
  readonly filter = signal<string>('');

  /** Get the filtered options. */
  protected readonly filteredOptions = computed(() =>
    this.options.filter(option => option.toLowerCase().includes(this.filter().toLowerCase())),
  );

  protected onFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filter.set(input.value);
  }

  protected resetOnClose(open: boolean): void {
    // if the dropdown is closed, reset the filter value
    if (open) {
      return;
    }

    // if the filter value is empty, set the value to undefined
    if (this.filter() === '') {
      this.value.set(undefined);
    } else {
      // otherwise set the filter value to the selected value
      this.filter.set(this.value() ?? '');
    }
  }
}
