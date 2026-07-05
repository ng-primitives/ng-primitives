import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Component, computed, input, model, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import {
  NgpCombobox,
  NgpComboboxButton,
  NgpComboboxDropdown,
  NgpComboboxInput,
  NgpComboboxOption,
  NgpComboboxPortal,
} from 'ng-primitives/combobox';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

/**
 * Inline fixture mirroring the real reusable combobox component at
 * `apps/components/.../reusable-components/combobox/combobox.ts`. It exposes the combobox as a form
 * control via a `ControlValueAccessor`. Used by the reusable-component test suites.
 */
@Component({
  selector: 'app-combobox',
  imports: [
    NgpCombobox,
    NgpComboboxDropdown,
    NgpComboboxOption,
    NgpComboboxInput,
    NgpComboboxPortal,
    NgpComboboxButton,
  ],
  providers: [provideValueAccessor(ComboboxFixture)],
  template: `
    <div
      [(ngpComboboxValue)]="value"
      [ngpComboboxDisabled]="disabled() || formDisabled()"
      (ngpComboboxOpenChange)="resetOnClose($event)"
      (ngpComboboxValueChange)="onValueChange($event)"
      ngpCombobox
      data-testid="combobox"
    >
      <input
        [value]="filter()"
        [placeholder]="placeholder()"
        (input)="onFilterChange($event)"
        (blur)="onTouched?.()"
        ngpComboboxInput
        data-testid="combobox-input"
      />

      <button ngpComboboxButton aria-label="Toggle dropdown" data-testid="combobox-button">
        ▼
      </button>

      <div *ngpComboboxPortal ngpComboboxDropdown>
        @for (option of filteredOptions(); track option) {
          <div [ngpComboboxOptionValue]="option" ngpComboboxOption>
            {{ option }}
          </div>
        } @empty {
          <div class="empty-message" data-testid="empty-message">No options found</div>
        }
      </div>
    </div>
  `,
})
export class ComboboxFixture implements ControlValueAccessor {
  /** The options for the combobox. */
  readonly options = input<string[]>([]);

  /** The selected value. */
  readonly value = model<string | undefined>();

  /** The placeholder for the input. */
  readonly placeholder = input<string>('');

  /** The disabled state of the combobox. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /** The filter value. */
  protected readonly filter = signal<string>('');

  /** Get the filtered options. */
  protected readonly filteredOptions = computed(() =>
    this.options().filter(option => option.toLowerCase().includes(this.filter().toLowerCase())),
  );

  /** Store the form disabled state */
  protected readonly formDisabled = signal(false);

  /** The on change callback */
  private onChange?: ChangeFn<string | undefined>;

  /** The on touch callback */
  protected onTouched?: TouchedFn;

  onFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filter.set(input.value);
  }

  writeValue(value: string | undefined): void {
    this.value.set(value);
    this.filter.set(value ?? '');
  }

  registerOnChange(fn: ChangeFn<string | undefined>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected onValueChange(value: string): void {
    this.onChange?.(value);
    // update the filter value
    this.filter.set(value);
  }

  protected resetOnClose(open: boolean): void {
    // if the dropdown is closed, reset the filter value
    if (open) {
      return;
    }

    // if the filter value is empty, clear the value and notify the form control
    if (this.filter() === '') {
      this.value.set(undefined);
      this.onChange?.(undefined);
    } else {
      // otherwise set the filter value to the selected value
      this.filter.set(this.value() ?? '');
    }
  }
}
