import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  Directive,
  inject,
  Injector,
  input,
  output,
  signal,
} from '@angular/core';
import { ActiveDescendantItem, activeDescendantManager } from 'ng-primitives/a11y';
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

  /** Access the injector. */
  private readonly injector = inject(Injector);

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
  readonly compareWith = input<(a: T | undefined, b: T | undefined) => boolean>(Object.is, {
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
  readonly input = signal<NgpComboboxInput | undefined>(undefined);

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
  readonly options = signal<NgpComboboxOption<ComboboxValue<T>>[]>([]);

  /**
   * The open state of the combobox.
   * @internal
   */
  readonly open = computed(() => this.portal()?.viewRef() !== null);

  /**
   * The active descendant items.
   */
  private readonly activeDescendantItems = computed(() => {
    return this.options().map<ActiveDescendantItem>(option => ({
      id: option.id,
      disabled: option.disabled,
    }));
  });

  /**
   * The active key descendant manager.
   * @internal
   */
  readonly activeDescendantManager = activeDescendantManager({
    disabled: this.disabled,
    items: this.activeDescendantItems,
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

    this.openChange.emit(true);
    this.portal()?.attach();
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
  registerInput(input: NgpComboboxInput): void {
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

    this.options.set(options as NgpComboboxOption<ComboboxValue<T>>[]);
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
type ComboboxValue<T> = T extends Array<infer U> ? U : T;
