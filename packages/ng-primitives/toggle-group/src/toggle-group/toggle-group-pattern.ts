import {
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  linkedSignal,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import {
  ngpRovingFocusGroupPattern,
  NgpRovingFocusGroupState,
  provideRovingFocusGroupPattern,
} from 'ng-primitives/roving-focus';
import { attrBinding, controlled, createStateInjectFn, dataBinding } from 'ng-primitives/state';

/**
 * The state interface for the ToggleGroup pattern.
 */
export interface NgpToggleGroupState {
  _rovingFocus: NgpRovingFocusGroupState;
  /**
   * The current value(s) of the toggle group.
   */
  readonly value: Signal<string[]>;

  /**
   * Whether the toggle group is disabled.
   */
  readonly disabled: Signal<boolean>;
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
}

/**
 * The props interface for the ToggleGroup pattern.
 */
export interface NgpToggleGroupProps {
  /**
   * The element reference for the toggle-group.
   */
  readonly element?: ElementRef<HTMLElement>;
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

/**
 * The ToggleGroup pattern function.
 */
export function ngpToggleGroupPattern({
  element = injectElementRef(),
  orientation = signal('vertical'),
  allowDeselection = signal(true),
  type = signal<'single' | 'multiple'>('single'),
  value: _value = signal<string[]>([]),
  disabled: _disabled = signal(false),
  onValueChange,
}: NgpToggleGroupProps = {}): NgpToggleGroupState {
  const disabled = controlled(_disabled);
  const value = controlled(_value);

  const rovingFocus = ngpRovingFocusGroupPattern({
    orientation,
    disabled,
    element,
  });

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

    value.set(newValue);
    onValueChange?.(newValue);
  };

  /**
   * De-select a value in the toggle group.
   */
  const deselect = (selection: string): void => {
    if (disabled() || !allowDeselection()) {
      return;
    }

    const newValue = value()?.filter(v => v !== selection) || [];
    value.set(newValue);
    onValueChange?.(newValue);
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
  };

  const setDisabled = (isDisabled: boolean): void => {
    disabled.set(isDisabled);
  };

  return {
    _rovingFocus: rovingFocus,
    select,
    deselect,
    disabled,
    isSelected,
    toggle,
    value: value as Signal<string[]>,
    setValue,
    setDisabled,
  };
}

/**
 * The injection token for the ToggleGroup pattern.
 */
export const NgpToggleGroupPatternToken = new InjectionToken<NgpToggleGroupState>(
  'NgpToggleGroupPatternToken',
);

/**
 * Injects the ToggleGroup pattern.
 */
export function injectToggleGroupPattern(): NgpToggleGroupState {
  return inject(NgpToggleGroupPatternToken);
}

/**
 * Provides the ToggleGroup pattern.
 */
export function provideToggleGroupPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpToggleGroupState,
): FactoryProvider[] {
  return [
    { provide: NgpToggleGroupPatternToken, useFactory: () => fn(inject(type)) },
    provideRovingFocusGroupPattern(type, instance => fn(instance)._rovingFocus),
  ];
}

/**
 * @deprecated use `injectToggleGroupPattern` instead.
 */
export const injectToggleGroupState = createStateInjectFn(injectToggleGroupPattern, pattern => {
  const value = linkedSignal(pattern.value);
  value.set = pattern.setValue;

  const disabled = linkedSignal(pattern.disabled);
  disabled.set = pattern.setDisabled;

  return { ...pattern, value, disabled, valueChange: toObservable(pattern.value) };
});
