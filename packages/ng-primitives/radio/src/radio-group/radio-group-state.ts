import { Signal, signal, WritableSignal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { ngpFormControl } from 'ng-primitives/form-field';
import { injectElementRef } from 'ng-primitives/internal';
import { ngpRovingFocusGroup } from 'ng-primitives/roving-focus';
import {
  attrBinding,
  controlled,
  controlledState,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
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
   * Set the default value used for uncontrolled usage.
   */
  setDefaultValue(value: T | null): void;
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
   * The id of the radio group.
   */
  readonly id?: Signal<string>;
  /**
   * The selected value of the radio group. Leave `undefined` for uncontrolled
   * usage (the group manages its own value from `defaultValue`).
   */
  readonly value?: Signal<T | null | undefined>;
  /**
   * The default value for uncontrolled usage.
   */
  readonly defaultValue?: Signal<T | null>;
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
    id = signal(uniqueId('ngp-radio-group')),
    value: _value = signal<T | null | undefined>(undefined),
    defaultValue: _defaultValue,
    disabled: _disabled = signal(false),
    orientation: _orientation = signal<NgpOrientation>('horizontal'),
    compareWith = signal<(a: T | null, b: T | null) => boolean>((a, b) => a === b),
    onValueChange,
  }: NgpRadioGroupProps<T>): NgpRadioGroupState<T> => {
    const element = injectElementRef();
    const disabled = controlled(_disabled, false);
    const orientation = controlled(_orientation, 'horizontal');
    const defaultValue = controlled(_defaultValue, null);
    const [value, setValueInternal, valueChange] = controlledState<T | null>({
      value: _value,
      defaultValue,
      onChange: onValueChange,
    });

    // Own the roving focus group so it shares the group's `disabled` and
    // `orientation` signals directly. This keeps keyboard navigation in sync
    // with programmatic/form-driven changes (e.g. `setDisabled`, `setOrientation`)
    // without needing to re-push each value across a directive boundary.
    // `wrap` is always on to match the ARIA radio pattern (arrow keys cycle).
    ngpRovingFocusGroup({ orientation, disabled, wrap: signal(true) });

    ngpFormControl({ id, disabled });

    // Host bindings
    attrBinding(element, 'role', 'radiogroup');
    attrBinding(element, 'id', id);
    attrBinding(element, 'aria-orientation', orientation);
    dataBinding(element, 'data-orientation', orientation);
    dataBinding(element, 'data-disabled', disabled);

    function setValue(newValue: T | null, options?: SetterOptions): void {
      setValueInternal(newValue, options);
    }

    function select(newValue: T): void {
      // Guard on disabled and dedupe by the comparator so that re-selecting an
      // equal value (by `compareWith`, not just reference) is a no-op.
      if (disabled() || compareWith()(value(), newValue)) {
        return;
      }

      setValue(newValue);
    }

    function setDisabled(isDisabled: boolean): void {
      disabled.set(isDisabled);
    }

    function setOrientation(newOrientation: NgpOrientation): void {
      // The roving focus group shares this signal, so it stays in sync.
      orientation.set(newOrientation);
    }

    return {
      id,
      value: deprecatedSetter(value, 'setValue', newValue => setValue(newValue)),
      disabled: deprecatedSetter(disabled, 'setDisabled'),
      orientation: deprecatedSetter(orientation, 'setOrientation', setOrientation),
      compareWith,
      valueChange,
      select,
      setValue,
      setDefaultValue: defaultValue.set,
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
