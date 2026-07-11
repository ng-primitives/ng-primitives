import { Signal, signal, WritableSignal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  emitter,
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
}

/**
 * Inputs for configuring the Color Picker primitive.
 */
export interface NgpColorPickerProps {
  readonly id?: Signal<string>;
  readonly value?: Signal<Color>;
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
    value: _value = signal(Color.parse('#ff0000')),
    onValueChange,
  }: NgpColorPickerProps): NgpColorPickerState => {
    const element = injectElementRef();
    const value = controlled(_value);
    const valueChange = emitter<Color>();

    attrBinding(element, 'id', id);

    function setValue(newValue: Color, options?: SetterOptions): void {
      value.set(newValue);
      if (options?.emit !== false) {
        onValueChange?.(newValue);
        valueChange.emit(newValue);
      }
    }

    return {
      id,
      value,
      valueChange: valueChange.asObservable(),
      setValue,
    } satisfies NgpColorPickerState;
  },
);
