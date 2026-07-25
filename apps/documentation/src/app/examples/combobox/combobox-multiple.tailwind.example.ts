import { Component, computed, ElementRef, signal, viewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown, heroXMark } from '@ng-icons/heroicons/outline';
import { heroCheckSolid } from '@ng-icons/heroicons/solid';
import {
  NgpCombobox,
  NgpComboboxButton,
  NgpComboboxDropdown,
  NgpComboboxInput,
  NgpComboboxOption,
  NgpComboboxPortal,
} from 'ng-primitives/combobox';

@Component({
  selector: 'app-combobox-multiple-example',
  imports: [
    NgpCombobox,
    NgpComboboxDropdown,
    NgpComboboxOption,
    NgpComboboxInput,
    NgpComboboxPortal,
    NgpComboboxButton,
    NgIcon,
  ],
  providers: [provideIcons({ heroChevronDown, heroXMark, heroCheckSolid })],
  template: `
    <!-- Combobox multiple with chips -->
    <div
      class="relative box-border flex min-h-[2.125rem] w-[300px] items-center justify-between rounded-lg border-none bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.1)] data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500 dark:bg-zinc-950 dark:shadow-[0_1px_2px_rgba(255,255,255,0.007),0_0_0_1px_rgba(255,255,255,0.1)] dark:data-focus:outline-blue-400"
      [(ngpComboboxValue)]="value"
      (ngpComboboxValueChange)="filter.set('')"
      (ngpComboboxOpenChange)="resetOnClose($event)"
      ngpComboboxMultiple
      ngpCombobox
    >
      <div class="flex w-full flex-wrap items-center" [class.py-1]="value().length > 0">
        @if (value().length > 0) {
          <div class="flex flex-wrap gap-0.5 pl-2">
            @for (selectedOption of value(); track selectedOption; let i = $index) {
              <div
                class="chip inline-flex max-w-[200px] items-center rounded-2xl border border-zinc-300 bg-zinc-100 py-0.5 pr-1.5 pl-2 text-xs/5 font-[510] text-zinc-900 transition-all duration-150 hover:bg-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                #chipElement
                [class.chip-focused]="focusedChipIndex() === i"
              >
                <span class="mr-1 overflow-hidden text-ellipsis whitespace-nowrap select-none">
                  {{ selectedOption }}
                </span>
                <button
                  class="chip-remove flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-sm/none text-zinc-600 opacity-60 transition-all duration-150 hover:bg-[#f01e2b] hover:text-white hover:opacity-100 focus:outline-2 focus:outline-offset-1 focus:outline-blue-500 dark:text-zinc-300 dark:hover:bg-[#ff4651] dark:focus:outline-blue-400"
                  [attr.aria-label]="'Remove ' + selectedOption"
                  (click)="removeOption(selectedOption)"
                  type="button"
                >
                  <ng-icon name="heroXMark" />
                </button>
              </div>
            }
          </div>
        }
        <input
          class="h-full [width:inherit] border-none bg-transparent px-4 text-[14px] text-zinc-900 outline-hidden placeholder:text-zinc-600 dark:text-zinc-100 dark:placeholder:text-zinc-300"
          #inputElement
          [class.py-2]="value().length > 0"
          [value]="filter()"
          (input)="onFilterChange($event)"
          (keydown)="onInputKeyDown($event)"
          placeholder="Select an option"
          ngpComboboxInput
        />
      </div>
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
        @for (option of filteredOptions(); track option) {
          <div
            class="box-border flex h-[2.125rem] w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-[14px] text-zinc-900 data-active:bg-zinc-100 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:text-zinc-100 dark:data-active:bg-zinc-800 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
            [ngpComboboxOptionValue]="option"
            ngpComboboxOption
          >
            {{ option }}
            @if (isSelected(option)) {
              <ng-icon class="ml-auto text-[#f01e2b]! dark:text-[#ff4651]!" name="heroCheckSolid" />
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
    /* The remove button restyles itself when its parent chip is focused. */
    .chip-focused .chip-remove {
      color: white;
      background-color: #f01e2b;
      opacity: 1;
    }

    :host-context(.dark) .chip-focused .chip-remove {
      background-color: #ff4651;
    }

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
export default class ComboboxMultipleExample {
  readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('inputElement');

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

  /** The selected values for multiple selection. */
  readonly value = signal<string[]>([]);

  /** The filter value. */
  readonly filter = signal<string>('');

  /** The index of the currently focused chip (-1 means no chip is focused). */
  readonly focusedChipIndex = signal<number>(-1);

  /** Get the filtered options. */
  protected readonly filteredOptions = computed(() =>
    this.options.filter(option => option.toLowerCase().includes(this.filter().toLowerCase())),
  );

  protected onFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filter.set(input.value);
    // Reset focused chip when user starts typing
    this.focusedChipIndex.set(-1);
  }

  protected onInputKeyDown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const currentValue = this.value();

    if (event.key === 'Backspace') {
      if (input.value === '' && currentValue.length > 0) {
        event.preventDefault();
        const currentFocusedIndex = this.focusedChipIndex();

        if (currentFocusedIndex === -1) {
          this.focusedChipIndex.set(currentValue.length - 1);
        } else {
          const optionToRemove = currentValue[currentFocusedIndex];
          this.removeOption(optionToRemove);
          // reset focused chip index and restore focus to input
          this.focusedChipIndex.set(-1);
          this.inputElement().nativeElement.focus();
        }
      } else {
        this.focusedChipIndex.set(-1);
      }
      return;
    }
    this.focusedChipIndex.set(-1);
  }

  protected resetOnClose(open: boolean): void {
    // if the dropdown is closed, reset the filter value and focused chip
    if (open) {
      return;
    }
    this.filter.set('');
    this.focusedChipIndex.set(-1);
  }

  protected isSelected(option: string): boolean {
    return this.value().includes(option);
  }

  protected removeOption(option: string): void {
    const currentValue = this.value();
    const updatedValue = currentValue.filter(item => item !== option);
    this.value.set(updatedValue);

    // Reset focused chip index after removal
    this.focusedChipIndex.set(-1);
  }
}
