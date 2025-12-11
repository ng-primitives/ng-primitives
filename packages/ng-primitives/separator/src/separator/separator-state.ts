import { Signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive } from 'ng-primitives/state';

export interface NgpSeparatorState {}

export interface NgpSeparatorProps {
  /**
   * The orientation of the separator.
   */
  readonly orientation: Signal<NgpOrientation>;
}

export const [NgpSeparatorStateToken, ngpSeparator, injectSeparatorState, provideSeparatorState] =
  createPrimitive('NgpSeparator', ({ orientation }: NgpSeparatorProps) => {
    const element = injectElementRef();

    // Host bindings
    attrBinding(element, 'role', 'separator');
    attrBinding(element, 'aria-orientation', orientation);
    attrBinding(element, 'data-orientation', orientation);

    return {};
  });
