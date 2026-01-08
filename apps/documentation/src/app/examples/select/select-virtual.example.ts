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
      [(ngpSelectValue)]="value"
      [ngpSelectScrollToOption]="scrollToOption"
      [ngpSelectOptions]="options"
      ngpSelect
    >
      @if (value(); as selectedValue) {
        <span class="select-value">{{ selectedValue }}</span>
      } @else {
        <span class="select-placeholder">Select from 10,000 options</span>
      }
      <ng-icon name="heroChevronDown" />

      <div *ngpSelectPortal ngpSelectDropdown>
        <div class="virtual-container" #scrollContainer>
          <div
            class="virtual-list"
            [style.height.px]="virtualizer.getTotalSize()"
            [style.position]="'relative'"
          >
            @for (virtualRow of virtualizer.getVirtualItems(); track virtualRow.index) {
              <div
                class="virtual-item"
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
    [ngpSelect] {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 36px;
      width: 400px;
      border-radius: 8px;
      border: none;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-input-shadow);
      box-sizing: border-box;
      cursor: pointer;
    }

    [ngpSelect][data-focus] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .select-value,
    .select-placeholder {
      display: flex;
      align-items: center;
      flex: 1;
      padding: 0 16px;
      background-color: transparent;
      color: var(--ngp-text-primary);
      font-family: inherit;
      font-size: 14px;
      height: 100%;
    }

    .select-placeholder {
      color: var(--ngp-text-tertiary);
    }

    ng-icon {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      margin-inline: 8px;
      font-size: 14px;
    }

    [ngpSelectDropdown] {
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      padding: 0;
      border-radius: 0.75rem;
      outline: none;
      position: absolute;
      animation: popover-show 0.1s ease-out;
      width: var(--ngp-select-width);
      box-shadow: var(--ngp-shadow-lg);
      box-sizing: border-box;
      margin-top: 4px;
      max-height: 300px;
      overflow: hidden;
      z-index: 1001;
      display: flex;
      flex-direction: column;
    }

    [ngpSelectDropdown][data-enter] {
      animation: select-show 0.1s ease-out;
    }

    [ngpSelectDropdown][data-exit] {
      animation: select-hide 0.1s ease-out;
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

    .virtual-item[data-selected] {
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

    @keyframes select-show {
      0% {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes select-hide {
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
