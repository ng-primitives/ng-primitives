import { Signal, WritableSignal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
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
import { Observable } from 'rxjs';

/**
 * The state interface for the ToggleGroup pattern.
 */
export interface NgpToggleGroupState<T = string> {
  /**
   * The current value(s) of the toggle group.
   */
  readonly value: WritableSignal<T[]>;

  /**
   * Emit when the value changes.
   */
  readonly valueChange: Observable<T[]>;

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
  select(selection: T): void;

  /**
   * De-select a value in the toggle group.
   */
  deselect(selection: T): void;

  /**
   * Check if a value is selected in the toggle group.
   */
  isSelected(selection: T): boolean;

  /**
   * Toggle a value in the toggle group.
   */
  toggle(selection: T): void;

  /**
   * Set the value(s) of the toggle group.
   */
  setValue(newValue: T[], options?: SetterOptions): void;

  /**
   * Set the default value(s) of the toggle group.
   */
  setDefaultValue(defaultValue: T[]): void;

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
export interface NgpToggleGroupProps<T = string> {
  /**
   * The orientation of the toggle-group.
   */
  readonly orientation?: Signal<NgpOrientation>;
  /**
   * Whether focus should wrap around when reaching the end of the toggle-group.
   */
  readonly wrap?: Signal<boolean>;
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
  readonly value: Signal<T[] | undefined>;
  /**
   * The default value(s) of the toggle-group for uncontrolled usage.
   */
  readonly defaultValue?: Signal<T[]>;
  /**
   * Whether the toggle-group is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * The comparator used to determine whether two values are equal.
   * @default (a, b) => a === b
   */
  readonly compareWith?: Signal<(a: T, b: T) => boolean>;
  /**
   * Emit when the value changes.
   */
  readonly onValueChange?: (value: T[]) => void;
}

export const [
  NgpToggleGroupStateToken,
  ngpToggleGroup,
  _injectToggleGroupState,
  provideToggleGroupState,
] = createPrimitive(
  'NgpToggleGroup',
  <T = string>({
    orientation: _orientation,
    wrap: _wrap,
    allowDeselection: _allowDeselection,
    type: _type,
    value: _value,
    defaultValue: _defaultValue,
    disabled: _disabled,
    compareWith: _compareWith,
    onValueChange,
  }: NgpToggleGroupProps<T>): NgpToggleGroupState<T> => {
    const element = injectElementRef();

    const allowDeselection = controlled(_allowDeselection, true);
    const type = controlled(_type, 'single');
    const disabled = controlled(_disabled, false);
    const orientation = controlled(_orientation, 'horizontal');
    const wrap = controlled(_wrap, true);
    const defaultValue = controlled(_defaultValue, []);
    const compareWith = controlled(_compareWith, (a: T, b: T) => a === b);

    const [value, setValueInternal, valueChange] = controlledState<T[]>({
      value: _value,
      defaultValue,
      onChange: onValueChange,
    });

    // Own the roving focus group so it shares the group's `disabled` and
    // `orientation` signals directly. This keeps keyboard navigation in sync
    // with programmatic/form-driven changes (e.g. `setDisabled`, `setOrientation`)
    // without needing to re-push each value across a directive boundary.
    ngpRovingFocusGroup({ orientation, disabled, wrap });

    // Host bindings
    attrBinding(element, 'role', 'group');
    dataBinding(element, 'data-orientation', orientation);
    dataBinding(element, 'data-type', type);
    dataBinding(element, 'data-disabled', disabled);

    /**
     * Select a value in the toggle group.
     */
    function select(selection: T): void {
      if (disabled()) {
        return;
      }

      let newValue: T[] = [];

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
    function deselect(selection: T): void {
      if (disabled() || !allowDeselection()) {
        return;
      }

      const cmp = compareWith();
      const newValue = value().filter(v => !cmp(v, selection));
      setValue(newValue);
    }

    /**
     * Check if a value is selected in the toggle group.
     * @internal
     */
    function isSelected(itemValue: T): boolean {
      const cmp = compareWith();
      return value().some(v => cmp(v, itemValue));
    }

    /**
     * Toggle a value in the toggle group.
     * @internal
     */
    function toggle(itemValue: T): void {
      if (isSelected(itemValue)) {
        deselect(itemValue);
      } else {
        select(itemValue);
      }
    }

    function setValue(newValue: T[], options?: SetterOptions): void {
      setValueInternal(newValue, options);
    }

    function setDisabled(isDisabled: boolean): void {
      disabled.set(isDisabled);
    }

    function setOrientation(newOrientation: NgpOrientation): void {
      // The roving focus group shares this signal, so it stays in sync.
      orientation.set(newOrientation);
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
    } satisfies NgpToggleGroupState<T>;
  },
);

/**
 * Injects the ToggleGroup state, typed to the value type `T`.
 */
export function injectToggleGroupState<T = string>(
  options?: StateInjectionOptions,
): Signal<NgpToggleGroupState<T>> {
  return _injectToggleGroupState(options) as Signal<NgpToggleGroupState<T>>;
}
