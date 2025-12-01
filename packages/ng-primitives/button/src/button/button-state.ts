import { Signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding } from 'ng-primitives/state';

export interface NgpButtonState {
  disabled: Signal<boolean>;
}

export interface NgpButtonProps {
  disabled: Signal<boolean>;
}

export const [NgpButtonStateToken, ngpButton, injectButtonState, provideButtonState] =
  createPrimitive('NgpButton', ({ disabled }: NgpButtonProps): NgpButtonState => {
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
  });
