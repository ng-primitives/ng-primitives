import { Signal, signal, WritableSignal } from '@angular/core';
import { ngpFormControl } from 'ng-primitives/form-field';
import { injectElementRef } from 'ng-primitives/internal';
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

export interface NgpCheckboxGroupState<T = string> {
  readonly id: Signal<string>;
  readonly value: WritableSignal<T[]>;
  readonly allValues: Signal<T[] | undefined>;
  readonly disabled: WritableSignal<boolean>;
  readonly compareWith: Signal<(a: T, b: T) => boolean>;
  readonly valueChange: Observable<T[]>;
  select(value: T): void;
  deselect(value: T): void;
  isSelected(value: T): boolean;
  toggle(value: T): void;
  setValue(value: T[], options?: SetterOptions): void;
  setDefaultValue(value: T[]): void;
  setDisabled(value: boolean): void;
}

export interface NgpCheckboxGroupProps<T = string> {
  readonly id?: Signal<string>;
  readonly value?: Signal<T[] | undefined>;
  readonly defaultValue?: Signal<T[]>;
  readonly allValues?: Signal<T[] | undefined>;
  readonly disabled?: Signal<boolean>;
  readonly compareWith?: Signal<(a: T, b: T) => boolean>;
  readonly onValueChange?: (value: T[]) => void;
}

export const [
  NgpCheckboxGroupStateToken,
  ngpCheckboxGroup,
  _injectCheckboxGroupState,
  provideCheckboxGroupState,
] = createPrimitive(
  'NgpCheckboxGroup',
  <T = string>({
    id = signal(uniqueId('ngp-checkbox-group')),
    value: _value = signal<T[] | undefined>(undefined),
    defaultValue: _defaultValue,
    allValues: _allValues = signal<T[] | undefined>(undefined),
    disabled: _disabled = signal(false),
    compareWith: _compareWith = signal((a: T, b: T) => a === b),
    onValueChange,
  }: NgpCheckboxGroupProps<T>): NgpCheckboxGroupState<T> => {
    const element = injectElementRef();
    const disabled = controlled(_disabled, false);
    const defaultValue = controlled(_defaultValue, []);
    const compareWith = controlled(_compareWith, (a: T, b: T) => a === b);
    const [value, setValueInternal, valueChange] = controlledState<T[]>({
      value: _value,
      defaultValue,
      onChange: onValueChange,
    });

    ngpFormControl({ id, disabled });

    attrBinding(element, 'role', 'group');
    attrBinding(element, 'id', id);
    dataBinding(element, 'data-disabled', disabled);

    function isSelected(itemValue: T): boolean {
      return value().some(currentValue => compareWith()(currentValue, itemValue));
    }

    function select(itemValue: T): void {
      if (disabled() || isSelected(itemValue)) {
        return;
      }
      setValue([...value(), itemValue]);
    }

    function deselect(itemValue: T): void {
      if (disabled() || !isSelected(itemValue)) {
        return;
      }
      setValue(value().filter(currentValue => !compareWith()(currentValue, itemValue)));
    }

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

    return {
      id,
      value: deprecatedSetter(value, 'setValue', setValue),
      allValues: _allValues,
      disabled: deprecatedSetter(disabled, 'setDisabled', setDisabled),
      compareWith,
      valueChange,
      select,
      deselect,
      isSelected,
      toggle,
      setValue,
      setDefaultValue: defaultValue.set,
      setDisabled,
    } satisfies NgpCheckboxGroupState<T>;
  },
);

export function injectCheckboxGroupState<T = string>(
  options?: StateInjectionOptions,
): Signal<NgpCheckboxGroupState<T> | null> {
  return _injectCheckboxGroupState(options) as Signal<NgpCheckboxGroupState<T> | null>;
}
