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
  selector: 'app-combobox-minimal',
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
      (ngpComboboxValueChange)="filter.set($event)"
      (ngpComboboxOpenChange)="resetOnClose($event)"
      ngpCombobox
    >
      <input
        [value]="filter()"
        (input)="onFilterChange($event)"
        placeholder="Select an option"
        ngpComboboxInput
      />

      <button ngpComboboxButton aria-label="Toggle dropdown">
        <ng-icon name="heroChevronDown" />
      </button>

      <div *ngpComboboxPortal ngpComboboxDropdown>
        @for (option of filteredOptions(); track option) {
          <div [ngpComboboxOptionValue]="option" ngpComboboxOption>
            {{ option }}
          </div>
        } @empty {
          <div class="empty-message">No options found</div>
        }
      </div>
    </div>
  `,
  styles: `
    [ngpComboboxDropdown] {
      background-color: white;
      position: absolute;
      width: var(--ngp-combobox-width);
      overflow-y: auto;
    }
  `,
})
export default class ComboboxExample {
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

  /** The filter value. */
  readonly filter = signal<string>('');

  /** Get the filtered options. */
  protected readonly filteredOptions = computed(() =>
    this.options.filter(option => option.toLowerCase().includes(this.filter().toLowerCase())),
  );

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
