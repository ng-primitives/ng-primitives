import { computed, ElementRef, Signal, signal, WritableSignal } from '@angular/core';
import type { Placement } from '@floating-ui/dom';
import { activeDescendantManager } from 'ng-primitives/a11y';
import { ngpFormControl } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { domSort, injectElementRef } from 'ng-primitives/internal';
import type { NgpFlip, NgpOffset, NgpOverlay } from 'ng-primitives/portal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  emitter,
  listener,
  PrimitiveInjectionOptions,
  SetterOptions,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Observable } from 'rxjs';
import type { NgpSelectDropdownState } from '../select-dropdown/select-dropdown-state';
import type { NgpSelectOptionState } from '../select-option/select-option-state';
import { NgpSelectPortalState } from '../select-portal/select-portal-state';

export interface NgpSelectState<T> {
  /**
   * @internal Access the select element.
   */
  readonly elementRef: ElementRef<HTMLElement>;

  /** The unique id of the select. */
  readonly id: Signal<string>;

  /** The value of the select. */
  readonly value: WritableSignal<T | undefined>;

  /** Whether the select is multiple selection. */
  readonly multiple: Signal<boolean>;

  /** Whether the select is disabled. */
  readonly disabled: WritableSignal<boolean>;

  /** The comparator function used to compare options. */
  readonly compareWith: Signal<(a: T | undefined, b: T | undefined) => boolean>;

  /** The position of the dropdown. */
  readonly placement: Signal<Placement>;

  /** The container for the dropdown. */
  readonly container: Signal<HTMLElement | string | null>;

  /** Whether the dropdown should flip when there is not enough space. Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options. */
  readonly flip: Signal<NgpFlip>;

  /**
   * Define the offset of the select dropdown relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   */
  readonly offset: Signal<NgpOffset>;

  /**
   * A function that will scroll the active option into view. This can be overridden
   * for cases such as virtual scrolling where we cannot scroll the option directly because
   * it may not be rendered.
   */
  readonly scrollToOption: Signal<((index: number) => void) | undefined>;

  /**
   * Provide all the option values to the select. This is useful for virtual scrolling scenarios
   * where not all options are rendered in the DOM. This is not an alternative to adding the options
   * in the DOM, it is only to provide the select with the full list of options. This list should match
   * the order of the options as they would appear in the DOM.
   */
  readonly allOptions: Signal<T[] | undefined>;

  /**
   * Store the select portal.
   * @internal
   */
  readonly portal: WritableSignal<NgpSelectPortalState | undefined>;

  /**
   * Store the select dropdown.
   * @internal
   */
  readonly dropdown: WritableSignal<NgpSelectDropdownState | undefined>;

  /**
   * Store the select options.
   * @internal
   */
  readonly options: WritableSignal<NgpSelectOptionState[]>;

  /**
   * Access the overlay
   * @internal
   */
  readonly overlay: Signal<NgpOverlay<void> | null | undefined>;

  /**
   * The open state of the select.
   * @internal
   */
  readonly open: Signal<boolean>;

  /**
   * The options sorted by their index or DOM position.
   * @internal
   */
  readonly sortedOptions: Signal<NgpSelectOptionState[]>;

  /**
   * The active key descendant manager.
   * @internal
   */
  readonly activeDescendantManager: ReturnType<typeof activeDescendantManager>;

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
   * Handle the overlay being closed (e.g. via outside click or Escape).
   * Emits the openChange event and resets the active descendant.
   * @internal
   */
  onOverlayClose(): void;

  /**
   * Toggle the dropdown.
   * @internal
   */
  toggleDropdown(): Promise<void>;

  /**
   * Select an option.
   * @param index The index of the option to select.
   * @internal
   */
  selectOption(id: string): void;

  /**
   * Deselect an option.
   * @param option The option to deselect.
   * @internal
   */
  deselectOption(option: NgpSelectOptionState): void;

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
   * Register the dropdown portal with the select.
   * @param portal The dropdown portal.
   * @internal
   */
  registerPortal(portal: NgpSelectPortalState): void;

  /**
   * Register the dropdown with the select.
   * @param dropdown The dropdown to register.
   * @internal
   */
  registerDropdown(dropdown: NgpSelectDropdownState): void;

  /**
   * Register an option with the select.
   * @param option The option to register.
   * @internal
   */
  registerOption(option: NgpSelectOptionState): void;

  /**
   * Unregister an option from the select.
   * @param option The option to unregister.
   * @internal
   */
  unregisterOption(option: NgpSelectOptionState): void;

  /**
   * Focus the select.
   * @internal
   */
  focus(): void;

  /**
   * Programmatically set the value of the select. Fires `onValueChange` and
   * emits on `valueChange` by default. Pass `{ emit: false }` for cases like
   * form `writeValue` where the internal state should sync without notifying.
   */
  setValue(value: T | undefined, options?: SetterOptions): void;

  /**
   * Programmatically set the disabled state of the select. Used by the form
   * `setDisabledState` integration.
   */
  setDisabled(disabled: boolean): void;

  /**
   * Observable that emits whenever the value changes.
   */
  readonly valueChange: Observable<T | undefined>;
}

export interface NgpSelectProps<T> {
  /** The unique id of the select. */
  readonly id?: Signal<string>;

  /** The value of the select. */
  readonly value?: Signal<T | undefined>;

  /** Event emitted when the value changes. */
  readonly onValueChange?: (value: T) => void;

  /** Whether the select is multiple selection. */
  readonly multiple?: Signal<boolean>;

  /** Whether the select is disabled. */
  readonly disabled?: Signal<boolean>;

  /** Emit when the dropdown open state changes. */
  readonly onOpenChange?: (open: boolean) => void;

  /** The comparator function used to compare options. */
  readonly compareWith?: Signal<(a: T | undefined, b: T | undefined) => boolean>;

  /** The position of the dropdown. */
  readonly placement?: Signal<Placement>;

  /** The container for the dropdown. */
  readonly container?: Signal<HTMLElement | string | null>;

  /** Whether the dropdown should flip when there is not enough space. Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options. */
  readonly flip?: Signal<NgpFlip>;

  /**
   * Define the offset of the select dropdown relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   */
  readonly offset?: Signal<NgpOffset>;

  /**
   * A function that will scroll the active option into view. This can be overridden
   * for cases such as virtual scrolling where we cannot scroll the option directly because
   * it may not be rendered.
   */
  readonly scrollToOption?: Signal<((index: number) => void) | undefined>;

  /**
   * Provide all the option values to the select. This is useful for virtual scrolling scenarios
   * where not all options are rendered in the DOM. This is not an alternative to adding the options
   * in the DOM, it is only to provide the select with the full list of options. This list should match
   * the order of the options as they would appear in the DOM.
   */
  readonly allOptions?: Signal<T[] | undefined>;
}

export const [NgpSelectStateToken, ngpSelect, _injectSelectState, provideSelectState] =
  createPrimitive(
    'NgpSelect',
    <T>({
      id = signal(uniqueId('ngp-select')),
      value: _value = signal<T | undefined>(undefined),
      multiple = signal(false),
      disabled: _disabled = signal(false),
      compareWith = signal<(a: T | undefined, b: T | undefined) => boolean>(Object.is),
      placement = signal<Placement>('bottom'),
      container = signal<HTMLElement | string | null>('body'),
      flip = signal<NgpFlip>(true),
      offset = signal<NgpOffset>(0),
      scrollToOption = signal<((index: number) => void) | undefined>(undefined),
      allOptions = signal<T[] | undefined>(undefined),
      onValueChange,
      onOpenChange,
    }: NgpSelectProps<T>): NgpSelectState<T> => {
      const elementRef = injectElementRef<HTMLElement>();
      const value = controlled(_value);
      const disabled = controlled(_disabled, false);
      const valueChangeEmitter = emitter<T | undefined>();

      function setValue(newValue: T | undefined, options?: SetterOptions): void {
        value.set(newValue);
        if (options?.emit !== false) {
          onValueChange?.(newValue as T);
          valueChangeEmitter.emit(newValue);
        }
      }

      function setDisabled(isDisabled: boolean): void {
        disabled.set(isDisabled);
      }

      ngpInteractions({
        focus: true,
        focusWithin: true,
        hover: true,
        press: true,
        disabled,
      });

      ngpFormControl({ id, disabled });

      const portal = signal<NgpSelectPortalState | undefined>(undefined);
      const dropdown = signal<NgpSelectDropdownState | undefined>(undefined);
      const options = signal<NgpSelectOptionState[]>([]);

      const overlay = computed(() => portal()?.overlay());
      const open = computed(() => overlay()?.isOpen() ?? false);

      const sortedOptions = computed(() =>
        domSort(
          options(),
          option => option.elementRef.nativeElement,
          option => option.index?.(),
        ),
      );

      const activeDescendantManagerInstance = activeDescendantManager({
        // we must wrap the signal in a computed to ensure it is not used before it is defined
        disabled: computed(() => disabled()),
        wrap: signal(true),
        count: computed(() => allOptions()?.length ?? options().length),
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

      // Host bindings
      attrBinding(elementRef, 'role', 'combobox');
      attrBinding(elementRef, 'id', id);
      attrBinding(elementRef, 'aria-expanded', open);
      attrBinding(elementRef, 'aria-controls', () => (open() ? dropdown()?.id() : undefined));
      attrBinding(elementRef, 'aria-activedescendant', () =>
        open() ? activeDescendantManagerInstance.id() : undefined,
      );
      attrBinding(elementRef, 'tabindex', () => (disabled() ? -1 : 0));
      dataBinding(elementRef, 'data-open', () => (open() ? '' : null));
      dataBinding(elementRef, 'data-disabled', () => (disabled() ? '' : null));
      dataBinding(elementRef, 'data-multiple', () => (multiple() ? '' : null));

      // Event listeners
      listener(elementRef, 'click', () => void toggleDropdown());
      listener(elementRef, 'keydown', handleKeydown);
      listener(elementRef, 'blur', onBlur);

      /**
       * Open the dropdown.
       * @internal
       */
      async function openDropdown(): Promise<void> {
        if (disabled() || open()) {
          return;
        }

        onOpenChange?.(true);
        await portal()?.show();

        let selectedOptionIdx = -1;

        // if we have been provided with allOptions, we need to find the selected option(s) from that list
        if (allOptions()) {
          selectedOptionIdx = allOptions()!.findIndex(option => isOptionSelected(option));
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

      /**
       * Close the dropdown.
       * @internal
       */
      function closeDropdown(): void {
        if (!open()) {
          return;
        }

        portal()?.hide();
      }

      /**
       * Handle the overlay being closed (whether via imperative closeDropdown(),
       * outside click, or Escape). Emits openChange(false) and resets the active
       * descendant. Wired in from select-portal-state.ts via the overlay onClose
       * config — this is the single source of truth for the close-side emit so
       * external close paths (outside click, Escape) also fire openChange.
       * @internal
       */
      function onOverlayClose(): void {
        onOpenChange?.(false);
        activeDescendantManagerInstance.reset();
      }

      /**
       * Toggle the dropdown.
       * @internal
       */
      async function toggleDropdown(): Promise<void> {
        if (open()) {
          closeDropdown();
        } else {
          await openDropdown();
        }
      }

      /**
       * Select an option.
       * @param index The index of the option to select.
       * @internal
       */
      function selectOption(id: string): void {
        if (disabled()) {
          return;
        }

        const option = sortedOptions().find(opt => opt.id() === id);

        if (!option) {
          setValue(undefined, { emit: false });
          closeDropdown();
          return;
        }

        const optionValue = option.value();

        // If the option has no associated value, treat it as non-selectable.
        if (optionValue === undefined) {
          return;
        }

        if (multiple()) {
          // if the option is already selected, do nothing
          if (isOptionSelected(optionValue)) {
            return;
          }

          const newValue = [...((value() ?? []) as T[]), optionValue as T];

          // add the option to the value
          setValue(newValue as T | undefined);
        } else {
          setValue(optionValue as T | undefined);

          // close the dropdown on single selection
          closeDropdown();
        }
      }

      /**
       * Deselect an option.
       * @param option The option to deselect.
       * @internal
       */
      function deselectOption(option: NgpSelectOptionState): void {
        const optionValue = option.value();

        // Options without values cannot be deselected (and should never be selected).
        if (optionValue === undefined) {
          return;
        }

        // if the select is disabled or the option is not selected, do nothing
        // if the select is single selection, we don't allow deselecting
        if (disabled() || !isOptionSelected(optionValue) || !multiple()) {
          return;
        }

        const values = (value() as T[]) ?? [];

        const newValue = values.filter(v => !compareWith()(v, optionValue as T));

        // remove the option from the value
        setValue(newValue as T | undefined);
      }

      /**
       * Toggle the selection of an option.
       * @param id The id of the option to toggle.
       * @internal
       */
      function toggleOption(id: string): void {
        if (disabled()) {
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

        // if the state is single selection, we don't allow toggling
        if (!multiple()) {
          // always select the option in single selection mode even if it is already selected so that we update the input
          selectOption(id);
          return;
        }

        // otherwise toggle the option
        if (isOptionSelected(optionValue)) {
          deselectOption(option);
        } else {
          selectOption(id);
        }
      }

      /**
       * Determine if an option is selected.
       * @param option The option to check.
       * @internal
       */
      function isOptionSelected(option: T): boolean {
        if (disabled()) {
          return false;
        }

        const currentValue = value();

        // Only treat `undefined` as "no selection" (allow '', 0, false).
        if (currentValue === undefined) {
          return false;
        }

        if (multiple()) {
          return Array.isArray(currentValue) && currentValue.some(v => compareWith()(option, v));
        }

        return compareWith()(option, currentValue as T);
      }

      /**
       * Activate the next option in the list if there is one.
       * If there is no option currently active, activate the selected option or the first option.
       * @internal
       */
      function activateNextOption(): void {
        if (disabled()) {
          return;
        }

        const currentOptions = sortedOptions();

        // if there are no options, do nothing
        if (currentOptions.length === 0) {
          return;
        }

        // if there is no active option, activate the first option
        if (activeDescendantManagerInstance.index() === -1) {
          const selectedOption = currentOptions.findIndex(option =>
            isOptionSelected(option.value()),
          );

          // if there is a selected option(s), set the active descendant to the first selected option
          const targetOption = selectedOption !== -1 ? selectedOption : 0;

          activeDescendantManagerInstance.activateByIndex(targetOption, { origin: 'keyboard' });
          return;
        }

        // otherwise activate the next option
        activeDescendantManagerInstance.next({ origin: 'keyboard' });
      }

      /**
       * Activate the previous option in the list if there is one.
       * @internal
       */
      function activatePreviousOption(): void {
        if (disabled()) {
          return;
        }
        const currentOptions = sortedOptions();
        // if there are no options, do nothing
        if (currentOptions.length === 0) {
          return;
        }
        // if there is no active option, activate the last option
        if (activeDescendantManagerInstance.index() === -1) {
          const selectedOption = currentOptions.findIndex(option =>
            isOptionSelected(option.value()),
          );
          // if there is a selected option(s), set the active descendant to the first selected option
          const targetOption = selectedOption !== -1 ? selectedOption : currentOptions.length - 1;
          activeDescendantManagerInstance.activateByIndex(targetOption, { origin: 'keyboard' });
          return;
        }
        // otherwise activate the previous option
        activeDescendantManagerInstance.previous({ origin: 'keyboard' });
      }

      /**
       * Register the dropdown portal with the select.
       * @param portal The dropdown portal.
       * @internal
       */
      function registerPortal(portalInstance: NgpSelectPortalState): void {
        portal.set(portalInstance);
      }

      /**
       * Register the dropdown with the select.
       * @param dropdown The dropdown to register.
       * @internal
       */
      function registerDropdown(dropdownInstance: NgpSelectDropdownState): void {
        dropdown.set(dropdownInstance);
      }

      /**
       * Register an option with the select.
       * @param option The option to register.
       * @internal
       */
      function registerOption(option: NgpSelectOptionState): void {
        options.update(current => [...current, option]);
      }

      /**
       * Unregister an option from the select.
       * @param option The option to unregister.
       * @internal
       */
      function unregisterOption(option: NgpSelectOptionState): void {
        options.update(current => current.filter(o => o !== option));
      }

      /**
       * Focus the select.
       * @internal
       */
      function focus(): void {
        elementRef.nativeElement.focus();
      }

      /** Handle keydown events for accessibility. */
      function handleKeydown(event: KeyboardEvent): void {
        switch (event.key) {
          case 'ArrowDown':
            if (open()) {
              activateNextOption();
            } else {
              void openDropdown();
            }
            event.preventDefault();
            break;
          case 'ArrowUp':
            if (open()) {
              activatePreviousOption();
            } else {
              void openDropdown();
              activeDescendantManagerInstance.last();
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
            } else {
              void openDropdown();
            }
            event.preventDefault();
            break;
          case ' ':
            void toggleDropdown();
            event.preventDefault();
            break;
        }
      }

      function onBlur(event: FocusEvent): void {
        const relatedTarget = event.relatedTarget as HTMLElement;

        // if the blur was caused by focus moving to the dropdown, don't close
        if (relatedTarget && dropdown()?.elementRef.nativeElement.contains(relatedTarget)) {
          return;
        }

        closeDropdown();
        event.preventDefault();
      }

      function scrollTo(index: number): void {
        const customScrollToOption = scrollToOption();

        if (customScrollToOption) {
          customScrollToOption(index);
          return;
        }
        const option = getOptionAtIndex(index);
        if (option) {
          option.scrollIntoView();
        }
      }

      function getOptionAtIndex(index: number): NgpSelectOptionState | undefined {
        // if the option has an index, use that to get the option because this is required for virtual scrolling scenarios
        const optionIndex = options().findIndex(opt => opt.index?.() === index);

        if (optionIndex !== -1) {
          return options()[optionIndex];
        }

        return sortedOptions()[index];
      }

      return {
        elementRef,
        id,
        value: deprecatedSetter(value, 'setValue', v => setValue(v)),
        multiple,
        disabled: deprecatedSetter(disabled, 'setDisabled', setDisabled),
        compareWith,
        placement,
        container,
        flip,
        offset,
        scrollToOption,
        allOptions,
        portal,
        dropdown,
        options,
        overlay,
        open,
        sortedOptions,
        activeDescendantManager: activeDescendantManagerInstance,
        openDropdown,
        closeDropdown,
        onOverlayClose,
        toggleDropdown,
        selectOption,
        deselectOption,
        toggleOption,
        isOptionSelected,
        activateNextOption,
        activatePreviousOption,
        setValue,
        setDisabled,
        valueChange: valueChangeEmitter.asObservable(),
        registerPortal,
        registerDropdown,
        registerOption,
        unregisterOption,
        focus,
      } satisfies NgpSelectState<T>;
    },
  );

export function injectSelectState<T>(
  options?: PrimitiveInjectionOptions,
): Signal<NgpSelectState<T>> {
  return _injectSelectState(options) as Signal<NgpSelectState<T>>;
}
