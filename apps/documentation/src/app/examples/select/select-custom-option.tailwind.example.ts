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
  selector: 'app-select-custom-option',
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal, NgIcon],
  providers: [provideIcons({ heroChevronDown })],
  template: `
    <div
      class="flex h-[2.125rem] w-[300px] items-center justify-between rounded-lg border-none bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.1)] outline-none data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500 dark:bg-zinc-950 dark:shadow-[0_1px_2px_rgba(255,255,255,0.007),0_0_0_1px_rgba(255,255,255,0.1)] dark:data-focus:outline-blue-400"
      [(ngpSelectValue)]="value"
      ngpSelect
    >
      @if (value(); as value) {
        <span
          class="flex h-full flex-1 items-center bg-transparent px-4 text-[14px] text-zinc-900 dark:text-zinc-100"
        >
          {{ value }}
        </span>
      } @else {
        <span
          class="flex h-full flex-1 items-center bg-transparent px-4 text-[14px] text-zinc-600 dark:text-zinc-300"
        >
          Select an option
        </span>
      }
      <ng-icon
        class="mx-2 inline-flex! h-full! items-center justify-center text-[14px]"
        name="heroChevronDown"
      />

      <div
        class="absolute z-1001 mt-1 max-h-[240px] w-(--ngp-select-width) overflow-y-auto rounded-xl border border-black/10 bg-white p-1 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
        *ngpSelectPortal
        ngpSelectDropdown
      >
        <div
          class="flex h-[2.125rem] w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-sm tracking-[-0.006em] text-zinc-600 italic data-active:bg-zinc-100 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:text-zinc-400 dark:data-active:bg-white/10 dark:data-hover:bg-white/5 dark:data-press:bg-white/10"
          (ngpSelectOptionActivated)="clear()"
          ngpSelectOption
        >
          None
        </div>

        <div class="my-1 h-px bg-black/10 dark:bg-zinc-800"></div>

        @for (option of options; track option) {
          <div
            class="flex h-[2.125rem] w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-[14px] text-zinc-900 data-active:bg-zinc-100 data-hover:bg-zinc-50 data-press:bg-zinc-100 data-selected:font-[510] data-selected:text-[#f01e2b] dark:text-zinc-100 dark:data-active:bg-zinc-800 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800 dark:data-selected:text-[#ff4651]"
            [ngpSelectOptionValue]="option"
            ngpSelectOption
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
export default class SelectCustomOptionExample {
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

  /** Clear the selection. */
  clear(): void {
    this.value.set(undefined);
  }
}
