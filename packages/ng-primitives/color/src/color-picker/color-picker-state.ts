import { Signal, signal, WritableSignal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  controlledState,
  createPrimitive,
  deprecatedSetter,
  SetterOptions,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Observable } from 'rxjs';
import { Color } from '../color/color';

/**
 * Public state surface for the Color Picker primitive - a coordinator that holds a single
 * color value shared across child color components (area, sliders, fields).
 */
export interface NgpColorPickerState {
  /** The id of the picker. */
  readonly id: Signal<string>;
  /** The shared color value. */
  readonly value: WritableSignal<Color>;
  /** Emits when the value changes. */
  readonly valueChange: Observable<Color>;
  /** Set the shared color value. */
  setValue(value: Color, options?: SetterOptions): void;
  /** Set the default color value used in uncontrolled mode. */
  setDefaultValue(value: Color): void;
}

/**
 * Inputs for configuring the Color Picker primitive.
 */
export interface NgpColorPickerProps {
  readonly id?: Signal<string>;
  /** The shared color value. When defined the picker is controlled. */
  readonly value?: Signal<Color | undefined>;
  /** The default color value for uncontrolled usage. */
  readonly defaultValue?: Signal<Color>;
  readonly onValueChange?: (value: Color) => void;
}

export const [
  NgpColorPickerStateToken,
  ngpColorPicker,
  injectColorPickerState,
  provideColorPickerState,
] = createPrimitive(
  'NgpColorPicker',
  ({
    id = signal(uniqueId('ngp-color-picker')),
    value: _value = signal<Color | undefined>(undefined),
    defaultValue: _defaultValue,
    onValueChange,
  }: NgpColorPickerProps): NgpColorPickerState => {
    const element = injectElementRef();
    const defaultValue = controlled(_defaultValue, Color.parse('#ff0000'));
    const [value, setValueInternal, valueChange] = controlledState<Color>({
      value: _value,
      defaultValue,
      onChange: onValueChange,
    });

    attrBinding(element, 'id', id);

    function setValue(newValue: Color, options?: SetterOptions): void {
      setValueInternal(newValue, options);
    }

    return {
      id,
      value: deprecatedSetter(value, 'setValue', setValue),
      valueChange,
      setValue,
      setDefaultValue: defaultValue.set,
    } satisfies NgpColorPickerState;
  },
);
