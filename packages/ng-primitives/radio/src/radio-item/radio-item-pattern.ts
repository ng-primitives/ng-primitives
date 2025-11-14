import {
  computed,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { setupInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { ngpRovingFocusItemPattern } from 'ng-primitives/roving-focus';
import { attrBinding, dataBinding, listener } from 'ng-primitives/state';
import { injectRadioGroupPattern } from '../radio-group/radio-group-pattern';

/**
 * The state interface for the RadioItem pattern.
 */
export interface NgpRadioItemState<T = unknown> {
  /**
   * The value of the radio item.
   */
  readonly value: Signal<T | undefined>;

  /**
   * Whether the radio item is disabled.
   */
  readonly disabled: Signal<boolean>;

  /**
   * Whether the radio item is checked.
   */
  readonly checked: Signal<boolean>;
}

/**
 * The props interface for the RadioItem pattern.
 */
export interface NgpRadioItemProps<T = unknown> {
  /**
   * The element reference for the radio-item.
   */
  element?: ElementRef<HTMLElement>;

  /**
   * The value of the radio item.
   */
  value: Signal<T>;

  /**
   * Whether the radio item is disabled.
   */
  disabled?: Signal<boolean>;
}

/**
 * The RadioItem pattern function.
 */
export function ngpRadioItemPattern<T = unknown>({
  value,
  element = injectElementRef(),
  disabled = signal(false),
}: NgpRadioItemProps<T>): NgpRadioItemState<T> {
  const radioGroup = injectRadioGroupPattern<T>();

  // Compute checked state based on radio group state
  const checked = computed(() => radioGroup.compareWith()(radioGroup.value(), value()));

  // Setup host bindings
  attrBinding(element, 'role', 'radio');
  attrBinding(element, 'aria-checked', checked);
  dataBinding(element, 'data-disabled', disabled);

  // Setup checked data binding
  dataBinding(element, 'data-checked', checked);

  // Setup interactions
  setupInteractions({ focus: true, focusVisible: true, hover: true, press: true });

  // Setup roving focus
  ngpRovingFocusItemPattern({ element, disabled });

  // Setup event listener for selection
  listener(element, 'click', () => {
    if (!disabled()) {
      radioGroup.select(value()!);
    }
  });

  listener(element, 'focus', () => {
    if (!disabled()) {
      radioGroup.select(value()!);
    }
  });

  return {
    value: value!,
    disabled: disabled!,
    checked,
  };
}

/**
 * The injection token for the RadioItem pattern.
 */
export const NgpRadioItemPatternToken = new InjectionToken<NgpRadioItemState<unknown>>(
  'NgpRadioItemPatternToken',
);

/**
 * Injects the RadioItem pattern.
 */
export function injectRadioItemPattern<T = unknown>(): NgpRadioItemState<T> {
  return inject(NgpRadioItemPatternToken) as NgpRadioItemState<T>;
}

/**
 * Provides the RadioItem pattern.
 */
export function provideRadioItemPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpRadioItemState<unknown>,
): FactoryProvider {
  return { provide: NgpRadioItemPatternToken, useFactory: () => fn(inject(type)) };
}
