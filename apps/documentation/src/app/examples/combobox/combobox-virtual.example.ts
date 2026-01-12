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
      [(ngpComboboxValue)]="value"
      [ngpComboboxScrollToOption]="scrollToOption"
      [ngpComboboxOptions]="filteredOptions()"
      (ngpComboboxValueChange)="filter.set($event)"
      (ngpComboboxOpenChange)="resetOnClose($event)"
      ngpCombobox
    >
      <input
        [value]="filter()"
        (input)="onFilterChange($event)"
        placeholder="Select from 10,000 options"
        ngpComboboxInput
      />

      <button ngpComboboxButton aria-label="Toggle dropdown">
        <ng-icon name="heroChevronDown" />
      </button>

      <div *ngpComboboxPortal ngpComboboxDropdown>
        @if (filteredOptions().length > 0) {
          <div class="virtual-container" #scrollContainer>
            <div
              class="virtual-list"
              [style.height.px]="virtualizer.getTotalSize()"
              [style.position]="'relative'"
            >
              @for (virtualRow of virtualizer.getVirtualItems(); track virtualRow.index) {
                <div
                  class="virtual-item"
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
          <div class="empty-message">No options found</div>
        }

        <div class="results-info">
          Showing {{ filteredOptions().length }} of {{ options.length }} results
        </div>
      </div>
    </div>
  `,
  styles: `
    [ngpCombobox] {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 36px;
      width: 300px;
      border-radius: 8px;
      border: none;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-input-shadow);
      box-sizing: border-box;
    }

    [ngpCombobox][data-focus] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpComboboxInput] {
      flex: 1;
      padding: 0 16px;
      border: none;
      background-color: transparent;
      color: var(--ngp-text);
      font-family: inherit;
      font-size: 14px;
      outline: none;
      height: 100%;
    }

    [ngpComboboxButton] {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 36px;
      background-color: transparent;
      border: none;
      color: var(--ngp-text);
      cursor: pointer;
      box-sizing: border-box;
    }

    [ngpComboboxDropdown] {
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      padding: 0;
      border-radius: 0.75rem;
      outline: none;
      position: absolute;
      animation: popover-show 0.1s ease-out;
      width: var(--ngp-combobox-width);
      box-shadow: var(--ngp-shadow-lg);
      box-sizing: border-box;
      margin-top: 4px;
      max-height: 300px;
      overflow: hidden;
      z-index: 1001;
      display: flex;
      flex-direction: column;
    }

    [ngpComboboxDropdown][data-enter] {
      animation: combobox-show 0.1s ease-out;
    }

    [ngpComboboxDropdown][data-exit] {
      animation: combobox-hide 0.1s ease-out;
    }

    .virtual-container {
      flex: 1;
      min-height: 0;
      overflow: auto;
      padding: 0.25rem;
      position: relative;
      height: 250px;
    }

    .virtual-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      cursor: pointer;
      border-radius: 0.5rem;
      width: 100%;
      height: 36px;
      font-size: 14px;
      color: var(--ngp-text-primary);
      box-sizing: border-box;
    }

    .virtual-item[data-hover] {
      background-color: var(--ngp-background-hover);
    }

    .virtual-item[data-press] {
      background-color: var(--ngp-background-active);
    }

    .virtual-item[data-active] {
      background-color: var(--ngp-background-active);
    }

    .empty-message {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
      color: var(--ngp-text-secondary);
      font-size: 14px;
      font-weight: 500;
      text-align: center;
    }

    .results-info {
      padding: 0.5rem 0.75rem;
      border-top: 1px solid var(--ngp-border);
      font-size: 12px;
      color: var(--ngp-text-secondary);
      background-color: var(--ngp-background-secondary);
      border-radius: 0 0 0.75rem 0.75rem;
    }

    @keyframes combobox-show {
      0% {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes combobox-hide {
      0% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      100% {
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
    this.filter.set(input.value);
  }

  protected resetOnClose(open: boolean): void {
    // if the dropdown is closed, reset the filter value
    if (open) {
      return;
    }

    // if the filter value is empty, set the value to undefined
    if (this.filter() === '') {
      this.value.set(undefined);
    } else {
      // otherwise set the filter value to the selected value
      this.filter.set(this.value() ?? '');
    }
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
