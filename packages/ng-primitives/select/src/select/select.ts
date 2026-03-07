import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import type { Placement } from '@floating-ui/dom';
import { coerceFlip, NgpFlip, NgpFlipInput } from 'ng-primitives/portal';
import { uniqueId } from 'ng-primitives/utils';
import { injectSelectConfig } from '../config/select-config';
import { ngpSelect, provideSelectState } from './select-state';

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
  selector: '[ngpSelect]',
  exportAs: 'ngpSelect',
  providers: [provideSelectState()],
})
export class NgpSelect {
  /** Access the select configuration. */
  protected readonly config = injectSelectConfig();

  /** The unique id of the select. */
  readonly id = input(uniqueId('ngp-select'));

  /** The value of the select. */
  readonly value = input<T>(undefined, {
    alias: 'ngpSelectValue',
  });

  /** Event emitted when the value changes. */
  readonly valueChange = output<T>({
    alias: 'ngpSelectValueChange',
  });

  /** Whether the select is multiple selection. */
  readonly multiple = input<boolean, BooleanInput>(false, {
    alias: 'ngpSelectMultiple',
    transform: booleanAttribute,
  });

  /** Whether the select is disabled. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpSelectDisabled',
    transform: booleanAttribute,
  });

  /** Emit when the dropdown open state changes. */
  readonly openChange = output<boolean>({
    alias: 'ngpSelectOpenChange',
  });

  /** The comparator function used to compare options. */
  readonly compareWith = input<(a: T | undefined, b: T | undefined) => boolean>(Object.is, {
    alias: 'ngpSelectCompareWith',
  });

  /** The position of the dropdown. */
  readonly placement = input<Placement>(this.config.placement, {
    alias: 'ngpSelectDropdownPlacement',
  });

  /** The container for the dropdown. */
  readonly container = input<HTMLElement | string | null>(this.config.container, {
    alias: 'ngpSelectDropdownContainer',
  });

  /** Whether the dropdown should flip when there is not enough space. Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options. */
  readonly flip = input<NgpFlip, NgpFlipInput>(this.config.flip, {
    alias: 'ngpSelectDropdownFlip',
    transform: coerceFlip,
  });

  /**
   * A function that will scroll the active option into view. This can be overridden
   * for cases such as virtual scrolling where we cannot scroll the option directly because
   * it may not be rendered.
   */
  readonly scrollToOption = input<(index: number) => void>(undefined, {
    alias: 'ngpSelectScrollToOption',
  });

  /**
   * Provide all the option values to the select. This is useful for virtual scrolling scenarios
   * where not all options are rendered in the DOM. This is not an alternative to adding the options
   * in the DOM, it is only to provide the select with the full list of options. This list should match
   * the order of the options as they would appear in the DOM.
   */
  readonly allOptions = input<T[]>(undefined, { alias: 'ngpSelectOptions' });

  /** The state of the select. */
  protected readonly state = ngpSelect<T>({
    id: this.id,
    value: this.value,
    multiple: this.multiple,
    disabled: this.disabled,
    compareWith: this.compareWith,
    placement: this.placement,
    container: this.container,
    flip: this.flip,
    scrollToOption: this.scrollToOption,
    allOptions: this.allOptions,
    onValueChange: value => this.valueChange.emit(value),
    onOpenChange: open => this.openChange.emit(open),
  });

  /** @internal Access the select element. */
  readonly elementRef = this.state.elementRef;

  /**
   * Store the select portal.
   * @internal
   */
  readonly portal = this.state.portal;

  /**
   * Store the select dropdown.
   * @internal
   */
  readonly dropdown = this.state.dropdown;

  /**
   * Store the select options.
   * @internal
   */
  readonly options = this.state.options;

  /**
   * Access the overlay
   * @internal
   */
  readonly overlay = this.state.overlay;

  /**
   * The open state of the select.
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
   * Toggle the dropdown.
   * @internal
   */
  toggleDropdown(): void {
    this.state.toggleDropdown();
  }

  /**
   * Select an option.
   * @param index The id of the option to select.
   * @internal
   */
  selectOption(id: string): void {
    return this.state.selectOption(id);
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
    this.state.activateNextOption();
  }

  /**
   * Activate the previous option in the list if there is one.
   * @internal
   */
  activatePreviousOption(): void {
    this.state.activatePreviousOption();
  }

  /**
   * Focus the select.
   * @internal
   */
  focus(): void {
    this.state.focus();
  }
}
