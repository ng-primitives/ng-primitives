import { ElementRef, FactoryProvider, inject, InjectionToken, Signal, Type } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import {
  ngpRovingFocusGroupPattern,
  NgpRovingFocusGroupState,
  provideRovingFocusGroupPattern,
} from 'ng-primitives/roving-focus';
import { attrBinding, dataBinding } from 'ng-primitives/state';

export interface NgpToolbarState {
  orientation: Signal<NgpOrientation>;
  rovingFocus: NgpRovingFocusGroupState;
}

export interface NgpToolbarProps {
  orientation: Signal<NgpOrientation>;
  element?: ElementRef<HTMLElement>;
}

export function ngpToolbarPattern({
  orientation,
  element = injectElementRef(),
}: NgpToolbarProps): NgpToolbarState {
  const rovingFocus = ngpRovingFocusGroupPattern({
    orientation,
    element,
  });

  // Setup host attribute bindings
  attrBinding(element, 'role', () => 'toolbar');
  attrBinding(element, 'aria-orientation', () => orientation());
  dataBinding(element, 'data-orientation', orientation);

  return {
    orientation,
    rovingFocus,
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
    provideRovingFocusGroupPattern(type, instance => fn(instance).rovingFocus),
  ];
}
