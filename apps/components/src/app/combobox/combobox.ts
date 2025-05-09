import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Component, computed, input, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
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
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

@Component({
  selector: 'app-combobox',
  imports: [
    NgpCombobox,
    NgpComboboxDropdown,
    NgpComboboxOption,
    NgpComboboxInput,
    NgpComboboxPortal,
    NgpComboboxButton,
    NgIcon,
  ],
  providers: [provideIcons({ heroChevronDown }), provideValueAccessor(Combobox)],
  template: `
    <div ngpCombobox>
      <input [value]="filter()" (input)="onFilterChange($event)" ngpComboboxInput />
      <button ngpComboboxButton>
        <ng-icon name="heroChevronDown" />
      </button>

      <div *ngpComboboxPortal ngpComboboxDropdown>
        @for (option of filteredOptions(); track option) {
          <div [ngpComboboxOptionValue]="option" ngpComboboxOption>
            {{ option }}
          </div>
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
      box-sizing: border-box;
      margin-top: 4px;
    }

    [ngpComboboxOption] {
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

    [ngpComboboxOption][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpComboboxOption][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpComboboxOption][data-active] {
      background-color: var(--ngp-background-active);
    }
  `,
})
export class Combobox implements ControlValueAccessor {
  /** The options for the combobox. */
  readonly options = input<string[]>([]);

  /** The selected value. */
  readonly value = input<string | undefined>();

  /** The disabled state of the combobox. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /** The filter value. */
  readonly filter = signal<string>('');

  /** Get the filtered options. */
  readonly filteredOptions = computed(() => {
    const filter = this.filter();

    // if the filter perfectly matches an option, return all options
    if (this.options().some(option => option === filter)) {
      return this.options();
    }

    // otherwise case insensitive filter
    return this.options().filter(option => option.toLowerCase().includes(filter.toLowerCase()));
  });

  /** The on change callback */
  private onChange?: ChangeFn<string>;

  /** The on touch callback */
  private onTouched?: TouchedFn;

  onFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filter.set(input.value);
  }

  writeValue(value: string): void {
    this.filter.set(value);
  }

  registerOnChange(fn: ChangeFn<string>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Todo
  }
}
