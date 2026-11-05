import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute, output } from '@angular/core';
import {
  coerceFlip,
  coerceOffset,
  NgpFlip,
  NgpFlipInput,
  NgpOffset,
  NgpOffsetInput,
  NgpPlacement,
  NgpPosition,
} from 'ng-primitives/portal';
import { injectAutocompleteConfig } from '../config/autocomplete-config';
import {
  ngpAutocomplete,
  NgpAutocompleteOpenOptions,
  provideAutocompleteState,
} from './autocomplete-state';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type T = any;

@Directive({
  selector: '[ngpAutocomplete]',
  exportAs: 'ngpAutocomplete',
  providers: [provideAutocompleteState()],
})
export class NgpAutocomplete {
  /** Access the autocomplete configuration. */
  protected readonly config = injectAutocompleteConfig();

  /**
   * The value of the chosen option. The matching option gets `data-selected` and is active when
   * the dropdown opens from the button or the arrow keys. The autocomplete never writes it, so
   * update it from `ngpAutocompleteSelected`.
   */
  readonly selectedValue = input<T>(undefined, {
    alias: 'ngpAutocompleteSelectedValue',
  });

  /** The comparator used to match an option's value against the selected value. */
  readonly compareWith = input<(a: T | undefined, b: T | undefined) => boolean>(Object.is, {
    alias: 'ngpAutocompleteCompareWith',
  });

  /** Whether the autocomplete is disabled. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpAutocompleteDisabled',
    transform: booleanAttribute,
  });

  /** The position of the dropdown. */
  readonly placement = input<NgpPlacement>(this.config.placement, {
    alias: 'ngpAutocompleteDropdownPlacement',
  });

  /** The container for the dropdown. */
  readonly container = input<HTMLElement | string | null>(this.config.container, {
    alias: 'ngpAutocompleteDropdownContainer',
  });

  /** Whether the dropdown should flip when there is not enough space. Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options. */
  readonly flip = input<NgpFlip, NgpFlipInput>(this.config.flip, {
    alias: 'ngpAutocompleteDropdownFlip',
    transform: coerceFlip,
  });

  /**
   * Define the offset of the autocomplete dropdown relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 0
   */
  readonly offset = input<NgpOffset, NgpOffsetInput>(this.config.offset, {
    alias: 'ngpAutocompleteDropdownOffset',
    transform: coerceOffset,
  });

  /**
   * A function that will scroll the active option into view. This can be overridden
   * for cases such as virtual scrolling where we cannot scroll the option directly because
   * it may not be rendered.
   */
  readonly scrollToOption = input<(index: number) => void>(undefined, {
    alias: 'ngpAutocompleteScrollToOption',
  });

  /**
   * Provide all the option values to the autocomplete. This is useful for virtual scrolling scenarios
   * where not all options are rendered in the DOM. This is not an alternative to adding the options
   * in the DOM, it is only to provide the autocomplete with the full list of options. This list should match
   * the order of the options as they would appear in the DOM.
   */
  readonly allOptions = input<T[]>(undefined, { alias: 'ngpAutocompleteOptions' });

  /**
   * Whether typing activates the first option, so Enter picks it. Combine it with
   * `ngpAutocompleteInputSuggestion` to complete the text inline.
   */
  readonly autoActivate = input<boolean, BooleanInput>(this.config.autoActivate, {
    alias: 'ngpAutocompleteAutoActivate',
    transform: booleanAttribute,
  });

  /**
   * The query length from which typing opens the dropdown. The arrow keys and the button open it
   * whatever the length.
   */
  readonly minLength = input<number, NumberInput>(this.config.minLength, {
    alias: 'ngpAutocompleteMinLength',
    transform: numberAttribute,
  });

  /**
   * Emits the value of an option when the user selects it with a click or Enter, even when it is
   * already the selected value.
   */
  readonly selected = output<T>({
    alias: 'ngpAutocompleteSelected',
  });

  /** Emits the value of the active option as it changes, `undefined` when none is active. */
  readonly activeValueChange = output<T | undefined>({
    alias: 'ngpAutocompleteActiveValueChange',
  });

  /** Emit when the dropdown open state changes. */
  readonly openChange = output<boolean>({
    alias: 'ngpAutocompleteOpenChange',
  });

  protected readonly state = ngpAutocomplete<T>({
    selectedValue: this.selectedValue,
    compareWith: this.compareWith,
    disabled: this.disabled,
    placement: this.placement,
    container: this.container,
    flip: this.flip,
    offset: this.offset,
    scrollToOption: this.scrollToOption,
    allOptions: this.allOptions,
    autoActivate: this.autoActivate,
    minLength: this.minLength,
    onSelected: value => this.selected.emit(value),
    onActiveValueChange: value => this.activeValueChange.emit(value),
    onOpenChange: open => this.openChange.emit(open),
  });

  /** Whether the dropdown is open. */
  readonly open = this.state.open;

  /** The id of the dropdown, for `aria-controls`. */
  readonly dropdownId = this.state.dropdownId;

  /** The id of the active option, for `aria-activedescendant`. */
  readonly activeOptionId = this.state.activeOptionId;

  /**
   * Open the dropdown. Without an `activate` option, no option is active.
   * @param options Which option to activate once the dropdown has opened.
   */
  openDropdown(options?: NgpAutocompleteOpenOptions): Promise<void> {
    return this.state.openDropdown(options);
  }

  /** Close the dropdown. */
  closeDropdown(): void {
    this.state.closeDropdown();
  }

  /**
   * Toggle the dropdown.
   * @param options Which option to activate when the dropdown opens.
   */
  toggleDropdown(options?: NgpAutocompleteOpenOptions): Promise<void> {
    return this.state.toggleDropdown(options);
  }

  /**
   * Search by a new query, as typing does: the dropdown opens from the minimum length and closes
   * below it or with `null`. `ngpAutocompleteInput` calls it for you.
   */
  setQuery(query: string | null): void {
    this.state.setQuery(query);
  }

  /**
   * Place the dropdown at a viewport position, or at the autocomplete element with `null`. A
   * function is measured again whenever the page scrolls or resizes, as a caret moves with its text.
   */
  setPosition(position: NgpPosition | (() => NgpPosition | null) | null): void {
    this.state.setPosition(position);
  }

  /**
   * Handle the keys of an open dropdown, the arrow keys and Enter. A key it handles has its
   * default prevented, which `event.defaultPrevented` reports. Escape is left to the overlay.
   */
  onKeydown(event: KeyboardEvent): void {
    this.state.onKeydown(event);
  }

  /** Activate the next option, or the selected option when none is active. */
  activateNextOption(): void {
    this.state.activateNextOption();
  }

  /** Activate the previous option, or the selected option when none is active. */
  activatePreviousOption(): void {
    this.state.activatePreviousOption();
  }

  /** Select the active option, as Enter does. Returns whether an option was active. */
  selectActiveOption(): boolean {
    return this.state.selectActiveOption();
  }
}
