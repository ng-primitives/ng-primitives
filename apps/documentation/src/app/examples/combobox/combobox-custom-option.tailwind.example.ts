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
  selector: 'app-combobox-custom-option',
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
      class="relative box-border flex h-[2.125rem] w-[300px] items-center justify-between rounded-lg border-none bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.1)] data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500 dark:bg-zinc-950 dark:shadow-[0_1px_2px_rgba(255,255,255,0.007),0_0_0_1px_rgba(255,255,255,0.1)] dark:data-focus:outline-blue-400"
      [(ngpComboboxValue)]="value"
      (ngpComboboxValueChange)="onValueChange($event)"
      (ngpComboboxOpenChange)="resetOnClose($event)"
      ngpCombobox
    >
      <input
        class="h-full flex-1 border-none bg-transparent px-4 text-[14px] text-zinc-900 outline-none dark:text-zinc-100"
        [value]="inputValue()"
        (input)="onFilterChange($event)"
        placeholder="Select an option"
        ngpComboboxInput
      />

      <button
        class="box-border inline-flex h-full w-9 cursor-pointer items-center justify-center border-none bg-transparent text-zinc-900 outline-none dark:text-zinc-100"
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
        <div
          class="box-border flex h-[2.125rem] w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-sm tracking-[-0.006em] text-zinc-600 italic transition-colors hover:bg-zinc-100 data-active:bg-zinc-100 data-press:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10 dark:data-active:bg-white/10 dark:data-press:bg-white/20"
          (ngpComboboxOptionActivated)="clear()"
          ngpComboboxOption
        >
          None
        </div>

        <div class="my-1 h-px bg-black/10 dark:bg-zinc-800"></div>

        @for (option of filteredOptions(); track option) {
          <div
            class="box-border flex h-[2.125rem] w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-sm tracking-[-0.006em] text-zinc-900 transition-colors hover:bg-zinc-100 data-active:bg-zinc-100 data-press:bg-zinc-100 data-selected:font-[510] data-selected:text-[#f01e2b] dark:text-zinc-100 dark:hover:bg-white/10 dark:data-active:bg-white/10 dark:data-press:bg-white/20 dark:data-selected:text-[#ff4651]"
            [ngpComboboxOptionValue]="option"
            ngpComboboxOption
          >
            {{ option }}
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
export default class ComboboxCustomOptionExample {
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

  /** Clear the selection. */
  clear(): void {
    this.value.set(undefined);
    this.inputValue.set('');
    this.filter.set('');
  }
}
