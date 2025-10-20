import {
  computed,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  Signal,
  Type,
} from '@angular/core';
import { setupInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding } from 'ng-primitives/state';
import { injectRadioGroupPattern } from '../radio-group/radio-group-pattern';
import { injectRadioItemPattern } from '../radio-item/radio-item-pattern';

/**
 * The state interface for the RadioIndicator pattern.
 */
export interface NgpRadioIndicatorState {
  /**
   * Whether the radio indicator is checked.
   */
  readonly checked: Signal<boolean>;
}

/**
 * The props interface for the RadioIndicator pattern.
 */
export interface NgpRadioIndicatorProps {
  /**
   * The element reference for the radio-group.
   */
  element?: ElementRef<HTMLElement>;
}

/**
 * The RadioIndicator pattern function.
 */
export function ngpRadioIndicatorPattern<T>({
  element = injectElementRef<HTMLElement>(),
}: NgpRadioIndicatorProps = {}): NgpRadioIndicatorState {
  const radioGroup = injectRadioGroupPattern<T>();
  const radioItem = injectRadioItemPattern<T>();

  // Determine if the radio indicator is checked.
  const checked = computed(() => radioGroup.value() === radioItem.value());

  // Host bindings
  dataBinding(element, 'data-checked', checked);
  dataBinding(element, 'data-disabled', radioItem.disabled);

  // Setup interactions
  setupInteractions({
    element: element,
    disabled: radioItem.disabled,
    press: true,
    hover: true,
  });

  return { checked };
}

/**
 * The injection token for the RadioIndicator pattern.
 */
export const NgpRadioIndicatorPatternToken = new InjectionToken<NgpRadioIndicatorState>(
  'NgpRadioIndicatorPatternToken',
);

/**
 * Injects the RadioIndicator pattern.
 */
export function injectRadioIndicatorPattern(): NgpRadioIndicatorState {
  return inject(NgpRadioIndicatorPatternToken);
}

/**
 * Provides the RadioIndicator pattern.
 */
export function provideRadioIndicatorPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpRadioIndicatorState,
): FactoryProvider {
  return { provide: NgpRadioIndicatorPatternToken, useFactory: () => fn(inject(type)) };
}
