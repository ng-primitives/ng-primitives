import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  Directive,
  HostListener,
  inject,
  Injector,
  input,
  output,
  signal,
} from '@angular/core';
import { activeDescendantManager } from 'ng-primitives/a11y';
import { ngpInteractions } from 'ng-primitives/interactions';
import { domSort, injectElementRef } from 'ng-primitives/internal';
import type { NgpComboboxButton } from '../combobox-button/combobox-button';
import type { NgpComboboxDropdown } from '../combobox-dropdown/combobox-dropdown';
import type { NgpComboboxInput } from '../combobox-input/combobox-input';
import { NgpComboboxOption } from '../combobox-option/combobox-option';
import type { NgpComboboxPortal } from '../combobox-portal/combobox-portal';
import { injectComboboxConfig } from '../config/combobox-config';
import { areAllOptionsSelected } from '../utils';
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
  providers: [provideComboboxState()],
  host: {
    '[attr.tabindex]': 'input() ? -1 : (state.disabled() ? -1 : 0)',
    '[attr.data-open]': 'open() ? "" : undefined',
    '[attr.data-disabled]': 'state.disabled() ? "" : undefined',
    '[attr.data-multiple]': 'state.multiple() ? "" : undefined',
    '[attr.data-invalid]': 'controlStatus()?.invalid ? "" : undefined',
    '[attr.data-valid]': 'controlStatus()?.valid ? "" : undefined',
    '[attr.data-touched]': 'controlStatus()?.touched ? "" : undefined',
    '[attr.data-pristine]': 'controlStatus()?.pristine ? "" : undefined',
    '[attr.data-dirty]': 'controlStatus()?.dirty ? "" : undefined',
    '[attr.data-pending]': 'controlStatus()?.pending ? "" : undefined',
  },
})
export class NgpCombobox {
  /** Access the combobox configuration. */
  protected readonly config = injectComboboxConfig();

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

  /** Whether the combobox allows deselection in single selection mode. */
  readonly allowDeselect = input<boolean, BooleanInput>(false, {
    alias: 'ngpComboboxAllowDeselect',
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
  readonly placement = input<NgpComboboxPlacement>(this.config.placement, {
    alias: 'ngpComboboxDropdownPlacement',
  });

  /** The container for the dropdown. */
  readonly container = input<HTMLElement | string | null>(this.config.container, {
    alias: 'ngpComboboxDropdownContainer',
  });

  /**
   * A function that will scroll the active option into view. This can be overridden
   * for cases such as virtual scrolling where we cannot scroll the option directly because
   * it may not be rendered.
   */
  readonly scrollToOption = input<(index: number) => void>(undefined, {
    alias: 'ngpComboboxScrollToOption',
  });

  /**
   * Provide all the option values to the combobox. This is useful for virtual scrolling scenarios
   * where not all options are rendered in the DOM. This is not an alternative to adding the options
   * in the DOM, it is only to provide the combobox with the full list of options. This list should match
   * the order of the options as they would appear in the DOM.
   */
  readonly allOptions = input<T[]>(undefined, { alias: 'ngpComboboxOptions' });

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
   * The options sorted by their index or DOM position.
   * @internal
   */
  readonly sortedOptions = computed(() =>
    domSort(
      this.options(),
      option => option.elementRef.nativeElement,
      option => option.index(),
    ),
  );

  /**
   * The active key descendant manager.
   * @internal
   */
  readonly activeDescendantManager = activeDescendantManager({
    // we must wrap the signal in a computed to ensure it is not used before it is defined
    disabled: computed(() => this.state.disabled()),
    wrap: signal(true),
    count: computed(() => this.state.allOptions()?.length ?? this.options().length),
    getItemId: index => this.getOptionAtIndex(index)?.id(),
    isItemDisabled: index => this.getOptionAtIndex(index)?.disabled() ?? false,
    scrollIntoView: index => {
      const isPositioned = this.portal()?.overlay()?.isPositioned() ?? false;

      if (!isPositioned || index === -1) {
        return;
      }

      this.scrollTo(index);
    },
  });

  /** The control status */
  protected readonly controlStatus = computed(() => this.input()?.controlStatus());

  /** The state of the combobox. */
  protected readonly state = comboboxState<NgpCombobox>(this);

  constructor() {
    ngpInteractions({
      focus: true,
      focusWithin: true,
      hover: true,
      press: true,
      disabled: this.state.disabled,
    });
  }

  /**
   * Open the dropdown.
   * @internal
   */
  async openDropdown(): Promise<void> {
    if (this.state.disabled() || this.open()) {
      return;
    }

    this.openChange.emit(true);
    await this.portal()?.show();

    let selectedOptionIdx = -1;

    // if we have been provided with allOptions, we need to find the selected option(s) from that list
    if (this.state.allOptions()) {
      selectedOptionIdx = this.state
        .allOptions()!
        .findIndex(option => this.isOptionSelected(option));
    }

    // if we don't have allOptions, find the selected option(s) from the registered options
    if (selectedOptionIdx === -1) {
      // if there is a selected option(s), set the active descendant to the first selected option
      selectedOptionIdx = this.sortedOptions().findIndex(option =>
        this.isOptionSelected(option.value()),
      );
    }

    // if after checking there is a selected option, set the active descendant to the first option
    if (selectedOptionIdx !== -1) {
      // scroll to and activate the selected option
      this.scrollTo(selectedOptionIdx);
      this.activeDescendantManager.activateByIndex(selectedOptionIdx);
      return;
    }

    // activate the selected option or the first option
    this.activeDescendantManager.first();
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
  async toggleDropdown(): Promise<void> {
    if (this.open()) {
      this.closeDropdown();
    } else {
      await this.openDropdown();
    }
  }

  /**
   * Select an option.
   * @param option The option to select.
   * @internal
   */
  selectOption(option: NgpComboboxOption | undefined): void {
    if (this.state.disabled()) {
      return;
    }

    if (!option) {
      this.state.value.set(undefined);
      this.closeDropdown();
      return;
    }

    const optionValue = option.value();

    // if the option has no associated value, do nothing
    if (optionValue === undefined) {
      return;
    }

    // Handle select all functionality - only works in multiple selection mode
    if (optionValue === 'all') {
      if (!this.state.multiple()) {
        return; // Do nothing in single selection mode
      }

      // Get currently visible regular options (respects filtering)
      const regularOptions = this.sortedOptions().filter(
        opt => opt.value() !== 'all' && opt.value() !== undefined,
      );
      const allValues = regularOptions.map(opt => opt.value());

      this.state.value.set(allValues as T);
      this.valueChange.emit(allValues as T);
      return;
    }

    if (this.state.multiple()) {
      // if the option is already selected, do nothing
      if (this.isOptionSelected(optionValue)) {
        return;
      }

      const value = [...(this.state.value() as T[]), optionValue as T];

      // add the option to the value
      this.state.value.set(value as T);
      this.valueChange.emit(value as T);
    } else {
      this.state.value.set(optionValue as T);
      this.valueChange.emit(optionValue as T);

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
    const optionValue = option.value();

    // Options without values cannot be deselected (and should never be selected).
    if (optionValue === undefined) {
      return;
    }

    // if the combobox is disabled or the option is not selected, do nothing
    if (this.state.disabled() || !this.isOptionSelected(optionValue)) {
      return;
    }

    // in single selection mode, only allow deselecting if allowDeselect is true
    if (!this.state.multiple() && !this.state.allowDeselect()) {
      return;
    }

    // Handle select all for deselect all functionality - only works in multiple selection mode
    if (optionValue === 'all') {
      if (!this.state.multiple()) {
        return; // Do nothing in single selection mode
      }

      this.state.value.set([] as T);
      this.valueChange.emit([] as T);
      return;
    }

    if (this.state.multiple()) {
      const values = (this.state.value() as T[]) ?? [];
      const newValue = values.filter(v => !this.state.compareWith()(v, optionValue as T));

      // remove the option from the value
      this.state.value.set(newValue as T);
      this.valueChange.emit(newValue as T);
    } else {
      // in single selection mode with allowDeselect enabled, set value to undefined
      this.state.value.set(undefined);
      this.valueChange.emit(undefined);
    }
  }

  /**
   * Toggle the selection of an option.
   * @param id The id of the option to toggle.
   * @internal
   */
  toggleOption(id: string): void {
    if (this.state.disabled()) {
      return;
    }

    const option = this.sortedOptions().find(opt => opt.id() === id);

    if (!option) {
      return;
    }

    const optionValue = option.value();

    // Guard against toggling an option without a value.
    if (optionValue === undefined) {
      return;
    }

    // Handle select all for select/deselect all functionality - only works in multiple selection mode
    if (optionValue === 'all') {
      if (!this.state.multiple()) {
        return; // Do nothing in single selection mode
      }

      if (this.isOptionSelected(optionValue)) {
        this.deselectOption(option);
      } else {
        this.selectOption(option);
      }
      return;
    }

    if (this.state.multiple()) {
      // In multiple selection mode, always allow toggling
      if (this.isOptionSelected(optionValue)) {
        this.deselectOption(option);
      } else {
        this.selectOption(option);
      }
    } else {
      // In single selection mode, check if deselection is allowed
      if (this.isOptionSelected(optionValue) && this.state.allowDeselect()) {
        // Deselect the option by setting value to undefined
        this.state.value.set(undefined);
        this.valueChange.emit(undefined);
      } else {
        // Select the option (works even if already selected to update the input)
        this.selectOption(option);
      }
    }
  }

  /**
   * Determine if an option is selected.
   * @param option The option to check.
   * @internal
   */
  isOptionSelected(option: T): boolean {
    if (this.state.disabled()) {
      return false;
    }

    // Handle both NgpComboboxOption and T types
    const optionValue = isOption(option) ? option.value() : (option as T);
    const value = this.state.value();

    // Only treat `undefined` as "no value" (allow '', 0, false).
    if (optionValue === undefined) {
      return false;
    }

    // Handle select all functionality - only works in multiple selection mode
    if (optionValue === 'all') {
      if (!this.state.multiple()) {
        return false; // Never selected in single selection mode
      }

      const selectedValues = Array.isArray(value) ? value : [];
      return areAllOptionsSelected(this.sortedOptions(), selectedValues, this.state.compareWith());
    }

    // Only treat `undefined` as "no selection" (allow '', 0, false).
    if (value === undefined) {
      return false;
    }

    if (this.state.multiple()) {
      return Array.isArray(value) && value.some(v => this.state.compareWith()(optionValue, v));
    }

    return this.state.compareWith()(optionValue, value);
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

    const options = this.sortedOptions();

    // if there are no options, do nothing
    if (options.length === 0) {
      return;
    }

    // if there is no active option, activate the first option
    if (this.activeDescendantManager.index() === -1) {
      const selectedOption = options.findIndex(option => this.isOptionSelected(option.value()));

      // if there is a selected option(s), set the active descendant to the first selected option
      const targetOption = selectedOption !== -1 ? selectedOption : 0;

      this.activeDescendantManager.activateByIndex(targetOption, { origin: 'keyboard' });
      return;
    }

    // otherwise activate the next option
    this.activeDescendantManager.next({ origin: 'keyboard' });
  }

  /**
   * Activate the previous option in the list if there is one.
   * @internal
   */
  activatePreviousOption(): void {
    if (this.state.disabled()) {
      return;
    }
    const options = this.sortedOptions();
    // if there are no options, do nothing
    if (options.length === 0) {
      return;
    }
    // if there is no active option, activate the last option
    if (this.activeDescendantManager.index() === -1) {
      const selectedOption = options.findIndex(option => this.isOptionSelected(option.value()));
      // if there is a selected option(s), set the active descendant to the first selected option
      const targetOption = selectedOption !== -1 ? selectedOption : options.length - 1;
      this.activeDescendantManager.activateByIndex(targetOption, { origin: 'keyboard' });
      return;
    }
    // otherwise activate the previous option
    this.activeDescendantManager.previous({ origin: 'keyboard' });
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

  /**
   * Focus the combobox.
   * When an input element is present, it will be focused.
   * Otherwise, the combobox element itself will be focused.
   * This enables keyboard navigation for comboboxes without input elements.
   * @internal
   */
  focus(): void {
    if (this.input()) {
      this.input()?.focus();
    } else {
      this.elementRef.nativeElement.focus();
    }
  }

  /**
   * Handle keydown events for keyboard navigation and accessibility.
   * Supports:
   * - Arrow Down: Open dropdown or navigate to next option
   * - Arrow Up: Open dropdown or navigate to previous option
   * - Home: Navigate to first option
   * - End: Navigate to last option
   * - Enter: Select the currently active option
   * - Escape: Close the dropdown
   * @param event - The keyboard event
   * @internal
   */
  @HostListener('keydown', ['$event'])
  protected handleKeydown(event: KeyboardEvent): void {
    // If the event originated from the input element, let the input handle it
    if (this.input() && event.target === this.input()?.elementRef.nativeElement) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        if (this.open()) {
          this.activateNextOption();
        } else {
          this.openDropdown();
        }
        event.preventDefault();
        break;
      case 'ArrowUp':
        if (this.open()) {
          this.activatePreviousOption();
        } else {
          this.openDropdown();
          // Use setTimeout to ensure dropdown is rendered before selecting last item
          setTimeout(() => this.activeDescendantManager.last());
        }
        event.preventDefault();
        break;
      case 'Home':
        if (this.open()) {
          this.activeDescendantManager.first({ origin: 'keyboard' });
        }
        event.preventDefault();
        break;
      case 'End':
        if (this.open()) {
          this.activeDescendantManager.last({ origin: 'keyboard' });
        }
        event.preventDefault();
        break;
      case 'Enter':
        if (this.open()) {
          const activeId = this.activeDescendantManager.id();

          if (activeId) {
            this.toggleOption(activeId);
          }
        }
        event.preventDefault();
        break;
      case 'Escape':
        if (this.open()) {
          this.closeDropdown();
        }
        event.preventDefault();
        break;
      case ' ':
        if (!this.input()) {
          this.toggleDropdown();
          event.preventDefault();
        }
        break;
    }
  }

  /**
   * Handle blur events to manage dropdown closing behavior.
   * The dropdown will remain open if focus moves to:
   * - The dropdown itself
   * - The combobox button
   * - The combobox input
   * Otherwise, the dropdown will be closed.
   * @param event - The focus event
   * @internal
   */
  @HostListener('blur', ['$event'])
  protected onBlur(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement;

    // if the blur was caused by focus moving to the dropdown, don't close
    if (relatedTarget && this.dropdown()?.elementRef.nativeElement.contains(relatedTarget)) {
      return;
    }

    // if the blur was caused by focus moving to the button, don't close
    if (relatedTarget && this.button()?.elementRef.nativeElement.contains(relatedTarget)) {
      return;
    }

    // if the blur was caused by focus moving to the input, don't close
    if (relatedTarget && this.input()?.elementRef.nativeElement === relatedTarget) {
      return;
    }

    this.closeDropdown();
  }

  private scrollTo(index: number): void {
    const scrollToOption = this.state.scrollToOption();

    if (scrollToOption) {
      scrollToOption(index);
      return;
    }

    const option = this.getOptionAtIndex(index);
    if (option) {
      option.scrollIntoView();
    }
  }

  private getOptionAtIndex(index: number): NgpComboboxOption | undefined {
    // if the option has an index, use that to get the option because this is required for virtual scrolling scenarios
    const optionIndex = this.options().findIndex(opt => opt.index() === index);

    if (optionIndex !== -1) {
      return this.options()[optionIndex];
    }

    return this.sortedOptions()[index];
  }
}

export type NgpComboboxPlacement =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top-start'
  | 'top-end'
  | 'right-start'
  | 'right-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end';

function isOption(value: any): value is NgpComboboxOption {
  return (
    value && typeof value === 'object' && 'value' in value && typeof value.value === 'function'
  );
}
