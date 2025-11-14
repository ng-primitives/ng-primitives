import {
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  linkedSignal,
  Signal,
  signal,
  Type,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { NgpOrientation } from 'ng-primitives/common';
import { ngpFormControlPattern } from 'ng-primitives/form-field';
import { injectElementRef } from 'ng-primitives/internal';
import {
  ngpRovingFocusGroupPattern,
  NgpRovingFocusGroupState,
  provideRovingFocusGroupPattern,
} from 'ng-primitives/roving-focus';
import { attrBinding, controlled, createStateInjectFn, dataBinding } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';

/**
 * The state interface for the RadioGroup pattern.
 */
export interface NgpRadioGroupState<T = unknown> {
  /**
   * The id of the radio group.
   */
  readonly id: Signal<string>;

  /**
   * The value of the radio group.
   */
  readonly value: Signal<T | null>;

  /**
   * Whether the radio group is disabled.
   */
  readonly disabled: Signal<boolean>;

  /**
   * The orientation of the radio group.
   */
  readonly orientation: Signal<NgpOrientation>;

  /**
   * The comparator function for the radio group.
   */
  readonly compareWith: Signal<(a: T | null, b: T | null) => boolean>;

  /**
   * The roving focus group state.
   */
  readonly rovingFocus: NgpRovingFocusGroupState;

  /**
   * Select a radio item.
   */
  select(value: T): void;
}

/**
 * The props interface for the RadioGroup pattern.
 */
export interface NgpRadioGroupProps<T = unknown> {
  /**
   * The element reference for the radio-group.
   */
  element?: ElementRef<HTMLElement>;

  /**
   * The id of the radio group.
   */
  id?: Signal<string>;

  /**
   * The value of the radio group.
   */
  value?: Signal<T | null>;

  /**
   * Whether the radio group is disabled.
   */
  disabled?: Signal<boolean>;

  /**
   * The orientation of the radio group.
   */
  orientation?: Signal<NgpOrientation>;

  /**
   * The comparator function for the radio group.
   */
  compareWith?: Signal<(a: T | null, b: T | null) => boolean>;

  /**
   * Callback to emit value changes.
   */
  onValueChange?: (value: T) => void;
}

/**
 * The RadioGroup pattern function.
 */
export function ngpRadioGroupPattern<T = unknown>({
  element = injectElementRef(),
  id = signal(uniqueId('ngp-radio-group')),
  value: _value = signal<T | null>(null),
  disabled = signal(false),
  orientation = signal<NgpOrientation>('horizontal'),
  compareWith = signal<(a: T | null, b: T | null) => boolean>((a, b) => a === b),
  onValueChange,
}: NgpRadioGroupProps<T> = {}): NgpRadioGroupState<T> {
  // Create internal value signal that starts with the input value but can be updated
  const value = controlled(_value);

  // Setup host bindings
  attrBinding(element, 'aria-orientation', orientation);
  dataBinding(element, 'data-orientation', orientation);
  dataBinding(element, 'data-disabled', disabled);

  // integrate with form field
  ngpFormControlPattern({ id, disabled });

  // setup the roving focus pattern
  const rovingFocus = ngpRovingFocusGroupPattern({
    orientation,
    disabled,
    element,
    wrap: signal(true),
  });

  function select(newValue: T): void {
    // if the value is already selected, do nothing
    if (compareWith && compareWith()(value(), newValue)) {
      return;
    }

    // Update internal value
    value.set(newValue);

    // Emit value change if callback provided
    onValueChange?.(newValue);
  }

  return {
    id,
    value,
    disabled,
    orientation,
    compareWith,
    select,
    rovingFocus,
  };
}

/**
 * The injection token for the RadioGroup pattern.
 */
export const NgpRadioGroupPatternToken = new InjectionToken<NgpRadioGroupState<unknown>>(
  'NgpRadioGroupPatternToken',
);

/**
 * Injects the RadioGroup pattern.
 */
export function injectRadioGroupPattern<T = unknown>(): NgpRadioGroupState<T> {
  return inject(NgpRadioGroupPatternToken) as NgpRadioGroupState<T>;
}

/**
 * Provides the RadioGroup pattern.
 */
export function provideRadioGroupPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpRadioGroupState<unknown>,
): FactoryProvider[] {
  return [
    { provide: NgpRadioGroupPatternToken, useFactory: () => fn(inject(type)) },
    provideRovingFocusGroupPattern(type, (instance: T) => fn(instance).rovingFocus),
  ];
}

/**
 * @deprecated use `injectRadioGroupPattern` instead.
 */
export const injectRadioGroupState = createStateInjectFn(injectRadioGroupPattern, pattern => {
  const value = linkedSignal<any>(pattern.value);
  value.set = pattern.select;
  return { ...pattern, value, valueChange: toObservable(value) };
});
