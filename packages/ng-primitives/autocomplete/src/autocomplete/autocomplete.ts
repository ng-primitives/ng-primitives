import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  Directive,
  effect,
  HostListener,
  inject,
  Injector,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { activeDescendantManager } from 'ng-primitives/a11y';
import { ngpInteractions } from 'ng-primitives/interactions';
import { domSort, injectElementRef } from 'ng-primitives/internal';
import {
  coerceFlip,
  coerceOffset,
  NgpFlip,
  NgpFlipInput,
  NgpOffset,
  NgpOffsetInput,
} from 'ng-primitives/portal';
import { controlStatus } from 'ng-primitives/utils';
import type { NgpAutocompleteButton } from '../autocomplete-button/autocomplete-button';
import type { NgpAutocompleteDropdown } from '../autocomplete-dropdown/autocomplete-dropdown';
import type { NgpAutocompleteInput } from '../autocomplete-input/autocomplete-input';
import { NgpAutocompleteOption } from '../autocomplete-option/autocomplete-option';
import type { NgpAutocompletePortal } from '../autocomplete-portal/autocomplete-portal';
import { injectAutocompleteConfig } from '../config/autocomplete-config';
import { areAllOptionsSelected } from '../utils';
import { autocompleteState, provideAutocompleteState } from './autocomplete-state';

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
  selector: '[ngpAutocomplete]',
  exportAs: 'ngpAutocomplete',
  providers: [provideAutocompleteState()],
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
export class NgpAutocomplete {
  /** Access the autocomplete configuration. */
  protected readonly config = injectAutocompleteConfig();

  /** @internal Access the autocomplete element. */
  readonly elementRef = injectElementRef();

  /** Access the injector. */
  protected readonly injector = inject(Injector);

  /** The value of the autocomplete. */
  readonly value = input<T>(undefined, {
    alias: 'ngpAutocompleteValue',
  });

  /** Event emitted when the value changes. */
  readonly valueChange = output<T>({
    alias: 'ngpAutocompleteValueChange',
  });

  /** Whether the autocomplete is multiple selection. */
  readonly multiple = input<boolean, BooleanInput>(false, {
    alias: 'ngpAutocompleteMultiple',
    transform: booleanAttribute,
  });

  /** Whether the autocomplete is disabled. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpAutocompleteDisabled',
    transform: booleanAttribute,
  });

  /** Whether the autocomplete allows deselection in single selection mode. */
  readonly allowDeselect = input<boolean, BooleanInput>(false, {
    alias: 'ngpAutocompleteAllowDeselect',
    transform: booleanAttribute,
  });

  /** Emit when the dropdown open state changes. */
  readonly openChange = output<boolean>({
    alias: 'ngpAutocompleteOpenChange',
  });

  /** The comparator function used to compare options. */
  readonly compareWith = input<(a: T | undefined, b: T | undefined) => boolean>(Object.is, {
    alias: 'ngpAutocompleteCompareWith',
  });

  /** The position of the dropdown. */
  readonly placement = input<NgpAutocompletePlacement>(this.config.placement, {
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
   * Store the autocomplete input
   * @internal
   */
  readonly input = signal<NgpAutocompleteInput | undefined>(undefined);

  /**
   * Store the autocomplete button.
   * @internal
   */
  readonly button = signal<NgpAutocompleteButton | undefined>(undefined);

  /**
   * Store the autocomplete portal.
   * @internal
   */
  readonly portal = signal<NgpAutocompletePortal | undefined>(undefined);

  /**
   * Store the autocomplete dropdown.
   * @internal
   */
  readonly dropdown = signal<NgpAutocompleteDropdown | undefined>(undefined);

  /**
   * Store the autocomplete options.
   * @internal
   */
  readonly options = signal<NgpAutocompleteOption[]>([]);

  /**
   * Access the overlay
   * @internal
   */
  readonly overlay = computed(() => this.portal()?.overlay());

  /**
   * The open state of the autocomplete.
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

  /**
   * The form control status of the autocomplete host element itself. When the autocomplete is used as a
   * form control (e.g. via a `ControlValueAccessor` wrapper) the `NgControl` lives on an ancestor
   * element, so this resolves it even when there is no `ngpAutocompleteInput`.
   */
  private readonly hostControlStatus = controlStatus();

  /**
   * The control status. When an input is present it can resolve the associated `NgControl` (whether
   * the control is on the input itself or an ancestor), so we use its status. Otherwise we fall back
   * to the autocomplete host's own control status so an input-less autocomplete still reflects validity.
   */
  protected readonly controlStatus = computed(() =>
    this.input() ? this.input()?.controlStatus() : this.hostControlStatus(),
  );

  /** The state of the autocomplete. */
  protected readonly state = autocompleteState<NgpAutocomplete>(this);

  constructor() {
    // When the visible (or virtual) options change while open, revalidate so the
    // active index can't point at a removed option and leave a stale aria-activedescendant.
    effect(() => {
      this.sortedOptions();
      this.state.allOptions();

      if (this.open()) {
        untracked(() => this.activeDescendantManager.validate());
      }
    });

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
    this.portal()?.detach();
  }

  /**
   * Handles the dropdown being closed.
   * Emits the openChange event and resets the active descendant.
   * @internal
   */
  onOverlayClosed(): void {
    this.openChange.emit(false);
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
  selectOption(option: NgpAutocompleteOption | undefined): void {
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
  deselectOption(option: NgpAutocompleteOption): void {
    const optionValue = option.value();

    // Options without values cannot be deselected (and should never be selected).
    if (optionValue === undefined) {
      return;
    }

    // if the autocomplete is disabled or the option is not selected, do nothing
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

    // Options without values cannot be toggled.
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

    // Handle both NgpAutocompleteOption and T types
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
   * Register the dropdown portal with the autocomplete.
   * @param portal The dropdown portal.
   * @internal
   */
  registerPortal(portal: NgpAutocompletePortal): void {
    this.portal.set(portal);
  }

  /**
   * Register the autocomplete input with the autocomplete.
   * @param input The autocomplete input.
   * @internal
   */
  registerInput(input: NgpAutocompleteInput): void {
    this.input.set(input);
  }

  /**
   * Register the autocomplete button with the autocomplete.
   * @param button The autocomplete button.
   * @internal
   */
  registerButton(button: NgpAutocompleteButton): void {
    this.button.set(button);
  }

  /**
   * Register the dropdown with the autocomplete.
   * @param dropdown The dropdown to register.
   * @internal
   */
  registerDropdown(dropdown: NgpAutocompleteDropdown): void {
    this.dropdown.set(dropdown);
  }

  /**
   * Register an option with the autocomplete.
   * @param option The option to register.
   * @internal
   */
  registerOption(option: NgpAutocompleteOption): void {
    this.options.update(options => [...options, option]);
  }

  /**
   * Unregister an option from the autocomplete.
   * @param option The option to unregister.
   * @internal
   */
  unregisterOption(option: NgpAutocompleteOption): void {
    this.options.update(options => options.filter(o => o !== option));
  }

  /**
   * Focus the autocomplete.
   * When an input element is present, it will be focused.
   * Otherwise, the autocomplete element itself will be focused.
   * This enables keyboard navigation for autocompletes without input elements.
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
            const option = this.sortedOptions().find(opt => opt.id() === activeId);
            option?.select();
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
   * - The autocomplete button
   * - The autocomplete input
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

  private getOptionAtIndex(index: number): NgpAutocompleteOption | undefined {
    // if the option has an index, use that to get the option because this is required for virtual scrolling scenarios
    const optionIndex = this.options().findIndex(opt => opt.index() === index);

    if (optionIndex !== -1) {
      return this.options()[optionIndex];
    }

    return this.sortedOptions()[index];
  }
}

export type NgpAutocompletePlacement =
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

function isOption(value: any): value is NgpAutocompleteOption {
  return (
    value && typeof value === 'object' && 'value' in value && typeof value.value === 'function'
  );
}
