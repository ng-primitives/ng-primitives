import { Signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  createStateInjector,
  createStateProvider,
  createStateToken,
  dataBinding,
} from 'ng-primitives/state';
import type { NgpButton } from './button';

/**
 * The state token  for the Button primitive.
 */
export const NgpButtonStateToken = createStateToken<NgpButton>('Button');

/**
 * Provides the Button state.
 */
export const provideButtonState = createStateProvider(NgpButtonStateToken);

/**
 * Injects the Button state.
 */
export const injectButtonState = createStateInjector<NgpButton>(NgpButtonStateToken);

export interface NgpButtonState {
  disabled: Signal<boolean>;
}

export interface NgpButtonProps {
  disabled: Signal<boolean>;
}

export const ngpButton = createPrimitive<NgpButtonProps, NgpButtonState>(
  NgpButtonStateToken,
  ({ disabled }) => {
    const element = injectElementRef();
    const isButton = element.nativeElement.tagName.toLowerCase() === 'button';

    // Setup interactions (hover, press, focus-visible)
    ngpInteractions({ hover: true, press: true, focusVisible: true, disabled });

    // Setup host attribute bindings
    dataBinding(element, 'data-disabled', disabled);

    // Add the disabled attribute if it's a button element
    if (isButton) {
      attrBinding(element, 'disabled', () => (disabled() ? '' : null));
    }

    return { disabled };
  },
);
