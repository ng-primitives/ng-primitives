import { Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown, heroPlus } from '@ng-icons/heroicons/outline';
import {
  NgpCombobox,
  NgpComboboxButton,
  NgpComboboxDropdown,
  NgpComboboxInput,
  NgpComboboxOption,
  NgpComboboxPortal,
} from 'ng-primitives/combobox';

@Component({
  selector: 'app-combobox-creatable-tailwind',
  imports: [
    NgpCombobox,
    NgpComboboxDropdown,
    NgpComboboxOption,
    NgpComboboxInput,
    NgpComboboxPortal,
    NgpComboboxButton,
    NgIcon,
  ],
  providers: [provideIcons({ heroChevronDown, heroPlus })],
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
        placeholder="Select or create an option"
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
        }

        <!--
          The "create" option is a regular option whose value is the current query.
          When the query matches no existing option it is the only item in the list,
          so it becomes the active descendant and is committed on Enter — no bespoke
          keyboard handling required. Selecting it routes through the standard
          selection path and emits the typed value via ngpComboboxValueChange.
        -->
        @if (canCreate()) {
          <div
            class="box-border flex h-[2.125rem] w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-sm tracking-[-0.006em] text-gray-500 transition-colors hover:bg-gray-100 data-active:bg-gray-100 data-press:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 dark:data-active:bg-white/10 dark:data-press:bg-white/20"
            [ngpComboboxOptionValue]="query()"
            ngpComboboxOption
          >
            <ng-icon name="heroPlus" class="text-base text-gray-400 dark:text-gray-500" />
            <span class="overflow-hidden text-ellipsis whitespace-nowrap">
              Create "{{ query() }}"
            </span>
          </div>
        }

        @if (filteredOptions().length === 0 && !canCreate()) {
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
export default class ComboboxCreatableExample {
  /** The options for the combobox — a writable signal so created values persist. */
  readonly options = signal<string[]>([
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
  ]);

  /** The selected value. */
  readonly value = signal<string | undefined>(undefined);

  /** The input value. */
  readonly inputValue = signal<string>('');

  /** The filter value. */
  readonly filter = signal<string>('');

  /** The normalised query — trimmed once so filtering, creating, and de-duping all agree. */
  protected readonly query = computed(() => this.filter().trim());

  /** Get the filtered options. */
  protected readonly filteredOptions = computed(() => {
    const query = this.query().toLowerCase();
    return this.options().filter(option => option.toLowerCase().includes(query));
  });

  /**
   * Whether the current query can be created as a new option — it must be non-empty
   * and not already exist (case-insensitive), so we never offer to create a duplicate.
   */
  protected readonly canCreate = computed(() => {
    const query = this.query();

    if (query === '') {
      return false;
    }

    return !this.options().some(option => option.toLowerCase() === query.toLowerCase());
  });

  protected onFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.inputValue.set(input.value);
    this.filter.set(input.value);
  }

  protected onValueChange(value: string | undefined): void {
    // If the committed value is a new one, add it to the list so it renders as a
    // real, selectable option going forward.
    if (value && !this.options().some(option => option.toLowerCase() === value.toLowerCase())) {
      this.options.update(options => [...options, value]);
    }

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
