import {
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { attrBinding, controlled, dataBinding } from '@ng-primitives/state';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpOrientation } from 'ng-primitives/common';
import {
  ngpRovingFocusGroupPattern,
  NgpRovingFocusGroupState,
  provideRovingFocusGroupPattern,
} from 'ng-primitives/roving-focus';

/**
 * The state interface for the ToggleGroup pattern.
 */
export interface NgpToggleGroupState {
  rovingFocus: NgpRovingFocusGroupState;
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
  readonly value?: Signal<string[]>;
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
  disabled = signal(false),
  onValueChange,
}: NgpToggleGroupProps = {}): NgpToggleGroupState {
  const rovingFocus = ngpRovingFocusGroupPattern({
    orientation,
    disabled,
    element,
  });

  const value = controlled(_value);

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

    const newValue = value().filter(v => v !== selection);
    value.set(newValue);
    onValueChange?.(newValue);
  };

  /**
   * Check if a value is selected in the toggle group.
   * @internal
   */
  const isSelected = (itemValue: string): boolean => {
    return value().includes(itemValue) ?? false;
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

  return {
    rovingFocus,
    select,
    deselect,
    isSelected,
    toggle,
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
    provideRovingFocusGroupPattern(type, instance => fn(instance).rovingFocus),
  ];
}
