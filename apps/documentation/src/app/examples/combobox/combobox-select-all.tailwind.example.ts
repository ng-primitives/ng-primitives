import { Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown } from '@ng-icons/heroicons/outline';
import { heroCheckSolid, heroMinusSolid } from '@ng-icons/heroicons/solid';
import {
  NgpCombobox,
  NgpComboboxButton,
  NgpComboboxDropdown,
  NgpComboboxInput,
  NgpComboboxOption,
  NgpComboboxPortal,
} from 'ng-primitives/combobox';

@Component({
  selector: 'app-combobox-select-all',
  imports: [
    NgpCombobox,
    NgpComboboxDropdown,
    NgpComboboxOption,
    NgpComboboxInput,
    NgpComboboxPortal,
    NgpComboboxButton,
    NgIcon,
  ],
  providers: [provideIcons({ heroChevronDown, heroCheckSolid, heroMinusSolid })],
  template: `
    <div
      class="relative box-border flex h-[2.125rem] w-[300px] items-center justify-between rounded-lg border-none bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.1)] data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500 dark:bg-zinc-950 dark:shadow-[0_1px_2px_rgba(255,255,255,0.007),0_0_0_1px_rgba(255,255,255,0.1)] dark:data-focus:outline-blue-400"
      [(ngpComboboxValue)]="value"
      (ngpComboboxOpenChange)="resetOnClose($event)"
      ngpComboboxMultiple
      ngpCombobox
    >
      <input
        class="h-full flex-1 border-none bg-transparent px-4 text-[14px] text-zinc-900 outline-none dark:text-zinc-100"
        [value]="displayValue()"
        (input)="onFilterChange($event)"
        placeholder="Select options..."
        ngpComboboxInput
      />

      <button
        class="box-border inline-flex h-full w-9 cursor-pointer items-center justify-center border-none bg-transparent text-zinc-900 outline-none dark:text-zinc-100"
        ngpComboboxButton
        aria-label="Toggle dropdown"
      >
        <ng-icon class="size-4! text-[#f01e2b]! dark:text-[#ff4651]!" name="heroChevronDown" />
      </button>

      <div
        class="absolute left-0 z-1001 mt-1 box-border max-h-[240px] w-[300px] overflow-y-auto rounded-[12px] border border-gray-200 bg-white p-1 shadow-lg outline-hidden dark:border-zinc-800 dark:bg-zinc-950"
        *ngpComboboxPortal
        ngpComboboxDropdown
      >
        <!-- Select All Option -->
        <div
          class="box-border flex h-[2.125rem] w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 text-sm font-[590] tracking-[-0.006em] text-zinc-900 transition-colors hover:bg-zinc-100 data-active:bg-zinc-100 data-press:bg-zinc-100 data-selected:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-white/10 dark:data-active:bg-white/10 dark:data-press:bg-white/20 dark:data-selected:bg-white/10"
          ngpComboboxOptionValue="all"
          ngpComboboxOption
        >
          <span>Select All</span>
          @if (selectAllState() === 'all') {
            <ng-icon class="size-4! text-[#f01e2b]! dark:text-[#ff4651]!" name="heroCheckSolid" />
          } @else if (selectAllState() === 'some') {
            <ng-icon class="size-4! text-[#f01e2b]! dark:text-[#ff4651]!" name="heroMinusSolid" />
          }
        </div>

        <div class="my-1 h-px bg-black/10 dark:bg-zinc-800"></div>

        <!-- Regular Options -->
        @for (option of filteredOptions(); track option) {
          <div
            class="box-border flex h-[2.125rem] w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 text-sm tracking-[-0.006em] text-zinc-900 transition-colors hover:bg-zinc-100 data-active:bg-zinc-100 data-press:bg-zinc-100 data-selected:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-white/10 dark:data-active:bg-white/10 dark:data-press:bg-white/20 dark:data-selected:bg-white/10"
            [ngpComboboxOptionValue]="option"
            ngpComboboxOption
          >
            {{ option }}
            @if (isSelected(option)) {
              <ng-icon class="size-4! text-[#f01e2b]! dark:text-[#ff4651]!" name="heroCheckSolid" />
            }
          </div>
        } @empty {
          <div
            class="flex items-center justify-center p-2 text-center text-[14px] font-[510] text-zinc-600 dark:text-zinc-300"
          >
            No options found
          </div>
        }
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
export default class ComboboxSelectAllExample {
  /** The options for the combobox */
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

  /** The selected values */
  readonly value = signal<string[]>([]);

  /** The filter value */
  readonly filter = signal<string>('');

  /** Get the filtered options */
  protected readonly filteredOptions = computed(() =>
    this.filter()
      ? this.options.filter(option => option.toLowerCase().includes(this.filter().toLowerCase()))
      : this.options,
  );

  /** Get the display value for the input */
  protected readonly displayValue = computed(() => {
    const selected = this.value();
    if (selected.length === 0) {
      return '';
    }
    if (selected.length === 1) {
      return selected[0];
    }
    return `${selected.length} selected`;
  });

  /** Get the select all state */
  protected readonly selectAllState = computed(() => {
    const selected = this.value();
    const filtered = this.filteredOptions();

    if (filtered.length === 0) {
      return 'none';
    }

    const allSelected = filtered.every(option => selected.includes(option));
    const someSelected = filtered.some(option => selected.includes(option));

    if (allSelected) {
      return 'all';
    }
    if (someSelected) {
      return 'some';
    }
    return 'none';
  });

  /** Check if an option is selected */
  protected isSelected(option: string): boolean {
    return this.value().includes(option);
  }

  /** Handle filter change */
  protected onFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filter.set(input.value);
  }

  /** Reset filter when dropdown closes */
  protected resetOnClose(open: boolean): void {
    if (!open) {
      this.filter.set('');
    }
  }
}
