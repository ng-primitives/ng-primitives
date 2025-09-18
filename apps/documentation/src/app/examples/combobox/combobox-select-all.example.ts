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
      [(ngpComboboxValue)]="value"
      (ngpComboboxOpenChange)="resetOnClose($event)"
      ngpComboboxMultiple
      ngpCombobox
    >
      <input
        [value]="displayValue()"
        (input)="onFilterChange($event)"
        placeholder="Select options..."
        ngpComboboxInput
      />

      <button ngpComboboxButton aria-label="Toggle dropdown">
        <ng-icon name="heroChevronDown" />
      </button>

      <div *ngpComboboxPortal ngpComboboxDropdown>
        <!-- Select All Option -->
        <div class="select-all-option" ngpComboboxOptionValue="all" ngpComboboxOption>
          <span>Select All</span>
          @if (selectAllState() === 'all') {
            <ng-icon name="heroCheckSolid" />
          } @else if (selectAllState() === 'some') {
            <ng-icon name="heroMinusSolid" />
          }
        </div>

        <div class="divider"></div>

        <!-- Regular Options -->
        @for (option of filteredOptions(); track option) {
          <div [ngpComboboxOptionValue]="option" ngpComboboxOption>
            {{ option }}
            @if (isSelected(option)) {
              <ng-icon name="heroCheckSolid" />
            }
          </div>
        } @empty {
          <div class="empty-message">No options found</div>
        }
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
      padding: 0 16px;
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
      padding: 0.25rem;
      border-radius: 0.75rem;
      outline: none;
      position: absolute;
      animation: popover-show 0.1s ease-out;
      width: var(--ngp-combobox-width);
      box-shadow: var(--ngp-shadow-lg);
      box-sizing: border-box;
      margin-top: 4px;
      max-height: 240px;
      overflow-y: auto;
      z-index: 1001;
    }

    [ngpComboboxDropdown][data-enter] {
      animation: combobox-show 0.1s ease-out;
    }

    [ngpComboboxDropdown][data-exit] {
      animation: combobox-hide 0.1s ease-out;
    }

    [ngpComboboxOption] {
      display: flex;
      align-items: center;
      justify-content: space-between;
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

    [ngpComboboxOption][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpComboboxOption][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpComboboxOption][data-active] {
      background-color: var(--ngp-background-active);
    }

    [ngpComboboxOption][data-selected] {
      background-color: var(--ngp-background-active);
    }

    .select-all-option {
      font-weight: 600;
    }

    .divider {
      height: 1px;
      background-color: var(--ngp-border);
      margin: 0.25rem 0;
    }

    .empty-message {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0.5rem;
      color: var(--ngp-text-secondary);
      font-size: 14px;
      font-weight: 500;
      text-align: center;
    }

    ng-icon {
      width: 16px;
      height: 16px;
      color: var(--ngp-primary);
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
