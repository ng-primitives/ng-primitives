import { ElementRef, FactoryProvider, inject, InjectionToken, Type } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding } from 'ng-primitives/state';
import { injectSwitchPattern } from '../switch/switch-pattern';

/**
 * The state interface for the SwitchThumb pattern.
 */
export interface NgpSwitchThumbState {
  // Define state properties and methods
}

/**
 * The props interface for the SwitchThumb pattern.
 */
export interface NgpSwitchThumbProps {
  /**
   * The element reference for the switch-thumb.
   */
  element?: ElementRef<HTMLElement>;
}

/**
 * The SwitchThumb pattern function.
 */
export function ngpSwitchThumbPattern({
  element = injectElementRef(),
}: NgpSwitchThumbProps = {}): NgpSwitchThumbState {
  // Dependency injection
  const state = injectSwitchPattern();

  // Interactions
  ngpInteractions({
    hover: true,
    focusVisible: true,
    press: true,
    disabled: state.disabled,
    element,
  });

  // Host bindings
  dataBinding(element, 'data-checked', state.checked);
  dataBinding(element, 'data-disabled', state.disabled);

  return {
    // Return state object
  };
}

/**
 * The injection token for the SwitchThumb pattern.
 */
export const NgpSwitchThumbPatternToken = new InjectionToken<NgpSwitchThumbState>(
  'NgpSwitchThumbPatternToken',
);

/**
 * Injects the SwitchThumb pattern.
 */
export function injectSwitchThumbPattern(): NgpSwitchThumbState {
  return inject(NgpSwitchThumbPatternToken);
}

/**
 * Provides the SwitchThumb pattern.
 */
export function provideSwitchThumbPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpSwitchThumbState,
): FactoryProvider {
  return { provide: NgpSwitchThumbPatternToken, useFactory: () => fn(inject(type)) };
}
