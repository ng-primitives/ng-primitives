import { computed, ElementRef, signal, Signal, WritableSignal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { domSort, injectElementRef } from 'ng-primitives/internal';
import { NgpFlip, NgpOffset } from 'ng-primitives/portal';
import {
  attrBinding,
  controlled,
  controlledState,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  SetterOptions,
} from 'ng-primitives/state';
import { Observable } from 'rxjs';
import { NgpComboboxButtonState } from '../combobox-button/combobox-button-state';
import { NgpComboboxDropdownState } from '../combobox-dropdown/combobox-dropdown-state';
import { NgpComboboxInputState } from '../combobox-input/combobox-input-state';
import { NgpComboboxOptionState } from '../combobox-option/combobox-option-state';
import { NgpComboboxPortalState } from '../combobox-portal/combobox-portal-state';

type T = any;

/**
 * Public state surface for the Combobox primitive.
 */
export interface NgpComboboxState {
  /** @internal Access the element reference. */
  readonly elementRef: ElementRef<HTMLElement>;
  /** Value of the component. */
  readonly value: Signal<T>;
  /** Whether the combobox is multiple selection. */
  readonly multiple: WritableSignal<boolean>;
  /** Whether the combobox is disabled. */
  readonly disabled: WritableSignal<boolean>;
  /** Whether the combobox allow deselection in single selection mode. */
  readonly allowDeselect: WritableSignal<boolean>;
  /** The comparator function used to compare options. */
  readonly compareWith: WritableSignal<(a: T | undefined, b: T | undefined) => boolean>;
  /** The position of the dropdown */
  readonly placement: WritableSignal<NgpComboboxPlacement>;
  /** The container for the dropdown. */
  readonly container: WritableSignal<HTMLElement | string | null>;
  /** Whether the dropdown should flip when there is not enought space. Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.  */
  readonly flip: WritableSignal<NgpFlip>;
  /**
   * Define the offset of the combobox dropdown relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 0
   */
  readonly offset: WritableSignal<NgpOffset>;
  /**
   * A function that will scroll the active option into view. This can be overridden
   * for cases such as virtual scrolling where we cannot scroll the option directly because
   * it may not be rendered.
   */
  readonly scrollToOption: WritableSignal<((index: number) => void) | undefined>;
  /**
   * Provide all the option values to the combobox. This is useful for virtual scrolling scenarios
   * where not all options are rendered in the DOM. This is not an alternative to adding the options
   * in the DOM, it is only to provide the combobox with the full list of options. This list should match
   * the order of the options as they would appear in the DOM.
   */
  readonly allOptions: WritableSignal<T[] | undefined>;
  /**
   * The options sorted by their index or DOM position.
   * @internal
   */
  readonly sortedOptions: Signal<NgpComboboxOptionState[]>;
  readonly input: WritableSignal<NgpComboboxInputState | undefined>;
  readonly button: WritableSignal<NgpComboboxButtonState | undefined>;
  readonly portal: WritableSignal<NgpComboboxPortalState | undefined>;
  readonly dropdown: WritableSignal<NgpComboboxDropdownState | undefined>;
  readonly options: WritableSignal<NgpComboboxOptionState[]>;
  /** Emits when the value state changes. */
  valueChange: Observable<T>;
  /** Emits when the open state changes. */
  openChange: Observable<boolean>;
  /** Update the value value. */
  setValue(value: T, options?: SetterOptions): void;
  /** Update the multiple value */
  setMultiple(value: boolean): void;
  /** Update the disabled value. */
  setDisabled(value: boolean): void;
  /** Update the allowDeselect value. */
  setAllowDeselect(value: boolean): void;
  /** Update the compareWith value. */
  setCompareWith(value: (a: T | undefined, b: T | undefined) => boolean): void;
  /** Update the placement value. */
  setPlacement(value: NgpComboboxPlacement): void;
  /** Update the container value. */
  setContainer(value: HTMLElement | string | null): void;
  /** Update the flip value. */
  setFlip(value: NgpFlip): void;
  /** Update the offset value. */
  setOffset(value: NgpOffset): void;
  /** Update the scrollToOption value. */
  setScrollToOption(value: ((index: number) => void) | undefined): void;
  /** Updat the allOptions value. */
  setAllOptions(value: T[] | undefined): void;
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
  selectOption(option: NgpComboboxOptionState | undefined): void;
  /**
   * Deselect an option.
   * @param option The option to deselect.
   * @internal
   */
  deselectOption(option: NgpComboboxOptionState): void;
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
   * @param portal The dropdown portal.
   * @internal
   */
  registerPortal(portal: NgpComboboxPortalState): void;
  /**
   * Register the combobox input with the combobox.
   * @param input The combobox input.
   * @internal
   */
  registerInput(input: NgpComboboxInputState): void;
  /**
   * Register the combobox button with the combobox.
   * @param button The combobox button.
   * @internal
   */
  registerButton(button: NgpComboboxButtonState): void;
  /**
   * Register the dropdown with the combobox.
   * @param dropdown The dropdown to register.
   * @internal
   */
  registerDropdown(dropdown: NgpComboboxDropdownState): void;
  /**
   * Register an option with the combobox.
   * @param option The option to register.
   * @internal
   */
  registerOption(option: NgpComboboxOptionState): void;
  /**
   * Unregister an option from the combobox.
   * @param option The option to unregister.
   * @internal
   */
  unregisterOption(option: NgpComboboxOptionState): void;
  /**
   * Focus the combobox.
   * When an input element is present, it will be focused.
   * Otherwise, the combobox element itself will be focused.
   * This enables keyboard navigation for comboboxes without input elements.
   * @internal
   */
  focus(): void;
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
  handleKeydown(event: KeyboardEvent): void;
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
  onBlur(event: FocusEvent): void;
}

/**
 * Inputs for configuring the Combobox primitive.
 */
export interface NgpComboboxProps {
  /** Initial value state of the component. */
  readonly value?: Signal<T>;
  /** Initial multiple state of the component. */
  readonly multiple?: Signal<boolean>;
  /** Initial disabled state of the component. */
  readonly disabled?: Signal<boolean>;
  /** Initial allowDeselect state of the component. */
  readonly allowDeselect?: Signal<boolean>;
  /** Initial compareWith state of the component. */
  readonly compareWith?: Signal<(a: T | undefined, b: T | undefined) => boolean>;
  /** Initial position of the dropdown. */
  readonly placement?: Signal<NgpComboboxPlacement>;
  /** Initial container of the dropdown. */
  readonly container?: Signal<HTMLElement | string | null>;
  /** Initial flip state of the component. */
  readonly flip?: Signal<NgpFlip>;
  /** Initial offset state of the comopnent. */
  readonly offset?: Signal<NgpOffset>;
  /** Initial scrollToOption state of the component. */
  readonly scrollToOption?: Signal<((index: number) => void) | undefined>;
  /** Initial allOptions state of the component. */
  readonly allOptions?: Signal<T[] | undefined>;
  /** Emits when the value changes. */
  readonly onValueChange?: (value: T) => void;
  /** Emits when the dropdown open state changes. */
  readonly onOpenChange?: (value: boolean) => void;
}

export const [NgpComboboxStateToken, ngpCombobox, injectComboboxState, provideComboboxState] =
  createPrimitive(
    'NgpCombobox',
    ({
      value: _value = signal<T>(undefined),
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
      onValueChange,
      onOpenChange,
    }: NgpComboboxProps) => {
      const elementRef = injectElementRef();
      const [value, setValue, valueChange] = controlledState({
        value: _value,
        onChange: onValueChange,
      });
      const multiple = controlled(_multiple);
      const disabled = controlled(_disabled);
      const allowDeselect = controlled(_allowDeselect);
      const compareWith = controlled(_compareWith);
      const placement = controlled(_placement);
      const container = controlled(_container);
      const flip = controlled(_flip);
      const offset = controlled(_offset);
      const scrollToOption = controlled(_scrollToOption);
      const allOptions = controlled(_allOptions);

      const input = signal<NgpComboboxInputState | undefined>(undefined);
      const button = signal<NgpComboboxButtonState | undefined>(undefined);
      const portal = signal<NgpComboboxPortalState | undefined>(undefined);
      const dropdown = signal<NgpComboboxDropdownState | undefined>(undefined);
      const options = signal<NgpComboboxOptionState[]>([]);

      const overlay = computed(() => portal()?.overlay());
      const open = computed(() => overlay()?.isOpen() ?? false);
      const controlStatus = computed(() => input()?.controlStatus());

      const sortedOptions = computed(() =>
        domSort(
          options(),
          option => option.elementRef.nativeElement,
          option => option.index(),
        ),
      );

      // Setup interaction
      ngpInteractions({ focus: true, focusWithin: true, hover: true, press: true, disabled });
      // Host binding
      attrBinding(elementRef, 'tabindex', () => (input() ? -1 : disabled() ? -1 : 0));
      dataBinding(elementRef, 'data-open', open);
      dataBinding(elementRef, 'data-disabled', disabled);
      dataBinding(elementRef, 'data-multiple', multiple);
      dataBinding(elementRef, 'data-invalid', controlStatus().invalid);
      dataBinding(elementRef, 'data-valid', controlStatus().valid);
      dataBinding(elementRef, 'data-touched', controlStatus().touched);
      dataBinding(elementRef, 'data-pristine', controlStatus().pristine);
      dataBinding(elementRef, 'data-dirty', controlStatus().dirty);
      dataBinding(elementRef, 'data-pending', controlStatus().pending);
      // Event listener

      function setMultiple(value: boolean): void {
        multiple.set(value);
      }

      function setDisabled(value: boolean): void {
        disabled.set(value);
      }

      function setAllowDeselect(value: boolean): void {
        allowDeselect.set(value);
      }

      function setCompareWith(value: (a: T | undefined, b: T | undefined) => boolean): void {
        compareWith.set(value);
      }

      function setPlacement(value: NgpComboboxPlacement): void {
        placement.set(value);
      }

      function setContainer(value: HTMLElement | string | null): void {
        container.set(value);
      }

      function setFlip(value: NgpFlip): void {
        flip.set(value);
      }

      function setOffset(value: NgpOffset): void {
        offset.set(value);
      }

      function setScrollToOption(value: ((index: number) => void) | undefined): void {
        scrollToOption.set(value);
      }

      function setAllOptions(value: T[] | undefined): void {
        allOptions.set(value);
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

      function registerOption(value: NgpComboboxOptionState): void {
        options.update(options => [...options, value]);
      }

      function unregisterOption(value: NgpComboboxOptionState): void {
        options.update(options => options.filter(o => o !== value));
      }

      return {
        elementRef,
        value: deprecatedSetter(value, 'setValue', setValue),
        multiple: deprecatedSetter(multiple, 'setMultiple', setMultiple),
        disabled: deprecatedSetter(disabled, 'setDisabled', setDisabled),
        allowDeselect: deprecatedSetter(allowDeselect, 'setAllowDeselect', setAllowDeselect),
        compareWith: deprecatedSetter(compareWith, 'setCompareWith', setCompareWith),
        placement: deprecatedSetter(placement, 'setPlacement', setPlacement),
        container: deprecatedSetter(container, 'setContainer', setContainer),
        flip: deprecatedSetter(flip, 'setFlip', setFlip),
        offset: deprecatedSetter(offset, 'setOffset', setOffset),
        scrollToOption: deprecatedSetter(scrollToOption, 'setScrollToOption', setScrollToOption),
        allOptions: deprecatedSetter(allOptions, 'setAllOptions', setAllOptions),
        setValue,
        setMultiple,
        setDisabled,
        setAllowDeselect,
        setCompareWith,
        setPlacement,
        setContainer,
        setFlip,
        setOffset,
        setAllOptions,
        valueChange,
        registerPortal,
        registerInput,
        registerButton,
        registerDropdown,
        registerOption,
        unregisterOption,
        input,
        button,
        portal,
        dropdown,
        options,
      } satisfies NgpComboboxState;
    },
  );

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

function isOption(value: any): value is NgpComboboxOptionState {
  return (
    value && typeof value === 'object' && 'value' in value && typeof value.value === 'function'
  );
}
