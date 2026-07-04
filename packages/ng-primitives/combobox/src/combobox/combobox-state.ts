import {
  computed,
  effect,
  ElementRef,
  signal,
  Signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { activeDescendantManager } from 'ng-primitives/a11y';
import { ngpInteractions } from 'ng-primitives/interactions';
import { domSort, injectElementRef } from 'ng-primitives/internal';
import { NgpFlip, NgpOffset, NgpOverlay } from 'ng-primitives/portal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  emitter,
  listener,
  SetterOptions,
  StateInjectionOptions,
} from 'ng-primitives/state';
import { controlStatus as getControlStatus } from 'ng-primitives/utils';
import { Observable } from 'rxjs';
import { NgpComboboxButtonState } from '../combobox-button/combobox-button-state';
import { NgpComboboxDropdownState } from '../combobox-dropdown/combobox-dropdown-state';
import { NgpComboboxInputState } from '../combobox-input/combobox-input-state';
import { NgpComboboxOptionState } from '../combobox-option/combobox-option-state';
import { NgpComboboxPortalState } from '../combobox-portal/combobox-portal-state';
import { areAllOptionsSelected } from '../utils';

/**
 * Public state surface for the Combobox primitive.
 */
export interface NgpComboboxState<T> {
  /** @internal Access the combobox reference. */
  readonly elementRef: ElementRef<HTMLElement>;
  /** The value of the combobox. */
  readonly value: WritableSignal<T | undefined>;
  /** Whether the combobox is multiple selection. */
  readonly multiple: Signal<boolean>;
  /** Whether the combobox is disabled. */
  readonly disabled: Signal<boolean>;
  /** Whether the combobox allows deselection in single selection mode. */
  readonly allowDeselect: Signal<boolean>;
  /** The comparator function used to compare options. */
  readonly compareWith: Signal<(a: T | undefined, b: T | undefined) => boolean>;
  /** The position of the dropdown. */
  readonly placement: Signal<NgpComboboxPlacement>;
  /** The container for the dropdown. */
  readonly container: Signal<HTMLElement | string | null>;
  /** Whether the dropdown should flip when there is not enough space. Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options. */
  readonly flip: Signal<NgpFlip>;
  /**
   * Define the offset of the combobox dropdown relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 0
   */
  readonly offset: Signal<NgpOffset>;
  /**
   * A function that will scroll the active option into view. This can be overridden
   * for cases such as virtual scrolling where we cannot scroll the option directly because
   * it may not be rendered.
   */
  readonly scrollToOption: Signal<((index: number) => void) | undefined>;
  /**
   * Provide all the option values to the combobox. This is useful for virtual scrolling scenarios
   * where not all options are rendered in the DOM. This is not an alternative to adding the options
   * in the DOM, it is only to provide the combobox with the full list of options. This list should match
   * the order of the options as they would appear in the DOM.
   */
  readonly allOptions: Signal<T[] | undefined>;
  /** Event emitted when the value changes. */
  readonly valueChange: Observable<T | undefined>;
  /**
   * Store the combobox input
   * @internal
   */
  readonly input: Signal<NgpComboboxInputState | undefined>;
  /**
   * Store the combobox button.
   * @internal
   */
  readonly button: Signal<NgpComboboxButtonState | undefined>;
  /**
   * Store the combobox portal.
   * @internal
   */
  readonly portal: Signal<NgpComboboxPortalState | undefined>;
  /**
   * Store the combobox dropdown.
   * @internal
   */
  readonly dropdown: Signal<NgpComboboxDropdownState | undefined>;
  /**
   * Store the combobox options.
   * @internal
   */
  readonly options: Signal<NgpComboboxOptionState<T>[]>;
  /**
   * Access the overlay
   * @internal
   */
  readonly overlay: Signal<NgpOverlay<void> | null | undefined>;
  /**
   * The open state of the combobox.
   * @internal
   */
  readonly open: Signal<boolean>;
  /**
   * The options sorted by their index or DOM position.
   * @internal
   */
  readonly sortedOptions: Signal<NgpComboboxOptionState<T>[]>;
  /**
   * The active key descendant manager.
   * @internal
   */
  readonly activeDescendantManager: ReturnType<typeof activeDescendantManager>;
  /** Update the value value. */
  setValue(value: T | T[] | undefined, options?: SetterOptions): void;
  /**
   * Open the dropdown.
   * @internal
   */
  openDropdown(): Promise<void>;
  /**
   * Close the dropdown.
   * @internal
   */
  closeDropdown(): void;
  /**
   * Handles the dropdown being closed.
   * Emits the openChange event and resets the active descendant.
   * @internal
   */
  onOverlayClosed(): void;
  /**
   * Toggle the dropdown.
   * @internal
   */
  toggleDropdown(): Promise<void>;
  /**
   * Select an option.
   * @param option The option to select.
   * @internal
   */
  selectOption(option: NgpComboboxOptionState<T> | undefined): void;
  /**
   * Deselect an option.
   * @param option The option to deselect.
   * @internal
   */
  deselectOption(option: NgpComboboxOptionState<T>): void;
  /**
   * Toggle the selection of an option.
   * @param id The id of the option to toggle.
   * @internal
   */
  toggleOption(id: string): void;
  /**
   * Determine if an option is selected.
   * @param option The option to check.
   * @internal
   */
  isOptionSelected(option: T): boolean;
  /**
   * Activate the next option in the list if there is one.
   * If there is no option currently active, activate the selected option or the first option.
   * @internal
   */
  activateNextOption(): void;
  /**
   * Activate the previous option in the list if there is one.
   * @internal
   */
  activatePreviousOption(): void;
  /**
   * Register the dropdown portal with the combobox.
   * @param value The dropdown portal.
   * @internal
   */
  registerPortal(value: NgpComboboxPortalState): void;
  /**
   * Register the combobox input with the combobox.
   * @param value The combobox input.
   * @internal
   */
  registerInput(value: NgpComboboxInputState): void;
  /**
   * Register the combobox button with the combobox.
   * @param value The combobox button.
   * @internal
   */
  registerButton(value: NgpComboboxButtonState): void;
  /**
   * Register the dropdown with the combobox.
   * @param value The dropdown to register.
   * @internal
   */
  registerDropdown(value: NgpComboboxDropdownState): void;
  /**
   * Register an option with the combobox.
   * @param value The option to register.
   * @internal
   */
  registerOption(value: NgpComboboxOptionState<T>): void;
  /**
   * Unregister an option from the combobox.
   * @param value The option to unregister.
   * @internal
   */
  unregisterOption(value: NgpComboboxOptionState<T>): void;
  /**
   * Focus the combobox.
   * When an input element is present, it will be focused.
   * Otherwise, the combobox element itself will be focused.
   * This enables keyboard navigation for comboboxes without input elements.
   * @internal
   */
  focus(): void;
}

/**
 * Inputs for configuring the Combobox primitive.
 */
export interface NgpComboboxProps<T> {
  /** The value of the combobox. */
  readonly value?: Signal<T | undefined>;
  /** Whether the combobox is multiple selection. */
  readonly multiple?: Signal<boolean>;
  /** Whether the combobox is disabled. */
  readonly disabled?: Signal<boolean>;
  /** Whether the combobox allows deselection in single selection mode. */
  readonly allowDeselect?: Signal<boolean>;
  /** The comparator function used to compare options. */
  readonly compareWith?: Signal<(a: T | undefined, b: T | undefined) => boolean>;
  /** The position of the dropdown. */
  readonly placement?: Signal<NgpComboboxPlacement>;
  /** The container for the dropdown. */
  readonly container?: Signal<HTMLElement | string | null>;
  /** Whether the dropdown should flip when there is not enough space. Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options. */
  readonly flip?: Signal<NgpFlip>;
  /**
   * Define the offset of the combobox dropdown relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 0
   */
  readonly offset?: Signal<NgpOffset>;
  /**
   * A function that will scroll the active option into view. This can be overridden
   * for cases such as virtual scrolling where we cannot scroll the option directly because
   * it may not be rendered.
   */
  readonly scrollToOption?: Signal<((index: number) => void) | undefined>;
  /**
   * Provide all the option values to the combobox. This is useful for virtual scrolling scenarios
   * where not all options are rendered in the DOM. This is not an alternative to adding the options
   * in the DOM, it is only to provide the combobox with the full list of options. This list should match
   * the order of the options as they would appear in the DOM.
   */
  readonly allOptions?: Signal<T[] | undefined>;
  /** Callback fired when the open state changes. */
  readonly onOpenChange?: (value: boolean) => void;
  /** Callback fired when the value state changes. */
  readonly onValueChange?: (value: T | undefined) => void;
}

export const [NgpComboboxStateToken, ngpCombobox, _injectComboboxState, provideComboboxState] =
  createPrimitive(
    'NgpCombobox',
    <T>({
      value: _value = signal<T | undefined>(undefined),
      multiple: _multiple = signal<boolean>(false),
      disabled: _disabled = signal<boolean>(false),
      allowDeselect: _allowDeselect = signal<boolean>(false),
      compareWith: _compareWith = signal<(a: T | undefined, b: T | undefined) => boolean>(
        Object.is,
      ),
      placement: _placement = signal<NgpComboboxPlacement>('bottom'),
      container: _container = signal<HTMLElement | string | null>('body'),
      flip: _flip = signal<NgpFlip>(true),
      offset: _offset = signal<NgpOffset>(0),
      scrollToOption: _scrollToOption = signal<((index: number) => void) | undefined>(undefined),
      allOptions: _allOptions = signal<T[] | undefined>(undefined),
      onOpenChange,
      onValueChange,
    }: NgpComboboxProps<T>): NgpComboboxState<T> => {
      const elementRef = injectElementRef<HTMLElement>();

      const value = controlled<T | undefined>(_value);
      const valueChange = emitter<T | undefined>();

      const input = signal<NgpComboboxInputState | undefined>(undefined);
      const button = signal<NgpComboboxButtonState | undefined>(undefined);
      const portal = signal<NgpComboboxPortalState | undefined>(undefined);
      const dropdown = signal<NgpComboboxDropdownState | undefined>(undefined);
      const options = signal<NgpComboboxOptionState<T>[]>([]);
      const hostControlStatus = getControlStatus();

      const overlay = computed(() => portal()?.overlay());
      const open = computed(() => overlay()?.isOpen() ?? false);
      const sortedOptions = computed(() =>
        domSort(
          options(),
          option => option.elementRef.nativeElement,
          option => option.index(),
        ),
      );
      const controlStatus = computed(() =>
        input() ? input()?.controlStatus() : hostControlStatus(),
      );

      const activeDescendantManagerInstance = activeDescendantManager({
        // we must wrap the signal in a computed to ensure it is not used before it is defined
        disabled: computed(() => _disabled()),
        wrap: signal(true),
        count: computed(() => _allOptions()?.length ?? options().length),
        getItemId: index => getOptionAtIndex(index)?.id(),
        isItemDisabled: index => getOptionAtIndex(index)?.disabled() ?? false,
        scrollIntoView: index => {
          const isPositioned = portal()?.overlay()?.isPositioned() ?? false;

          if (!isPositioned || index === -1) {
            return;
          }

          scrollTo(index);
        },
      });

      // Setup effect
      // When the visible (or virtual) options change while open, revalidate so the
      // active index can't point at a removed option and leave a stale aria-activedescendant.
      effect(() => {
        sortedOptions();
        _allOptions();

        if (open()) {
          untracked(() => activeDescendantManagerInstance.validate());
        }
      });

      // Setup interaction
      ngpInteractions({
        focus: true,
        focusWithin: true,
        hover: true,
        press: true,
        disabled: _disabled,
      });

      // Host binding
      attrBinding(elementRef, 'tabindex', () => (input() ? -1 : _disabled() ? -1 : 0));
      dataBinding(elementRef, 'data-open', () => (open() ? '' : null));
      dataBinding(elementRef, 'data-disabled', () => (_disabled() ? '' : null));
      dataBinding(elementRef, 'data-multiple', () => (_multiple() ? '' : null));
      dataBinding(elementRef, 'data-invalid', () => (controlStatus()?.invalid ? '' : null));
      dataBinding(elementRef, 'data-valid', () => (controlStatus()?.valid ? '' : null));
      dataBinding(elementRef, 'data-touched', () => (controlStatus()?.touched ? '' : null));
      dataBinding(elementRef, 'data-pristine', () => (controlStatus()?.pristine ? '' : null));
      dataBinding(elementRef, 'data-dirty', () => (controlStatus()?.dirty ? '' : null));
      dataBinding(elementRef, 'data-pending', () => (controlStatus()?.pending ? '' : null));

      // Event listener
      listener(elementRef, 'keydown', (event: KeyboardEvent) => {
        // If the event originated from the input element, let the input handle it
        if (input() && event.target === input()?.elementRef.nativeElement) {
          return;
        }

        switch (event.key) {
          case 'ArrowDown':
            if (open()) {
              activateNextOption();
            } else {
              openDropdown();
            }
            event.preventDefault();
            break;
          case 'ArrowUp':
            if (open()) {
              activatePreviousOption();
            } else {
              openDropdown();
              // Use setTimeout to ensure dropdown is rendered before selecting last item
              setTimeout(() => activeDescendantManagerInstance.last());
            }
            event.preventDefault();
            break;
          case 'Home':
            if (open()) {
              activeDescendantManagerInstance.first({ origin: 'keyboard' });
            }
            event.preventDefault();
            break;
          case 'End':
            if (open()) {
              activeDescendantManagerInstance.last({ origin: 'keyboard' });
            }
            event.preventDefault();
            break;
          case 'Enter':
            if (open()) {
              const activeId = activeDescendantManagerInstance.id();

              if (activeId) {
                const option = sortedOptions().find(opt => opt.id() === activeId);
                option?.select();
              }
            }
            event.preventDefault();
            break;
          case 'Escape':
            if (open()) {
              closeDropdown();
            }
            event.preventDefault();
            break;
          case ' ':
            if (!input()) {
              toggleDropdown();
              event.preventDefault();
            }
            break;
        }
      });
      listener(elementRef, 'blur', (event: FocusEvent) => {
        const relatedTarget = event.relatedTarget as HTMLElement;

        // if the blur was caused by focus moving to the dropdown, don't close
        if (relatedTarget && dropdown()?.elementRef.nativeElement.contains(relatedTarget)) {
          return;
        }

        // if the blur was caused by focus moving to the button, don't close
        if (relatedTarget && button()?.elementRef.nativeElement.contains(relatedTarget)) {
          return;
        }

        // if the blur was caused by focus moving to the input, don't close
        if (relatedTarget && input()?.elementRef.nativeElement === relatedTarget) {
          return;
        }

        closeDropdown();
      });

      function setValue(val: T | undefined, options?: SetterOptions): void {
        value.set(val);

        if (options?.emit !== false) {
          valueChange.emit(val);
          onValueChange?.(val);
        }
      }

      async function openDropdown(): Promise<void> {
        if (_disabled() || open()) {
          return;
        }

        onOpenChange?.(true);
        await portal()?.show();

        let selectedOptionIdx = -1;

        // if we have been provided with allOptions, we need to find the selected option(s) from that list
        if (_allOptions()) {
          selectedOptionIdx = _allOptions()!.findIndex(option => isOptionSelected(option));
        }

        // if we don't have allOptions, find the selected option(s) from the registered options
        if (selectedOptionIdx === -1) {
          // if there is a selected option(s), set the active descendant to the first selected option
          selectedOptionIdx = sortedOptions().findIndex(option => isOptionSelected(option.value()));
        }

        // if after checking there is a selected option, set the active descendant to the first option
        if (selectedOptionIdx !== -1) {
          // scroll to and activate the selected option
          scrollTo(selectedOptionIdx);
          activeDescendantManagerInstance.activateByIndex(selectedOptionIdx);
          return;
        }

        // activate the selected option or the first option
        activeDescendantManagerInstance.first();
      }

      function closeDropdown(): void {
        if (!open()) {
          return;
        }
        portal()?.detach();
      }

      function onOverlayClosed(): void {
        onOpenChange?.(false);
        // clear the active descendant
        activeDescendantManagerInstance.reset();
      }

      async function toggleDropdown(): Promise<void> {
        if (open()) {
          closeDropdown();
        } else {
          await openDropdown();
        }
      }

      function selectOption(option: NgpComboboxOptionState<T> | undefined): void {
        if (_disabled()) {
          return;
        }

        if (!option) {
          setValue(undefined);
          closeDropdown();
          return;
        }

        const optionValue = option.value();

        // if the option has no associated value, do nothing
        if (optionValue === undefined) {
          return;
        }

        // Handle select all functionality - only works in multiple selection mode
        if (optionValue === 'all') {
          if (!_multiple()) {
            return; // Do nothing in single selection mode
          }

          // Get currently visible regular options (respects filtering)
          const regularOptions = sortedOptions().filter(
            opt => opt.value() !== 'all' && opt.value() !== undefined,
          );
          const allValues = regularOptions.map(opt => opt.value());

          setValue(allValues as T);
          return;
        }

        if (_multiple()) {
          // if the option is already selected, do nothing
          if (isOptionSelected(optionValue)) {
            return;
          }

          const newValue = [...((value() as T[] | undefined) ?? []), optionValue as T];

          // add the option to the value
          setValue(newValue as T);
        } else {
          setValue(optionValue as T);

          // close the dropdown on single selection
          closeDropdown();
        }
      }

      function deselectOption(option: NgpComboboxOptionState<T>): void {
        const optionValue = option.value();

        // Options without values cannot be deselected (and should never be selected).
        if (optionValue === undefined) {
          return;
        }

        // if the combobox is disabled or the option is not selected, do nothing
        if (_disabled() || !isOptionSelected(optionValue)) {
          return;
        }

        // in single selection mode, only allow deselecting if allowDeselect is true
        if (!_multiple() && !_allowDeselect()) {
          return;
        }

        // Handle select all for deselect all functionality - only works in multiple selection mode
        if (optionValue === 'all') {
          if (!_multiple()) {
            return; // Do nothing in single selection mode
          }

          setValue([] as T);
          return;
        }

        if (_multiple()) {
          const values = (value() as T[]) ?? [];
          const newValue = values.filter(v => !_compareWith()(v, optionValue as T));

          // remove the option from the value
          setValue(newValue as T);
        } else {
          // in single selection mode with allowDeselect enabled, set value to undefined
          setValue(undefined);
        }
      }

      function toggleOption(id: string): void {
        if (_disabled()) {
          return;
        }

        const option = sortedOptions().find(opt => opt.id() === id);

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
          if (!_multiple()) {
            return; // Do nothing in single selection mode
          }

          if (isOptionSelected(optionValue)) {
            deselectOption(option);
          } else {
            selectOption(option);
          }
          return;
        }

        if (_multiple()) {
          // In multiple selection mode, always allow toggling
          if (isOptionSelected(optionValue)) {
            deselectOption(option);
          } else {
            selectOption(option);
          }
        } else {
          // In single selection mode, check if deselection is allowed
          if (isOptionSelected(optionValue) && _allowDeselect()) {
            // Deselect the option by setting value to undefined
            setValue(undefined);
          } else {
            // Select the option (works even if already selected to update the input)
            selectOption(option);
          }
        }
      }

      function isOptionSelected(option: T | undefined): boolean {
        if (_disabled()) {
          return false;
        }

        // Handle both NgpComboboxOption and T types
        const optionValue = isOption(option) ? option.value() : (option as T);
        const currentValue = value();

        // Only treat `undefined` as "no value" (allow '', 0, false).
        if (optionValue === undefined) {
          return false;
        }

        // Handle select all functionality - only works in multiple selection mode
        if (optionValue === 'all') {
          if (!_multiple()) {
            return false; // Never selected in single selection mode
          }

          const selectedValues = Array.isArray(currentValue) ? currentValue : [];
          return areAllOptionsSelected(sortedOptions(), selectedValues, _compareWith());
        }

        // Only treat `undefined` as "no selection" (allow '', 0, false).
        if (value() === undefined) {
          return false;
        }

        if (_multiple()) {
          return (
            Array.isArray(currentValue) && currentValue.some(v => _compareWith()(optionValue, v))
          );
        }

        return _compareWith()(optionValue, currentValue);
      }

      function activateNextOption(): void {
        if (_disabled()) {
          return;
        }

        const options = sortedOptions();

        // if there are no options, do nothing
        if (options.length === 0) {
          return;
        }

        // if there is no active option, activate the first option
        if (activeDescendantManagerInstance.index() === -1) {
          const selectedOption = options.findIndex(option => isOptionSelected(option.value()));

          // if there is a selected option(s), set the active descendant to the first selected option
          const targetOption = selectedOption !== -1 ? selectedOption : 0;

          activeDescendantManagerInstance.activateByIndex(targetOption, { origin: 'keyboard' });
          return;
        }

        // otherwise activate the next option
        activeDescendantManagerInstance.next({ origin: 'keyboard' });
      }

      function activatePreviousOption(): void {
        if (_disabled()) {
          return;
        }
        const options = sortedOptions();
        // if there are no options, do nothing
        if (options.length === 0) {
          return;
        }
        // if there is no active option, activate the last option
        if (activeDescendantManagerInstance.index() === -1) {
          const selectedOption = options.findIndex(option => isOptionSelected(option.value()));
          // if there is a selected option(s), set the active descendant to the first selected option
          const targetOption = selectedOption !== -1 ? selectedOption : options.length - 1;
          activeDescendantManagerInstance.activateByIndex(targetOption, { origin: 'keyboard' });
          return;
        }
        // otherwise activate the previous option
        activeDescendantManagerInstance.previous({ origin: 'keyboard' });
      }

      function registerPortal(value: NgpComboboxPortalState): void {
        portal.set(value);
      }

      function registerInput(value: NgpComboboxInputState): void {
        input.set(value);
      }

      function registerButton(value: NgpComboboxButtonState): void {
        button.set(value);
      }

      function registerDropdown(value: NgpComboboxDropdownState): void {
        dropdown.set(value);
      }

      function registerOption(value: NgpComboboxOptionState<T>): void {
        options.update(options => [...options, value]);
      }

      function unregisterOption(value: NgpComboboxOptionState<T>): void {
        options.update(options => options.filter(o => o !== value));
      }

      function focus(): void {
        if (input()) {
          input()?.focus();
        } else {
          elementRef.nativeElement.focus();
        }
      }

      function scrollTo(index: number): void {
        const scrollToOption = _scrollToOption();

        if (scrollToOption) {
          scrollToOption(index);
          return;
        }

        const option = getOptionAtIndex(index);
        if (option) {
          option.scrollIntoView();
        }
      }

      function getOptionAtIndex(index: number): NgpComboboxOptionState<T> | undefined {
        // if the option has an index, use that to get the option because this is required for virtual scrolling scenarios
        const optionIndex = options().findIndex(opt => opt.index() === index);

        if (optionIndex !== -1) {
          return options()[optionIndex];
        }

        return sortedOptions()[index];
      }

      function isOption(value: any): value is NgpComboboxOptionState<T> {
        return (
          value &&
          typeof value === 'object' &&
          'value' in value &&
          typeof value.value === 'function'
        );
      }

      return {
        elementRef,
        value: deprecatedSetter(value, 'setValue', setValue),
        valueChange: valueChange.asObservable(),
        setValue,
        multiple: _multiple,
        disabled: _disabled,
        allowDeselect: _allowDeselect,
        compareWith: _compareWith,
        placement: _placement,
        container: _container,
        flip: _flip,
        offset: _offset,
        scrollToOption: _scrollToOption,
        allOptions: _allOptions,
        input,
        button,
        portal,
        dropdown,
        options,
        overlay,
        open,
        sortedOptions,
        activeDescendantManager: activeDescendantManagerInstance,
        openDropdown,
        closeDropdown,
        onOverlayClosed,
        toggleDropdown,
        selectOption,
        deselectOption,
        toggleOption,
        isOptionSelected,
        activateNextOption,
        activatePreviousOption,
        registerPortal,
        registerInput,
        registerButton,
        registerDropdown,
        registerOption,
        unregisterOption,
        focus,
      } satisfies NgpComboboxState<T>;
    },
  );

export function injectComboboxState<T>(
  options?: StateInjectionOptions,
): Signal<NgpComboboxState<T>> {
  return _injectComboboxState(options) as Signal<NgpComboboxState<T>>;
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
