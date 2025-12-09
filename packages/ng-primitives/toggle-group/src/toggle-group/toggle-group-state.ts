import { signal, Signal, WritableSignal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpRovingFocusGroupState } from 'ng-primitives/roving-focus';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  emitter,
} from 'ng-primitives/state';
import { Observable } from 'rxjs';

/**
 * The state interface for the ToggleGroup pattern.
 */
export interface NgpToggleGroupState {
  /**
   * The current value(s) of the toggle group.
   */
  readonly value: WritableSignal<string[]>;

  /**
   * Emit when the value changes.
   */
  readonly valueChange: Observable<string[]>;

  /**
   * Whether the toggle group is disabled.
   */
  readonly disabled: WritableSignal<boolean>;
  /**
   * Select a value in the toggle group.
   */
  select(selection: string): void;

  /**
   * De-select a value in the toggle group.
   */
  deselect(selection: string): void;

  /**
   * Check if a value is selected in the toggle group.
   */
  isSelected(selection: string): boolean;

  /**
   * Toggle a value in the toggle group.
   */
  toggle(selection: string): void;

  /**
   * Set the value(s) of the toggle group.
   */
  setValue(newValue: string[]): void;

  /**
   * Set the disabled state of the toggle group.
   */
  setDisabled(isDisabled: boolean): void;

  /**
   * Set the orientation of the toggle group.
   */
  setOrientation(newOrientation: NgpOrientation): void;
}

/**
 * The props interface for the ToggleGroup pattern.
 */
export interface NgpToggleGroupProps {
  /**
   * The roving focus group state for the toggle-group.
   */
  readonly rovingFocusGroup: NgpRovingFocusGroupState;

  /**
   * The orientation of the toggle-group.
   */
  readonly orientation?: Signal<NgpOrientation>;
  /**
   * Whether deselection is allowed in the toggle-group.
   */
  readonly allowDeselection?: Signal<boolean>;
  /**
   * The type of the toggle-group (e.g., 'single' or 'multiple').
   */
  readonly type?: Signal<'single' | 'multiple'>;
  /**
   * The value(s) of the toggle-group.
   */
  readonly value?: Signal<string[] | undefined>;
  /**
   * Whether the toggle-group is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Emit when the value changes.
   */
  readonly onValueChange?: (value: string[]) => void;
}

export const [
  NgpToggleGroupStateToken,
  ngpToggleGroup,
  injectToggleGroupState,
  provideToggleGroupState,
] = createPrimitive(
  'NgpToggleGroup',
  ({
    rovingFocusGroup,
    orientation: _orientation = signal('vertical'),
    allowDeselection = signal(true),
    type = signal<'single' | 'multiple'>('single'),
    value: _value = signal<string[]>([]),
    disabled: _disabled = signal(false),
    onValueChange,
  }: NgpToggleGroupProps): NgpToggleGroupState => {
    const element = injectElementRef();
    const disabled = controlled(_disabled);
    const value = controlled(_value);
    const orientation = controlled(_orientation);
    const valueChange = emitter<string[]>();

    // Host bindings
    attrBinding(element, 'role', 'group');
    dataBinding(element, 'data-orientation', orientation);
    dataBinding(element, 'data-type', type);
    dataBinding(element, 'data-disabled', disabled);

    /**
     * Select a value in the toggle group.
     */
    const select = (selection: string): void => {
      if (disabled()) {
        return;
      }

      let newValue: string[] = [];

      if (type() === 'single') {
        newValue = [selection];
      } else {
        newValue = [...(value() as string[]), selection];
      }

      setValue(newValue);
    };

    /**
     * De-select a value in the toggle group.
     */
    const deselect = (selection: string): void => {
      if (disabled() || !allowDeselection()) {
        return;
      }

      const newValue = value()?.filter(v => v !== selection) || [];
      setValue(newValue);
    };

    /**
     * Check if a value is selected in the toggle group.
     * @internal
     */
    const isSelected = (itemValue: string): boolean => {
      return value()?.includes(itemValue) ?? false;
    };

    /**
     * Toggle a value in the toggle group.
     * @internal
     */
    const toggle = (itemValue: string): void => {
      if (isSelected(itemValue)) {
        deselect(itemValue);
      } else {
        select(itemValue);
      }
    };

    const setValue = (newValue: string[]): void => {
      value.set(newValue);
      onValueChange?.(newValue);
      valueChange.emit(newValue);
    };

    const setDisabled = (isDisabled: boolean): void => {
      disabled.set(isDisabled);
    };

    function setOrientation(newOrientation: NgpOrientation): void {
      orientation.set(newOrientation);
      rovingFocusGroup.setOrientation(newOrientation);
    }

    return {
      select,
      deselect,
      disabled: deprecatedSetter(disabled, 'setDisabled'),
      isSelected,
      toggle,
      value: deprecatedSetter(value, 'setValue') as WritableSignal<string[]>,
      setValue,
      setDisabled,
      setOrientation,
      valueChange: valueChange.asObservable(),
    };
  },
);
