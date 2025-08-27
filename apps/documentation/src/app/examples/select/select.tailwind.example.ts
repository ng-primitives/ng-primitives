import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown } from '@ng-icons/heroicons/outline';
import {
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectOption,
  NgpSelectPortal,
} from 'ng-primitives/select';

@Component({
  selector: 'app-select-tailwind',
  standalone: true,
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal, NgIcon],
  providers: [provideIcons({ heroChevronDown })],
  template: `
    <div
      class="flex h-9 w-[300px] items-center justify-between rounded-lg border border-gray-200 bg-white text-sm text-gray-900 outline-none data-[focus]:ring-2 data-[focus]:ring-blue-500 dark:border-gray-800 dark:bg-transparent dark:text-gray-50 dark:data-[focus]:ring-blue-400"
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
        class="absolute z-[1001] mt-1 max-h-[240px] w-[--ngp-select-width] overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg outline-none ring-1 ring-black/10 dark:border-gray-800 dark:bg-black dark:ring-white/10"
        *ngpSelectPortal
        ngpSelectDropdown
      >
        @for (option of options; track option) {
          <div
            class="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-sm text-gray-800 data-[active]:bg-gray-100 data-[hover]:bg-gray-50 data-[press]:bg-gray-100 dark:text-gray-300 dark:data-[active]:bg-white/10 dark:data-[hover]:bg-white/5 dark:data-[press]:bg-white/10"
            [ngpSelectOptionValue]="option"
            ngpSelectOption
          >
            {{ option }}
          </div>
        } @empty {
          <div
            class="flex items-center justify-center p-2 text-center text-sm font-medium text-gray-500"
          >
            No options found
          </div>
        }
      </div>
    </div>
  `,
})
export default class SelectTailwindExample {
  /** The options for the select. */
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
