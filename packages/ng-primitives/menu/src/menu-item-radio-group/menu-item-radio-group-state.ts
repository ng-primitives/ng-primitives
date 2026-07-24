import { Signal, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  controlledState,
  createPrimitive,
  emitter,
} from 'ng-primitives/state';
import { Observable } from 'rxjs';

export interface NgpMenuItemRadioGroupState {
  /**
   * The current value of the radio group.
   */
  readonly value: Signal<string | null>;

  /**
   * Emits when the value changes.
   */
  readonly valueChange: Observable<string>;

  /**
   * Select a radio item by value.
   */
  select(value: string): void;

  /**
   * Set the default value used in uncontrolled mode.
   */
  setDefaultValue(value: string | null): void;
}

export interface NgpMenuItemRadioGroupProps {
  /**
   * The current value of the radio group. When defined the group is controlled.
   */
  readonly value?: Signal<string | null | undefined>;

  /**
   * The default value for uncontrolled usage.
   */
  readonly defaultValue?: Signal<string | null>;

  /**
   * Callback fired when the value changes.
   */
  readonly onValueChange?: (value: string) => void;
}

export const [
  NgpMenuItemRadioGroupStateToken,
  ngpMenuItemRadioGroup,
  injectMenuItemRadioGroupState,
  provideMenuItemRadioGroupState,
] = createPrimitive(
  'NgpMenuItemRadioGroup',
  ({
    value: _value = signal<string | null | undefined>(undefined),
    defaultValue: _defaultValue,
    onValueChange,
  }: NgpMenuItemRadioGroupProps): NgpMenuItemRadioGroupState => {
    const element = injectElementRef();
    // `controlledState` provides controlled/uncontrolled latching; the group
    // only ever selects string values, so we keep a string-typed emitter and
    // drive it manually (calling the setter with emit:false).
    const defaultValue = controlled<string | null>(_defaultValue, null);
    const [value, setValue] = controlledState<string | null>({
      value: _value,
      defaultValue,
    });
    const valueChange = emitter<string>();

    // Host bindings
    attrBinding(element, 'role', 'group');

    function select(newValue: string): void {
      if (value() === newValue) {
        return;
      }

      setValue(newValue, { emit: false });
      onValueChange?.(newValue);
      valueChange.emit(newValue);
    }

    return {
      value,
      valueChange: valueChange.asObservable(),
      select,
      setDefaultValue: defaultValue.set,
    } satisfies NgpMenuItemRadioGroupState;
  },
);
