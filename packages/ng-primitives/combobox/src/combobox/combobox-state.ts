import { output, OutputEmitterRef, signal, Signal } from '@angular/core';
import { truncate } from 'fs';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpFlip, NgpOffset } from 'ng-primitives/portal';
import {
  attrBinding,
  controlled,
  controlledState,
  createPrimitive,
  deprecatedSetter,
  emitter,
} from 'ng-primitives/state';
import { Observable } from 'rxjs';
import { NgpComboboxButton } from '../combobox-button/combobox-button';
import { NgpComboboxDropdown } from '../combobox-dropdown/combobox-dropdown';
import { NgpComboboxInput } from '../combobox-input/combobox-input';
import { NgpComboboxOption } from '../combobox-option/combobox-option';
import { NgpComboboxPortal } from '../combobox-portal/combobox-portal';

type T = any;

/**
 * Public state surface for the Combobox primitive.
 */
export interface NgpComboboxState {
  /** Value of the component. */
  readonly value: Signal<T>;
  /** Whether the combobox is multiple selection. */
  readonly multiple: Signal<boolean>;
  /** Whether the combobox is disabled. */
  readonly disabled: Signal<boolean>;
  /** Whether the combobox allow deselection in single selection mode. */
  readonly allowDeselect: Signal<boolean>;
  /** The comparator function used to compare options. */
  readonly compareWith: Signal<(a: T | undefined, b: T | undefined) => boolean>;
  /** The position of the dropdown */
  readonly placement: Signal<NgpComboboxPlacement>;
  /** The container for the dropdown. */
  readonly container: Signal<HTMLElement | string | null>;
  /** Whether the dropdown should flip when there is not enought space. Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.  */
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
  /** Emits when the value state changes. */
  valueChange: Observable<T>;
  /** Emits when the multiple state changes. */
  multipleChange: Observable<boolean>;
  /** Emits when the disabled state changes. */
  disabledChange: Observable<boolean>;
  /** Emits when the allowDeselect state changes. */
  allowDeselectChange: Observable<boolean>;
  /** Emits when the compareWith state changes. */
  compareWithChange: Observable<(a: T | undefined, b: T | undefined) => boolean>;
  /** Emits when the placement state changes. */
  placementChange: Observable<NgpComboboxPlacement>;
  /** Emits when the container state changes. */
  containerChange: Observable<HTMLElement | string | null>;
  /** Emits when the flip state changes. */
  flipChange: Observable<NgpFlip>;
  /** Emits when the offset state changes. */
  offsetChange: Observable<NgpOffset>;
  /** Emits when the scrollToOption state changes. */
  scrollToOptionChange: Observable<((index: number) => void) | undefined>;
  /** Emits when the allOptions state changes. */
  allOptionsChange: Observable<T[] | undefined>;
  /** Update the value value. */
  setValue(value: T): void;
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
  selectOption(option: NgpComboboxOption | undefined): void;
  /**
   * Deselect an option.
   * @param option The option to deselect.
   * @internal
   */
  deselectOption(option: NgpComboboxOption): void;
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
  registerPortal(portal: NgpComboboxPortal): void;
  /**
   * Register the combobox input with the combobox.
   * @param input The combobox input.
   * @internal
   */
  registerInput(input: NgpComboboxInput): void;
  /**
   * Register the combobox button with the combobox.
   * @param button The combobox button.
   * @internal
   */
  registerButton(button: NgpComboboxButton): void;
  /**
   * Register the dropdown with the combobox.
   * @param dropdown The dropdown to register.
   * @internal
   */
  registerDropdown(dropdown: NgpComboboxDropdown): void;
  /**
   * Register an option with the combobox.
   * @param option The option to register.
   * @internal
   */
  registerOption(option: NgpComboboxOption): void;
  /**
   * Unregister an option from the combobox.
   * @param option The option to unregister.
   * @internal
   */
  unregisterOption(option: NgpComboboxOption): void;
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
  readonly onOpenChange: (value: boolean) => void;
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
      const element = injectElementRef();
      const [value, setValue, valueChange] = controlledState({
        value: _value,
        onChange: onValueChange,
      });
      const [multiple, multipleChange] = [controlled(_multiple), emitter<boolean>()];
      const [disabled, disabledChange] = [controlled(_disabled), emitter<boolean>()];
      const [allowDeselect, allowDeselectChange] = [controlled(_allowDeselect), emitter<boolean>()];
      const [compareWith, compareWithChange] = [
        controlled(_compareWith),
        emitter<(a: T | undefined, b: T | undefined) => boolean>(),
      ];
      const [placement, placementChange] = [
        controlled(_placement),
        emitter<NgpComboboxPlacement>(),
      ];
      const [container, containerChange] = [
        controlled(_container),
        emitter<HTMLElement | string | null>(),
      ];
      const [flip, flipChange] = [controlled(_flip), emitter<NgpFlip>()];
      const [offset, offsetChange] = [controlled(_offset), emitter<NgpOffset>()];
      const [scrollToOption, scrollToOptionChange] = [
        controlled(_scrollToOption),
        emitter<((index: number) => void) | undefined>(),
      ];
      const [allOptions, allOptionsChange] = [controlled(_allOptions), emitter<T[] | undefined>()];

      // Setup interaction
      ngpInteractions({ focus: true, focusWithin: true, hover: true, press: true, disabled });
      // Host binding
      // Event listener

      function setMultiple(value: boolean): void {
        multiple.set(value);
        multipleChange.emit(value);
      }

      function setDisabled(value: boolean): void {
        disabled.set(value);
        disabledChange.emit(value);
      }

      function setAllowDeselect(value: boolean): void {
        allowDeselect.set(value);
        allowDeselectChange.emit(value);
      }

      function setCompareWith(value: (a: T | undefined, b: T | undefined) => boolean): void {
        compareWith.set(value);
        compareWithChange.emit(value);
      }

      function setPlacement(value: NgpComboboxPlacement): void {
        placement.set(value);
        placementChange.emit(value);
      }

      function setContainer(value: HTMLElement | string | null): void {
        container.set(value);
        containerChange.emit(value);
      }

      function setFlip(value: NgpFlip): void {
        flip.set(value);
        flipChange.emit(value);
      }

      function setOffset(value: NgpOffset): void {
        offset.set(value);
        offsetChange.emit(value);
      }

      function setScrollToOption(value: ((index: number) => void) | undefined): void {
        scrollToOption.set(value);
        scrollToOptionChange.emit(value);
      }

      function setAllOptions(value: T[] | undefined): void {
        allOptions.set(value);
        allOptionsChange.emit(value);
      }

      return {
        value: deprecatedSetter(value, 'setValue', setValue),
        setValue: setValue,
        valueChange: valueChange,
        multiple: deprecatedSetter(multiple, 'setMultiple', setMultiple),
        setMultiple: setMultiple,
        multipleChange: multipleChange.asObservable(),
        disabled: deprecatedSetter(disabled, 'setDisabled', setDisabled),
        setDisabled: setDisabled,
        disabledChange: disabledChange.asObservable(),
        allowDeselect: deprecatedSetter(allowDeselect, 'setAllowDeselect', setAllowDeselect),
        setAllowDeselect: setAllowDeselect,
        allowDeselectChange: allowDeselectChange.asObservable(),
        compareWith: deprecatedSetter(compareWith, 'setCompareWith', setCompareWith),
        setCompareWith: setCompareWith,
        compareWithChange: compareWithChange.asObservable(),
        placement: deprecatedSetter(placement, 'setPlacement', setPlacement),
        setPlacement: setPlacement,
        placementChange: placementChange.asObservable(),
        container: deprecatedSetter(container, 'setContainer', setContainer),
        setContainer: setContainer,
        containerChange: containerChange.asObservable(),
        flip: deprecatedSetter(flip, 'setFlip', setFlip),
        setFlip: setFlip,
        flipChange: flipChange.asObservable(),
        offset: deprecatedSetter(offset, 'setOffset', setOffset),
        setOffset: setOffset,
        offsetChange: offsetChange.asObservable(),
        scrollToOption: deprecatedSetter(scrollToOption, 'setScrollToOption', setScrollToOption),
        setScrollToOption: setScrollToOption,
        scrollToOptionChange: scrollToOptionChange.asObservable(),
        allOptions: deprecatedSetter(allOptions, 'setAllOptions', setAllOptions),
        setAllOptions: setAllOptions,
        allOptionsChange: allOptionsChange.asObservable(),
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

function isOption(value: any): value is NgpComboboxOption {
  return (
    value && typeof value === 'object' && 'value' in value && typeof value.value === 'function'
  );
}
