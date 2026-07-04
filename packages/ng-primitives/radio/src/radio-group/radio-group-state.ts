import { Signal, signal, WritableSignal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { ngpFormControl } from 'ng-primitives/form-field';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpRovingFocusGroupState } from 'ng-primitives/roving-focus';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  emitter,
  SetterOptions,
  StateInjectionOptions,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Observable } from 'rxjs';

/**
 * Public state surface for the RadioGroup primitive.
 */
export interface NgpRadioGroupState<T> {
  /**
   * The id of the radio group.
   */
  readonly id: Signal<string>;
  /**
   * The selected value of the radio group.
   */
  readonly value: WritableSignal<T | null>;
  /**
   * Whether the radio group is disabled.
   */
  readonly disabled: WritableSignal<boolean>;
  /**
   * The orientation of the radio group.
   */
  readonly orientation: WritableSignal<NgpOrientation>;
  /**
   * The comparator function used to compare values.
   */
  readonly compareWith: Signal<(a: T | null, b: T | null) => boolean>;
  /**
   * Emits when the selected value changes.
   */
  readonly valueChange: Observable<T | null>;
  /**
   * Select a value in the radio group.
   */
  select(value: T): void;
  /**
   * Set the value of the radio group. Fires `onValueChange` and emits on the
   * `valueChange` observable by default. Pass `{ emit: false }` for cases like
   * form `writeValue` where the internal state should sync without notifying.
   */
  setValue(value: T | null, options?: SetterOptions): void;
  /**
   * Set the disabled value.
   */
  setDisabled(value: boolean): void;
  /**
   * Set the orientation of the radio group.
   */
  setOrientation(value: NgpOrientation): void;
}

/**
 * Inputs for configuring the RadioGroup primitive.
 */
export interface NgpRadioGroupProps<T> {
  /**
   * The roving focus group state for the radio group.
   */
  readonly rovingFocusGroup: NgpRovingFocusGroupState;
  /**
   * The id of the radio group.
   */
  readonly id?: Signal<string>;
  /**
   * The selected value of the radio group.
   */
  readonly value?: Signal<T | null>;
  /**
   * Whether the radio group is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * The orientation of the radio group.
   */
  readonly orientation?: Signal<NgpOrientation>;
  /**
   * The comparator function used to compare values.
   */
  readonly compareWith?: Signal<(a: T | null, b: T | null) => boolean>;
  /**
   * Callback fired when the selected value changes.
   */
  readonly onValueChange?: (value: T | null) => void;
}

export const [
  NgpRadioGroupStateToken,
  ngpRadioGroup,
  _injectRadioGroupState,
  provideRadioGroupState,
] = createPrimitive(
  'NgpRadioGroup',
  <T>({
    rovingFocusGroup,
    id = signal(uniqueId('ngp-radio-group')),
    value: _value = signal<T | null>(null),
    disabled: _disabled = signal(false),
    orientation: _orientation = signal<NgpOrientation>('horizontal'),
    compareWith = signal<(a: T | null, b: T | null) => boolean>((a, b) => a === b),
    onValueChange,
  }: NgpRadioGroupProps<T>): NgpRadioGroupState<T> => {
    const element = injectElementRef();
    const value = controlled(_value, null);
    const disabled = controlled(_disabled, false);
    const orientation = controlled(_orientation, 'horizontal');
    const valueChange = emitter<T | null>();

    ngpFormControl({ id, disabled });

    // Host bindings
    attrBinding(element, 'role', 'radiogroup');
    attrBinding(element, 'id', id);
    attrBinding(element, 'aria-orientation', orientation);
    dataBinding(element, 'data-orientation', orientation);
    dataBinding(element, 'data-disabled', disabled);

    function setValue(newValue: T | null, options?: SetterOptions): void {
      // Skip redundant updates and emits when the value is unchanged, while
      // still allowing a silent sync (`emit: false`, e.g. form `writeValue`).
      if (compareWith()(value(), newValue) && options?.emit !== false) {
        return;
      }

      value.set(newValue);

      if (options?.emit !== false) {
        onValueChange?.(newValue);
        valueChange.emit(newValue);
      }
    }

    function select(newValue: T): void {
      if (disabled()) {
        return;
      }

      setValue(newValue);
    }

    function setDisabled(isDisabled: boolean): void {
      disabled.set(isDisabled);
    }

    function setOrientation(newOrientation: NgpOrientation): void {
      orientation.set(newOrientation);
      rovingFocusGroup.setOrientation(newOrientation);
    }

    return {
      id,
      value: deprecatedSetter(value, 'setValue', newValue => setValue(newValue)),
      disabled: deprecatedSetter(disabled, 'setDisabled'),
      orientation: deprecatedSetter(orientation, 'setOrientation', setOrientation),
      compareWith,
      valueChange: valueChange.asObservable(),
      select,
      setValue,
      setDisabled,
      setOrientation,
    } satisfies NgpRadioGroupState<T>;
  },
);

/**
 * Injects the RadioGroup state.
 */
export function injectRadioGroupState<T>(
  options?: StateInjectionOptions,
): Signal<NgpRadioGroupState<T>> {
  return _injectRadioGroupState(options) as Signal<NgpRadioGroupState<T>>;
}
