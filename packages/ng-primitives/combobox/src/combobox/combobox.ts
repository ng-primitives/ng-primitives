import { BooleanInput } from '@angular/cdk/coercion';
import {
  afterNextRender,
  booleanAttribute,
  computed,
  Directive,
  inject,
  Injector,
  input,
  output,
  signal,
} from '@angular/core';
import { Placement } from '@floating-ui/dom';
import { activeDescendantManager } from 'ng-primitives/a11y';
import {
  explicitEffect,
  injectElementRef,
  provideExitAnimationManager,
} from 'ng-primitives/internal';
import type { NgpComboboxButton } from '../combobox-button/combobox-button';
import type { NgpComboboxDropdown } from '../combobox-dropdown/combobox-dropdown';
import type { NgpComboboxInput } from '../combobox-input/combobox-input';
import { NgpComboboxOption } from '../combobox-option/combobox-option';
import type { NgpComboboxPortal } from '../combobox-portal/combobox-portal';
import { comboboxState, provideComboboxState } from './combobox-state';

/**
 * Ideally we would use a generic type here, unfortunately, unlike in React,
 * we cannot infer the type based on another input. For example, if multiple
 * is true, we cannot infer that the value is an array of T. Using a union
 * type is not ideal either because it requires the user to handle multiple cases.
 * Using a generic also isn't ideal because we need to use T as both an array and
 * a single value.
 *
 * Any seems to be used by Angular Material, ng-select, and other libraries
 * so we will use it here as well.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type T = any;

@Directive({
  selector: '[ngpCombobox]',
  exportAs: 'ngpCombobox',
  providers: [provideComboboxState(), provideExitAnimationManager()],
  host: {
    '[attr.data-open]': 'state.open() ? "" : undefined',
    '[attr.data-disabled]': 'state.disabled() ? "" : undefined',
    '[attr.data-multiple]': 'state.multiple() ? "" : undefined',
  },
})
export class NgpCombobox {
  /** @internal Access the combobox element. */
  readonly elementRef = injectElementRef();

  /** Access the injector. */
  protected readonly injector = inject(Injector);

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
  readonly placement = input<Placement>('bottom', {
    alias: 'ngpComboboxDropdownPlacement',
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
  readonly options = signal<NgpComboboxOption[]>([]);

  /**
   * Access the overlay
   * @internal
   */
  readonly overlay = computed(() => this.portal()?.overlay());

  /**
   * The open state of the combobox.
   * @internal
   */
  readonly open = computed(() => this.overlay()?.isOpen() ?? false);

  /**
   * The active key descendant manager.
   * @internal
   */
  readonly activeDescendantManager = activeDescendantManager({
    // we must wrap the signal in a computed to ensure it is not used before it is defined
    disabled: computed(() => this.state.disabled()),
    items: this.options,
  });

  /** The state of the combobox. */
  protected readonly state = comboboxState<NgpCombobox>(this);

  constructor() {
    // any time the active descendant changes, ensure we scroll it into view
    explicitEffect([this.activeDescendantManager.activeItem], ([option]) =>
      // perform after next render to ensure the DOM is updated
      // e.g. the dropdown is open before the option is scrolled into view
      afterNextRender({ write: () => option?.scrollIntoView?.() }, { injector: this.injector }),
    );
  }

  /**
   * Open the dropdown.
   * @internal
   */
  async openDropdown(): Promise<void> {
    if (this.state.disabled() || this.open()) {
      return;
    }

    await this.portal()?.show();

    // if there is a selected option(s), set the active descendant to the first selected option
    const selectedOption = this.options().find(option => this.isOptionSelected(option));

    // if there is no selected option, set the active descendant to the first option
    const targetOption = selectedOption ?? this.options()[0];

    // if there is no target option, do nothing
    if (!targetOption) {
      return;
    }

    // activate the selected option or the first option
    this.activeDescendantManager.activate(targetOption);
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
  selectOption(option: NgpComboboxOption): void {
    if (this.state.disabled()) {
      return;
    }

    if (this.state.multiple()) {
      // if the option is already selected, do nothing
      if (this.isOptionSelected(option)) {
        return;
      }

      const value = [...(this.state.value() as T[]), option.value() as T];

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
  deselectOption(option: NgpComboboxOption): void {
    // if the combobox is disabled or the option is not selected, do nothing
    // if the combobox is single selection, we don't allow deselecting
    if (this.state.disabled() || !this.isOptionSelected(option) || !this.state.multiple()) {
      return;
    }

    const values = (this.state.value() as T[]) ?? [];

    const newValue = values.filter(v => !this.state.compareWith()(v, option.value() as T));

    // remove the option from the value
    this.state.value.set(newValue as T);
    this.valueChange.emit(newValue as T);
  }

  /**
   * Toggle the selection of an option.
   * @param option The option to toggle.
   * @internal
   */
  toggleOption(option: NgpComboboxOption): void {
    if (this.state.disabled()) {
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
  isOptionSelected(option: NgpComboboxOption): boolean {
    if (this.state.disabled()) {
      return false;
    }

    const value = this.state.value();

    if (!value) {
      return false;
    }

    if (this.state.multiple()) {
      return value && (value as T[]).some(v => this.state.compareWith()(option.value(), v));
    }

    return this.state.compareWith()(option.value(), value);
  }

  /**
   * Activate the next option in the list if there is one.
   * If there is no option currently active, activate the selected option or the first option.
   * @internal
   */
  activateNextOption(): void {
    if (this.state.disabled()) {
      return;
    }

    const options = this.options();

    // if there are no options, do nothing
    if (options.length === 0) {
      return;
    }

    // if there is no active option, activate the first option
    if (!this.activeDescendantManager.activeItem()) {
      const selectedOption = options.find(option => this.isOptionSelected(option));

      // if there is a selected option(s), set the active descendant to the first selected option
      const targetOption = selectedOption ?? options[0];

      this.activeDescendantManager.activate(targetOption);
      return;
    }

    // otherwise activate the next option
    this.activeDescendantManager.next();
  }

  /**
   * Activate the previous option in the list if there is one.
   * @internal
   */
  activatePreviousOption(): void {
    if (this.state.disabled()) {
      return;
    }
    const options = this.options();
    // if there are no options, do nothing
    if (options.length === 0) {
      return;
    }
    // if there is no active option, activate the last option
    if (!this.activeDescendantManager.activeItem()) {
      const selectedOption = options.find(option => this.isOptionSelected(option));
      // if there is a selected option(s), set the active descendant to the first selected option
      const targetOption = selectedOption ?? options[options.length - 1];
      this.activeDescendantManager.activate(targetOption);
      return;
    }
    // otherwise activate the previous option
    this.activeDescendantManager.previous();
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
  registerOption(option: NgpComboboxOption): void {
    this.options.update(options => [...options, option]);
  }

  /**
   * Unregister an option from the combobox.
   * @param option The option to unregister.
   * @internal
   */
  unregisterOption(option: NgpComboboxOption): void {
    this.options.update(options => options.filter(o => o !== option));
  }
}
