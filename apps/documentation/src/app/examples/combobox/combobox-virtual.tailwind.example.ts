import { Component, computed, ElementRef, signal, viewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown } from '@ng-icons/heroicons/outline';
import { injectVirtualizer } from '@tanstack/angular-virtual';
import {
  NgpCombobox,
  NgpComboboxButton,
  NgpComboboxDropdown,
  NgpComboboxInput,
  NgpComboboxOption,
  NgpComboboxPortal,
} from 'ng-primitives/combobox';

@Component({
  selector: 'app-combobox-virtual',
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
      class="relative box-border flex h-[2.125rem] w-[300px] items-center justify-between rounded-lg border border-gray-200 bg-white transition-colors data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500 dark:border-gray-700 dark:bg-transparent dark:data-focus:outline-blue-400"
      [(ngpComboboxValue)]="value"
      [ngpComboboxScrollToOption]="scrollToOption"
      [ngpComboboxOptions]="filteredOptions()"
      (ngpComboboxValueChange)="onValueChange($event)"
      (ngpComboboxOpenChange)="resetOnClose($event)"
      ngpCombobox
    >
      <input
        class="font-inherit h-full flex-1 border-none bg-transparent px-4 text-[14px] text-gray-900 outline-hidden focus:ring-0 dark:bg-transparent dark:text-gray-100"
        [value]="inputValue()"
        (input)="onFilterChange($event)"
        placeholder="Select from 10,000 options"
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
        class="absolute left-0 z-1001 mt-1 box-border flex max-h-[300px] w-[300px] flex-col overflow-hidden rounded-[12px] border border-gray-200 bg-white p-0 shadow-lg outline-hidden dark:border-zinc-800 dark:bg-zinc-950"
        *ngpComboboxPortal
        ngpComboboxDropdown
      >
        @if (filteredOptions().length > 0) {
          <div class="relative h-[250px] min-h-0 flex-1 overflow-auto p-1" #scrollContainer>
            <div [style.height.px]="virtualizer.getTotalSize()" [style.position]="'relative'">
              @for (virtualRow of virtualizer.getVirtualItems(); track virtualRow.index) {
                <div
                  class="box-border flex h-[2.125rem] w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-sm tracking-[-0.006em] text-gray-900 transition-colors hover:bg-gray-100 data-active:bg-gray-100 data-press:bg-gray-100 data-selected:font-[510] data-selected:text-[#f01e2b] dark:text-gray-100 dark:hover:bg-white/10 dark:data-active:bg-white/10 dark:data-press:bg-white/20 dark:data-selected:text-[#ff4651]"
                  [ngpComboboxOptionValue]="filteredOptions()[virtualRow.index]"
                  [style.position]="'absolute'"
                  [style.top.px]="virtualRow.start"
                  [style.left]="'0'"
                  [style.width]="'100%'"
                  [style.height.px]="virtualRow.size"
                  [ngpComboboxOptionIndex]="virtualRow.index"
                  ngpComboboxOption
                >
                  {{ filteredOptions()[virtualRow.index] }}
                </div>
              }
            </div>
          </div>
        } @else {
          <div
            class="flex items-center justify-center p-4 text-center text-sm font-[510] text-gray-600 dark:text-gray-300"
          >
            No options found
          </div>
        }

        <div
          class="rounded-b-xl border-t border-black/10 bg-gray-300 px-3 py-2 text-xs text-gray-600 dark:border-zinc-800 dark:bg-gray-700 dark:text-gray-300"
        >
          Showing {{ filteredOptions().length }} of {{ options.length }} results
        </div>
      </div>
    </div>
  `,
  styles: `
    [ngpComboboxDropdown][data-enter] {
      animation: combobox-show 0.1s ease-out;
    }

    [ngpComboboxDropdown][data-exit] {
      animation: combobox-hide 0.1s ease-out;
    }

    @keyframes combobox-show {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes combobox-hide {
      from {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
      }
    }
  `,
})
export default class ComboboxVirtualExample {
  /** The options for the combobox - 10,000 generated names. */
  readonly options: string[] = generateLargeDataset(10000);

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

  /** The scroll container element reference. */
  readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  /** The virtualizer instance. */
  readonly virtualizer = injectVirtualizer(() => ({
    count: this.filteredOptions().length,
    scrollElement: this.scrollContainer(),
    estimateSize: () => 36,
    overscan: 5,
  }));

  /** A custom scroll to option function. */
  protected readonly scrollToOption = (index: number) => {
    this.virtualizer.scrollToIndex(index, { behavior: 'auto', align: 'auto' });
  };

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

// Generate a large dataset to showcase virtualization
function generateLargeDataset(count: number): string[] {
  const firstNames = [
    'James',
    'Mary',
    'John',
    'Patricia',
    'Robert',
    'Jennifer',
    'Michael',
    'Linda',
    'William',
    'Elizabeth',
    'David',
    'Barbara',
    'Richard',
    'Susan',
    'Joseph',
    'Jessica',
    'Thomas',
    'Sarah',
    'Christopher',
    'Karen',
    'Charles',
    'Nancy',
    'Daniel',
    'Lisa',
    'Matthew',
    'Betty',
    'Anthony',
    'Helen',
    'Mark',
    'Sandra',
    'Donald',
    'Donna',
    'Steven',
    'Carol',
    'Paul',
    'Ruth',
    'Andrew',
    'Sharon',
    'Joshua',
    'Michelle',
    'Kenneth',
    'Laura',
    'Kevin',
    'Emily',
    'Brian',
    'Kimberly',
    'George',
    'Deborah',
    'Edward',
    'Dorothy',
    'Ronald',
    'Amy',
    'Timothy',
    'Angela',
    'Jason',
    'Ashley',
    'Jeffrey',
    'Brenda',
    'Ryan',
    'Emma',
    'Jacob',
    'Olivia',
    'Gary',
    'Cynthia',
  ];

  const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Garcia',
    'Miller',
    'Davis',
    'Rodriguez',
    'Martinez',
    'Hernandez',
    'Lopez',
    'Gonzalez',
    'Wilson',
    'Anderson',
    'Thomas',
    'Taylor',
    'Moore',
    'Jackson',
    'Martin',
    'Lee',
    'Perez',
    'Thompson',
    'White',
    'Harris',
    'Sanchez',
    'Clark',
    'Ramirez',
    'Lewis',
    'Robinson',
    'Walker',
    'Young',
    'Allen',
    'King',
    'Wright',
    'Scott',
    'Torres',
    'Nguyen',
    'Hill',
    'Flores',
    'Green',
    'Adams',
    'Nelson',
    'Baker',
    'Hall',
    'Rivera',
    'Campbell',
    'Mitchell',
    'Carter',
    'Roberts',
    'Gomez',
    'Phillips',
    'Evans',
    'Turner',
    'Diaz',
    'Parker',
    'Cruz',
    'Edwards',
    'Collins',
    'Reyes',
    'Stewart',
    'Morris',
    'Morales',
    'Murphy',
  ];

  const options: string[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const id = String(i + 1).padStart(4, '0');
    options.push(`${firstName} ${lastName} (#${id})`);
  }
  return options;
}
