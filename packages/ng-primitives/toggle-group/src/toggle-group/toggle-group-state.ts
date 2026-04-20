import { FactoryProvider, Signal, WritableSignal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import {
  NgpRovingFocusGroupState,
  provideRovingFocusGroupState,
} from 'ng-primitives/roving-focus';
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
   * The orientation of the toggle group.
   */
  readonly orientation: WritableSignal<NgpOrientation>;
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
  setValue(newValue: string[], options?: SetterOptions): void;

  /**
   * Set the default value(s) of the toggle group.
   */
  setDefaultValue(defaultValue: string[]): void;

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
  readonly value: Signal<string[] | undefined>;
  /**
   * The default value(s) of the toggle-group for uncontrolled usage.
   */
  readonly defaultValue?: Signal<string[]>;
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
  provideToggleGroupStateOnly,
] = createPrimitive(
  'NgpToggleGroup',
  ({
    rovingFocusGroup,
    orientation: _orientation,
    allowDeselection: _allowDeselection,
    type: _type,
    value: _value,
    defaultValue: _defaultValue,
    disabled: _disabled,
    onValueChange,
  }: NgpToggleGroupProps): NgpToggleGroupState => {
    const element = injectElementRef();

    const allowDeselection = controlled(_allowDeselection, true);
    const type = controlled(_type, 'single');
    const disabled = controlled(_disabled, false);
    const orientation = controlled(_orientation, 'horizontal');
    const defaultValue = controlled(_defaultValue, []);

    const [value, setValueInternal, valueChange] = controlledState<string[]>({
      value: _value,
      defaultValue,
      onChange: onValueChange,
    });

    // Host bindings
    attrBinding(element, 'role', 'group');
    dataBinding(element, 'data-orientation', orientation);
    dataBinding(element, 'data-type', type);
    dataBinding(element, 'data-disabled', disabled);

    /**
     * Select a value in the toggle group.
     */
    function select(selection: string): void {
      if (disabled()) {
        return;
      }

      let newValue: string[] = [];

      if (type() === 'single') {
        newValue = [selection];
      } else {
        newValue = [...value(), selection];
      }

      setValue(newValue);
    }

    /**
     * De-select a value in the toggle group.
     */
    function deselect(selection: string): void {
      if (disabled() || !allowDeselection()) {
        return;
      }

      const newValue = value().filter(v => v !== selection);
      setValue(newValue);
    }

    /**
     * Check if a value is selected in the toggle group.
     * @internal
     */
    function isSelected(itemValue: string): boolean {
      return value().includes(itemValue);
    }

    /**
     * Toggle a value in the toggle group.
     * @internal
     */
    function toggle(itemValue: string): void {
      if (isSelected(itemValue)) {
        deselect(itemValue);
      } else {
        select(itemValue);
      }
    }

    function setValue(newValue: string[], options?: SetterOptions): void {
      setValueInternal(newValue, options);
    }

    function setDisabled(isDisabled: boolean): void {
      disabled.set(isDisabled);
    }

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
      value: deprecatedSetter(value, 'setValue', setValue),
      orientation: deprecatedSetter(orientation, 'setOrientation', setOrientation),
      setValue,
      setDefaultValue: defaultValue.set,
      setDisabled,
      setOrientation,
      valueChange,
    } satisfies NgpToggleGroupState;
  },
);

/**
 * Provide the toggle group state along with its companion roving focus group state.
 *
 * Consumers that hoist the toggle group via `<div ngpToggleGroup><ng-content/></div>` need
 * both tokens to be visible at the reusable component level — otherwise items projected
 * through `<ng-content>` cannot resolve `NgpRovingFocusGroupState` from their element
 * injector (they only walk through the reusable component, not through the inner `<div>`).
 */
export function provideToggleGroupState(opts?: {
  inherit?: boolean;
}): [FactoryProvider, FactoryProvider] {
  return [provideToggleGroupStateOnly(opts), provideRovingFocusGroupState(opts)];
}
