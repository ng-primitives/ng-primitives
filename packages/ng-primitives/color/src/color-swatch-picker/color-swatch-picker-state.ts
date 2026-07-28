import { computed, Signal, signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import { ngpRovingFocusGroup } from 'ng-primitives/roving-focus';
import {
  attrBinding,
  controlled,
  controlledState,
  createPrimitive,
  dataBinding,
  emitter,
  SetterOptions,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Observable } from 'rxjs';
import { injectColorPickerState } from '../color-picker/color-picker-state';
import { Color } from '../color/color';

/**
 * Public state surface for the Color Swatch Picker primitive - a list of selectable color swatches.
 */
export interface NgpColorSwatchPickerState {
  /** The id of the swatch picker. */
  readonly id: Signal<string>;
  /** The currently selected color (the parent picker's value when inside one). */
  readonly value: Signal<Color>;
  /** Whether the swatch picker is disabled. */
  readonly disabled: Signal<boolean>;
  /** Emits when the selected color changes. */
  readonly valueChange: Observable<Color>;
  /** Whether a color matches the current selection. */
  isSelected(color: Color): boolean;
  /** Select a color. */
  select(color: Color, options?: SetterOptions): void;
  /** Set the default selected color used in uncontrolled mode. */
  setDefaultValue(value: Color | undefined): void;
}

/**
 * Inputs for configuring the Color Swatch Picker primitive.
 */
export interface NgpColorSwatchPickerProps {
  readonly id?: Signal<string>;
  /** The selected color. When defined the swatch picker is controlled. */
  readonly value?: Signal<Color | undefined>;
  /** The default selected color for uncontrolled usage (undefined = no selection). */
  readonly defaultValue?: Signal<Color | undefined>;
  readonly orientation?: Signal<NgpOrientation>;
  readonly disabled?: Signal<boolean>;
  readonly onValueChange?: (value: Color) => void;
}

/** Two colors are equal if they serialize identically (including alpha). */
function colorsEqual(a: Color, b: Color): boolean {
  return a.toRgba() === b.toRgba();
}

export const [
  NgpColorSwatchPickerStateToken,
  ngpColorSwatchPicker,
  injectColorSwatchPickerState,
  provideColorSwatchPickerState,
] = createPrimitive(
  'NgpColorSwatchPicker',
  ({
    id = signal(uniqueId('ngp-color-swatch-picker')),
    value: _value = signal<Color | undefined>(undefined),
    defaultValue: _defaultValue,
    orientation = signal<NgpOrientation>('horizontal'),
    disabled = signal(false),
    onValueChange,
  }: NgpColorSwatchPickerProps): NgpColorSwatchPickerState => {
    const element = injectElementRef<HTMLElement>();
    const picker = injectColorPickerState({ optional: true });
    // `undefined` local means "no selection", so the default is undefined too.
    const defaultValue = controlled<Color | undefined>(_defaultValue, undefined);
    const [local, setLocal] = controlledState<Color | undefined>({
      value: _value,
      defaultValue,
    });
    const value = computed(() => picker()?.value() ?? local() ?? Color.parse('#000000'));
    const hasSelection = computed(() => !!(picker() || local()));
    const valueChange = emitter<Color>();

    // Compose roving focus so arrow keys move between swatches with a single tab stop.
    ngpRovingFocusGroup({
      orientation,
      wrap: signal(true),
      homeEnd: signal(true),
      disabled,
      inherit: false,
    });

    // Host bindings — a single-select list of colors.
    attrBinding(element, 'id', id);
    attrBinding(element, 'role', 'listbox');
    dataBinding(element, 'data-orientation', orientation);
    dataBinding(element, 'data-disabled', disabled);

    function isSelected(color: Color): boolean {
      return hasSelection() && colorsEqual(color, value());
    }

    function select(color: Color, options?: SetterOptions): void {
      const parent = picker();
      if (parent) {
        parent.setValue(color, options);
      } else {
        setLocal(color, { emit: false });
      }
      if (options?.emit !== false) {
        onValueChange?.(color);
        valueChange.emit(color);
      }
    }

    return {
      id,
      value,
      disabled,
      valueChange: valueChange.asObservable(),
      isSelected,
      select,
      setDefaultValue: defaultValue.set,
    } satisfies NgpColorSwatchPickerState;
  },
);
