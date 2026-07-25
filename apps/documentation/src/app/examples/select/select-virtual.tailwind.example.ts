import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown } from '@ng-icons/heroicons/outline';
import { injectVirtualizer } from '@tanstack/angular-virtual';
import {
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectOption,
  NgpSelectPortal,
} from 'ng-primitives/select';

@Component({
  selector: 'app-select-virtual',
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal, NgIcon],
  providers: [provideIcons({ heroChevronDown })],
  template: `
    <div
      class="flex h-[2.125rem] w-[300px] cursor-pointer items-center justify-between rounded-lg border-none bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.1)] outline-none data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500 dark:bg-zinc-950 dark:shadow-[0_1px_2px_rgba(255,255,255,0.007),0_0_0_1px_rgba(255,255,255,0.1)] dark:data-focus:outline-blue-400"
      [(ngpSelectValue)]="value"
      [ngpSelectScrollToOption]="scrollToOption"
      [ngpSelectOptions]="options"
      ngpSelect
    >
      @if (value(); as selectedValue) {
        <span
          class="flex h-full flex-1 items-center bg-transparent px-4 text-[14px] text-zinc-900 dark:text-zinc-100"
        >
          {{ selectedValue }}
        </span>
      } @else {
        <span
          class="flex h-full flex-1 items-center bg-transparent px-4 text-[14px] text-zinc-500 dark:text-zinc-400"
        >
          Select from 10,000 options
        </span>
      }
      <ng-icon
        class="mx-2 inline-flex! h-full! items-center justify-center text-[14px]"
        name="heroChevronDown"
      />

      <div
        class="absolute z-1001 mt-1 flex max-h-[300px] w-(--ngp-select-width) flex-col overflow-hidden rounded-xl border border-black/10 bg-white p-0 shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-950"
        *ngpSelectPortal
        ngpSelectDropdown
      >
        <div class="relative h-[250px] min-h-0 flex-1 overflow-auto p-1" #scrollContainer>
          <div [style.height.px]="virtualizer.getTotalSize()" [style.position]="'relative'">
            @for (virtualRow of virtualizer.getVirtualItems(); track virtualRow.index) {
              <div
                class="flex h-[2.125rem] w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-[14px] text-zinc-900 data-active:bg-zinc-100 data-hover:bg-zinc-50 data-press:bg-zinc-100 data-selected:font-[510] data-selected:text-[#f01e2b] dark:text-zinc-100 dark:data-active:bg-zinc-800 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800 dark:data-selected:text-[#ff4651]"
                [ngpSelectOptionValue]="options[virtualRow.index]"
                [style.position]="'absolute'"
                [style.top.px]="virtualRow.start"
                [style.left]="'0'"
                [style.width]="'100%'"
                [style.height.px]="virtualRow.size"
                [ngpSelectOptionIndex]="virtualRow.index"
                ngpSelectOption
              >
                {{ options[virtualRow.index] }}
              </div>
            }
          </div>
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
export default class SelectVirtualExample {
  /** The options for the select - 10,000 generated names. */
  readonly options: string[] = generateLargeDataset(10000);

  /** The selected value. */
  readonly value = signal<string | undefined>(undefined);

  /** The scroll container element reference. */
  readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  /** The virtualizer instance. */
  readonly virtualizer = injectVirtualizer(() => ({
    count: this.options.length,
    scrollElement: this.scrollContainer(),
    estimateSize: () => 36,
    overscan: 5,
  }));

  /** A custom scroll to option function. */
  protected readonly scrollToOption = (index: number) => {
    this.virtualizer.scrollToIndex(index, { behavior: 'auto', align: 'auto' });
  };
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
