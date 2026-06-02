import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown } from '@ng-icons/heroicons/outline';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import {
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectOption,
  NgpSelectPortal,
} from 'ng-primitives/select';

@Component({
  selector: 'app-select-form-field-tailwind',
  standalone: true,
  imports: [
    NgpSelect,
    NgpSelectDropdown,
    NgpSelectOption,
    NgpSelectPortal,
    NgIcon,
    NgpFormField,
    NgpLabel,
    NgpDescription,
  ],
  providers: [provideIcons({ heroChevronDown })],
  template: `
    <div class="flex w-[300px] flex-col gap-[6px]" ngpFormField>
      <label class="text-sm font-[510] text-gray-800 dark:text-gray-100" ngpLabel>
        Choose a character
      </label>
      <p class="mb-1 text-xs text-gray-600 dark:text-gray-400" ngpDescription>
        Which character is your favorite?
      </p>

      <div
        class="flex h-[2.125rem] w-[300px] items-center justify-between rounded-lg border border-gray-200 bg-white text-sm tracking-[-0.006em] text-gray-900 outline-hidden data-focus:ring-2 data-focus:ring-blue-500 data-focus:outline-offset-2 dark:border-gray-800 dark:bg-transparent dark:text-gray-50 dark:data-focus:ring-blue-400"
        [(ngpSelectValue)]="value"
        ngpSelect
      >
        @if (value(); as value) {
          <span class="px-4">{{ value }}</span>
        } @else {
          <span class="px-4 text-gray-600 dark:text-gray-400">Select an option</span>
        }
        <ng-icon class="mx-2 h-full text-gray-500" name="heroChevronDown" />

        <div
          class="absolute z-1001 mt-1 max-h-[240px] w-[300px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg outline-hidden dark:border-gray-800 dark:bg-zinc-950"
          *ngpSelectPortal
          ngpSelectDropdown
        >
          @for (option of options; track option) {
            <div
              class="flex h-[2.125rem] w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-sm tracking-[-0.006em] text-gray-800 data-active:bg-gray-100 data-hover:bg-gray-50 data-press:bg-gray-100 data-selected:font-[510] data-selected:text-[#f01e2b] dark:text-gray-300 dark:data-active:bg-white/10 dark:data-hover:bg-white/5 dark:data-press:bg-white/10 dark:data-selected:text-[#ff4651]"
              [ngpSelectOptionValue]="option"
              ngpSelectOption
            >
              {{ option }}
            </div>
          } @empty {
            <div
              class="flex items-center justify-center p-2 text-center text-sm font-[510] text-gray-500"
            >
              No options found
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    [ngpSelectDropdown][data-enter] {
      animation: select-show 0.1s ease-out;
    }

    [ngpSelectDropdown][data-exit] {
      animation: select-hide 0.1s ease-out;
    }

    @keyframes select-show {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes select-hide {
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
export default class SelectFormFieldTailwindExample {
  /**
   * The options for the select.
   */
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

  /**
   * The selected value.
   */
  readonly value = signal<string | undefined>(undefined);
}
