import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown } from '@ng-icons/heroicons/outline';
import {
  NgpCombobox,
  NgpComboboxButton,
  NgpComboboxDropdown,
  NgpComboboxOption,
  NgpComboboxPortal,
} from 'ng-primitives/combobox';

@Component({
  selector: 'app-combobox-button',
  imports: [
    NgpCombobox,
    NgpComboboxDropdown,
    NgpComboboxOption,
    NgpComboboxPortal,
    NgpComboboxButton,
    NgIcon,
  ],
  providers: [provideIcons({ heroChevronDown })],
  template: `
    <div
      class="inline-block w-[300px] focus-within:rounded-lg focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-500 dark:focus-within:outline-blue-400"
      [(ngpComboboxValue)]="value"
      ngpCombobox
    >
      <button
        class="box-border flex h-[2.125rem] w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-4 text-[14px] text-gray-900 transition-all duration-200 hover:bg-gray-50 aria-expanded:bg-gray-100 dark:border-gray-700 dark:bg-transparent dark:text-gray-100 dark:hover:bg-zinc-900 dark:aria-expanded:bg-zinc-800"
        ngpComboboxButton
      >
        {{ value() || 'Select a character' }}
        <ng-icon class="h-4 w-4 transition-transform duration-200" name="heroChevronDown" />
      </button>

      <div
        class="absolute z-1001 mt-1 box-border max-h-[240px] w-[300px] origin-(--ngp-combobox-transform-origin) overflow-y-auto rounded-[12px] border border-gray-200 bg-white p-1 shadow-lg outline-hidden dark:border-zinc-800 dark:bg-zinc-950"
        *ngpComboboxPortal
        ngpComboboxDropdown
      >
        @for (option of options; track option) {
          <div
            class="box-border flex h-[2.125rem] w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-sm tracking-[-0.006em] text-gray-900 transition-colors hover:bg-gray-100 data-active:bg-gray-100 data-press:bg-gray-100 data-selected:font-[510] data-selected:text-[#f01e2b] dark:text-gray-100 dark:hover:bg-white/10 dark:data-active:bg-white/10 dark:data-press:bg-white/20 dark:data-selected:text-[#ff4651]"
            [ngpComboboxOptionValue]="option"
            ngpComboboxOption
          >
            {{ option }}
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    /* The chevron reacts to the button's expanded state, which lives on the parent. */
    [ngpComboboxButton][aria-expanded='true'] ng-icon {
      transform: rotate(180deg);
    }

    [ngpComboboxDropdown][data-enter] {
      animation: dropdown-show 0.15s ease-out;
    }

    [ngpComboboxDropdown][data-exit] {
      animation: dropdown-hide 0.15s ease-in;
    }

    @keyframes dropdown-show {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes dropdown-hide {
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
export default class ComboboxButtonExample {
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
}
