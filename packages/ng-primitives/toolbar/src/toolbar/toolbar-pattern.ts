import {
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  linkedSignal,
  Signal,
  Type,
} from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import {
  ngpRovingFocusGroupPattern,
  NgpRovingFocusGroupState,
  provideRovingFocusGroupPattern,
} from 'ng-primitives/roving-focus';
import { attrBinding, controlled, createStateInjectFn, dataBinding } from 'ng-primitives/state';

export interface NgpToolbarState {
  orientation: Signal<NgpOrientation>;
  _rovingFocus: NgpRovingFocusGroupState;
  setOrientation(value: NgpOrientation): void;
}

export interface NgpToolbarProps {
  orientation: Signal<NgpOrientation>;
  element?: ElementRef<HTMLElement>;
}

export function ngpToolbarPattern({
  orientation: _orientation,
  element = injectElementRef(),
}: NgpToolbarProps): NgpToolbarState {
  const orientation = controlled(_orientation);
  const rovingFocus = ngpRovingFocusGroupPattern({
    orientation,
    element,
  });

  // Setup host attribute bindings
  attrBinding(element, 'role', () => 'toolbar');
  attrBinding(element, 'aria-orientation', () => orientation());
  dataBinding(element, 'data-orientation', orientation);

  function setOrientation(value: NgpOrientation) {
    orientation.set(value);
  }

  return {
    orientation,
    _rovingFocus: rovingFocus,
    setOrientation,
  };
}

export const NgpToolbarPatternToken = new InjectionToken<NgpToolbarState>('NgpToolbarPatternToken');

export function injectToolbarPattern(): NgpToolbarState {
  return inject(NgpToolbarPatternToken);
}

export function provideToolbarPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpToolbarState,
): FactoryProvider[] {
  return [
    { provide: NgpToolbarPatternToken, useFactory: () => fn(inject(type)) },
    provideRovingFocusGroupPattern(type, instance => fn(instance)._rovingFocus),
  ];
}

/**
 * @deprecated Use `injectToolbarPattern` instead.
 */
export const injectToolbarState = createStateInjectFn(injectToolbarPattern, pattern => {
  const orientation = linkedSignal(pattern.orientation);
  orientation.set = pattern.setOrientation;
  return { ...pattern, orientation };
});
