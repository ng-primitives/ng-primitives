import {
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding } from 'ng-primitives/state';

/**
 * The state interface for the Separator pattern.
 */
export interface NgpSeparatorState {
  // Define state properties and methods
}

/**
 * The props interface for the Separator pattern.
 */
export interface NgpSeparatorProps {
  /**
   * The element reference for the separator.
   */
  element?: ElementRef<HTMLElement>;
  /**
   * Orientation signal input.
   */
  readonly orientation?: Signal<NgpOrientation>;
}

/**
 * The Separator pattern function.
 */
export function ngpSeparatorPattern({
  element = injectElementRef(),
  orientation = signal('horizontal'),
}: NgpSeparatorProps = {}): NgpSeparatorState {
  // Host bindings
  attrBinding(element, 'role', 'separator');
  attrBinding(element, 'aria-orientation', orientation);
  dataBinding(element, 'data-orientation', orientation);

  return {};
}

/**
 * The injection token for the Separator pattern.
 */
export const NgpSeparatorPatternToken = new InjectionToken<NgpSeparatorState>(
  'NgpSeparatorPatternToken',
);

/**
 * Injects the Separator pattern.
 */
export function injectSeparatorPattern(): NgpSeparatorState {
  return inject(NgpSeparatorPatternToken);
}

/**
 * Provides the Separator pattern.
 */
export function provideSeparatorPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpSeparatorState,
): FactoryProvider {
  return { provide: NgpSeparatorPatternToken, useFactory: () => fn(inject(type)) };
}
