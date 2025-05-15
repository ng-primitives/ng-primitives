import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input, output, signal } from '@angular/core';
import { activeDescendantManager } from 'ng-primitives/a11y';
import { injectElementRef } from 'ng-primitives/internal';
import type { NgpComboboxButton } from '../combobox-button/combobox-button';
import type { NgpComboboxDropdown } from '../combobox-dropdown/combobox-dropdown';
import type { NgpComboboxInput } from '../combobox-input/combobox-input';
import { NgpComboboxOption } from '../combobox-option/combobox-option';
import type { NgpComboboxPortal } from '../combobox-portal/combobox-portal';
import { comboboxState, provideComboboxState } from './combobox-state';

@Directive({
  selector: '[ngpCombobox]',
  exportAs: 'ngpCombobox',
  providers: [provideComboboxState()],
  host: {
    '[attr.data-open]': 'state.open() ? "" : undefined',
    '[attr.data-disabled]': 'disabled() ? "" : undefined',
    '[attr.data-multiple]': 'multiple() ? "" : undefined',
  },
})
export class NgpCombobox<T> {
  /** Access the combobox element. */
  readonly elementRef = injectElementRef();

  /** The value of the combobox. */
  readonly value = input<T>(undefined, {
    alias: 'ngpComboboxValue',
  });

  /** Event emitted when the value changes. */
  readonly valueChange = output<T>({
    alias: 'ngpComboboxValueChange',
  });

  /** Whether the combobox is multiple selection. */
  readonly multiple = input<boolean, BooleanInput>(false, {
    alias: 'ngpComboboxMultiple',
    transform: booleanAttribute,
  });

  /** Whether the combobox is disabled. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpComboboxDisabled',
    transform: booleanAttribute,
  });

  /** Emit when the dropdown open state changes. */
  readonly openChange = output<boolean>({
    alias: 'ngpComboboxOpenChange',
  });

  /** The comparator function used to compare options. */
  readonly compareWith = input<
    (a: NgpComboboxValue<T> | undefined, b: NgpComboboxValue<T> | undefined) => boolean
  >(Object.is, {
    alias: 'ngpComboboxCompareWith',
  });

  /** The position of the dropdown. */
  readonly dropdownPosition = input<'top' | 'bottom' | 'auto'>('bottom', {
    alias: 'ngpComboboxDropdownPosition',
  });

  /**
   * Store the combobox input
   * @internal
   */
  readonly input = signal<NgpComboboxInput<T> | undefined>(undefined);

  /**
   * Store the combobox button.
   * @internal
   */
  readonly button = signal<NgpComboboxButton | undefined>(undefined);

  /**
   * Store the combobox portal.
   * @internal
   */
  readonly portal = signal<NgpComboboxPortal | undefined>(undefined);

  /**
   * Store the combobox dropdown.
   * @internal
   */
  readonly dropdown = signal<NgpComboboxDropdown | undefined>(undefined);

  /**
   * Store the combobox options.
   * @internal
   */
  readonly options = signal<NgpComboboxOption<NgpComboboxValue<T>>[]>([]);

  /**
   * The open state of the combobox.
   * @internal
   */
  readonly open = computed(() => this.portal()?.viewRef() !== null);

  /**
   * The active key descendant manager.
   * @internal
   */
  readonly activeDescendantManager = activeDescendantManager({
    disabled: this.disabled,
    items: this.options,
  });

  /** The state of the combobox. */
  protected readonly state = comboboxState<NgpCombobox<T>>(this);

  /**
   * Open the dropdown.
   * @internal
   */
  openDropdown(): void {
    if (this.state.disabled() || this.open()) {
      return;
    }

    this.portal()?.attach();

    // if there is a selected option(s), set the active descendant to the first selected option
    const selectedOption = this.options().find(option => this.isOptionSelected(option));

    // activate the selected option or the first option
    this.activeDescendantManager.activate(selectedOption ?? this.options()[0]);
  }

  /**
   * Close the dropdown.
   * @internal
   */
  closeDropdown(): void {
    if (!this.open()) {
      return;
    }

    this.openChange.emit(false);
    this.portal()?.detach();

    // clear the active descendant
    this.activeDescendantManager.reset();
  }

  /**
   * Toggle the dropdown.
   * @internal
   */
  toggleDropdown(): void {
    if (this.open()) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  /**
   * Select an option.
   * @param option The option to select.
   * @internal
   */
  selectOption<U>(option: NgpComboboxOption<U>): void {
    if (this.disabled() || this.isOptionSelected(option)) {
      return;
    }

    if (this.multiple()) {
      const value = [...(this.value() as T[]), option.value() as T];

      // add the option to the value
      this.state.value.set(value as T);
      this.valueChange.emit(value as T);
    } else {
      this.state.value.set(option.value() as T);
      this.valueChange.emit(option.value() as T);

      // close the dropdown on single selection
      this.closeDropdown();
    }
  }

  /**
   * Deselect an option.
   * @param option The option to deselect.
   * @internal
   */
  deselectOption<U>(option: NgpComboboxOption<U>): void {
    // if the combobox is disabled or the option is not selected, do nothing
    // if the combobox is single selection, we don't allow deselecting
    if (this.disabled() || !this.isOptionSelected(option) || !this.multiple()) {
      return;
    }

    const values = (this.value() as NgpComboboxValue<T>[]) ?? [];

    const newValue = values.filter(
      v => !this.compareWith()(v, option.value() as NgpComboboxValue<T>),
    );

    // remove the option from the value
    this.state.value.set(newValue as T);
    this.valueChange.emit(newValue as T);
  }

  /**
   * Toggle the selection of an option.
   * @param option The option to toggle.
   * @internal
   */
  toggleOption<U>(option: NgpComboboxOption<U>): void {
    if (this.disabled()) {
      return;
    }

    if (this.isOptionSelected(option)) {
      this.deselectOption(option);
    } else {
      this.selectOption(option);
    }
  }

  /**
   * Determine if an option is selected.
   * @param option The option to check.
   * @internal
   */
  isOptionSelected<U>(option: NgpComboboxOption<U>): boolean {
    if (this.disabled()) {
      return false;
    }

    const value = this.value();

    if (!value) {
      return false;
    }

    if (this.multiple()) {
      return (
        value &&
        (value as NgpComboboxValue<T>[]).some(v =>
          this.compareWith()(option.value() as NgpComboboxValue<T>, v),
        )
      );
    }

    return this.compareWith()(option.value() as NgpComboboxValue<T>, value as NgpComboboxValue<T>);
  }

  /**
   * Register the dropdown portal with the combobox.
   * @param portal The dropdown portal.
   * @internal
   */
  registerPortal(portal: NgpComboboxPortal): void {
    this.portal.set(portal);
  }

  /**
   * Register the combobox input with the combobox.
   * @param input The combobox input.
   * @internal
   */
  registerInput(input: NgpComboboxInput<T>): void {
    this.input.set(input);
  }

  /**
   * Register the combobox button with the combobox.
   * @param button The combobox button.
   * @internal
   */
  registerButton(button: NgpComboboxButton): void {
    this.button.set(button);
  }

  /**
   * Register the dropdown with the combobox.
   * @param dropdown The dropdown to register.
   * @internal
   */
  registerDropdown(dropdown: NgpComboboxDropdown): void {
    this.dropdown.set(dropdown);
  }

  /**
   * Register an option with the combobox.
   * @param option The option to register.
   * @internal
   */
  registerOption<U>(option: NgpComboboxOption<U>): void {
    const options = [...this.options(), option] as NgpComboboxOption<U>[];

    // sort the options based on their order in the DOM
    options.sort((a, b) =>
      a.elementRef.nativeElement.compareDocumentPosition(b.elementRef.nativeElement) &
      Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1,
    );

    this.options.set(options as NgpComboboxOption<NgpComboboxValue<T>>[]);
  }

  /**
   * Unregister an option from the combobox.
   * @param option The option to unregister.
   * @internal
   */
  unregisterOption<T>(option: NgpComboboxOption<T>): void {
    this.options.update(options => options.filter(o => o !== option));
  }
}

// T may be an array of values, we want to get the type of the first element
export type NgpComboboxValue<T> = T extends Array<infer U> ? U : T;
