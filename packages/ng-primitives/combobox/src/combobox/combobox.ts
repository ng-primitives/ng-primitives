import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import {
  coerceFlip,
  coerceOffset,
  NgpFlip,
  NgpFlipInput,
  NgpOffset,
  NgpOffsetInput,
} from 'ng-primitives/portal';
import { NgpComboboxButtonState } from '../combobox-button/combobox-button-state';
import { NgpComboboxDropdownState } from '../combobox-dropdown/combobox-dropdown-state';
import { NgpComboboxInputState } from '../combobox-input/combobox-input-state';
import { NgpComboboxOptionState } from '../combobox-option/combobox-option-state';
import { NgpComboboxPortalState } from '../combobox-portal/combobox-portal-state';
import { injectComboboxConfig } from '../config/combobox-config';
import { ngpCombobox, NgpComboboxPlacement, provideComboboxState } from './combobox-state';

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
})
export class NgpCombobox {
  /** Access the combobox configuration. */
  protected readonly config = injectComboboxConfig();

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

  /** Whether the dropdown should flip when there is not enough space. Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options. */
  readonly flip = input<NgpFlip, NgpFlipInput>(this.config.flip, {
    alias: 'ngpComboboxDropdownFlip',
    transform: coerceFlip,
  });

  /**
   * Define the offset of the combobox dropdown relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 0
   */
  readonly offset = input<NgpOffset, NgpOffsetInput>(this.config.offset, {
    alias: 'ngpComboboxDropdownOffset',
    transform: coerceOffset,
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

  protected readonly state = ngpCombobox({
    value: this.value,
    multiple: this.multiple,
    disabled: this.disabled,
    allowDeselect: this.allowDeselect,
    compareWith: this.compareWith,
    placement: this.placement,
    container: this.container,
    flip: this.flip,
    offset: this.offset,
    scrollToOption: this.scrollToOption,
    allOptions: this.allOptions,
    onValueChange: value => this.valueChange.emit(value),
    onOpenChange: value => this.openChange.emit(value),
  });

  /** @internal Access the element reference. */
  readonly elementRef = this.state.elementRef;

  /**
   * Store the combobox input
   * @internal
   */
  readonly input = this.state.input;

  /**
   * Store the combobox button.
   * @internal
   */
  readonly button = this.state.button;

  /**
   * Store the combobox portal.
   * @internal
   */
  readonly portal = this.state.portal;

  /**
   * Store the combobox dropdown.
   * @internal
   */
  readonly dropdown = this.state.dropdown;

  /**
   * Store the combobox options.
   * @internal
   */
  readonly options = this.state.options;

  /**
   * Access the overlay
   * @internal
   */
  readonly overlay = this.state.overlay;

  /**
   * The open state of the combobox.
   * @internal
   */
  readonly open = this.state.open;

  /**
   * The options sorted by their index or DOM position.
   * @internal
   */
  readonly sortedOptions = this.state.sortedOptions;

  /**
   * The active key descendant manager.
   * @internal
   */
  readonly activeDescendantManager = this.state.activeDescendantManager;

  /**
   * Open the dropdown.
   * @internal
   */
  openDropdown(): Promise<void> {
    return this.state.openDropdown();
  }

  /**
   * Close the dropdown.
   * @internal
   */
  closeDropdown(): void {
    return this.state.closeDropdown();
  }

  /**
   * Handles the dropdown being closed.
   * Emits the openChange event and resets the active descendant.
   * @internal
   */
  onOverlayClosed(): void {
    return this.state.onOverlayClosed();
  }

  /**
   * Toggle the dropdown.
   * @internal
   */
  toggleDropdown(): Promise<void> {
    return this.state.toggleDropdown();
  }

  /**
   * Select an option.
   * @param option The option to select.
   * @internal
   */
  selectOption(option: NgpComboboxOptionState | undefined): void {
    return this.state.selectOption(option);
  }

  /**
   * Deselect an option.
   * @param option The option to deselect.
   * @internal
   */
  deselectOption(option: NgpComboboxOptionState): void {
    return this.state.deselectOption(option);
  }

  /**
   * Toggle the selection of an option.
   * @param id The id of the option to toggle.
   * @internal
   */
  toggleOption(id: string): void {
    return this.state.toggleOption(id);
  }

  /**
   * Determine if an option is selected.
   * @param option The option to check.
   * @internal
   */
  isOptionSelected(option: T): boolean {
    return this.state.isOptionSelected(option);
  }

  /**
   * Activate the next option in the list if there is one.
   * If there is no option currently active, activate the selected option or the first option.
   * @internal
   */
  activateNextOption(): void {
    return this.state.activateNextOption();
  }

  /**
   * Activate the previous option in the list if there is one.
   * @internal
   */
  activatePreviousOption(): void {
    return this.state.activatePreviousOption();
  }

  /**
   * Register the dropdown portal with the combobox.
   * @param portal The dropdown portal.
   * @internal
   */
  registerPortal(portal: NgpComboboxPortalState): void {
    return this.state.registerPortal(portal);
  }

  /**
   * Register the combobox input with the combobox.
   * @param input The combobox input.
   * @internal
   */
  registerInput(input: NgpComboboxInputState): void {
    return this.state.registerInput(input);
  }

  /**
   * Register the combobox button with the combobox.
   * @param button The combobox button.
   * @internal
   */
  registerButton(button: NgpComboboxButtonState): void {
    return this.state.registerButton(button);
  }

  /**
   * Register the dropdown with the combobox.
   * @param dropdown The dropdown to register.
   * @internal
   */
  registerDropdown(dropdown: NgpComboboxDropdownState): void {
    return this.state.registerDropdown(dropdown);
  }

  /**
   * Register an option with the combobox.
   * @param option The option to register.
   * @internal
   */
  registerOption(option: NgpComboboxOptionState): void {
    return this.state.registerOption(option);
  }

  /**
   * Unregister an option from the combobox.
   * @param option The option to unregister.
   * @internal
   */
  unregisterOption(option: NgpComboboxOptionState): void {
    return this.state.unregisterOption(option);
  }

  /**
   * Focus the combobox.
   * When an input element is present, it will be focused.
   * Otherwise, the combobox element itself will be focused.
   * This enables keyboard navigation for comboboxes without input elements.
   * @internal
   */
  focus(): void {
    return this.state.focus();
  }
}
