import { signal, Signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, controlled, createPrimitive, dataBinding } from 'ng-primitives/state';

export interface NgpButtonState {
  /**
   * Whether the button is disabled.
   */
  readonly disabled: Signal<boolean>;

  /**
   * Set the disabled state of the button.
   * @param value The disabled state.
   */
  setDisabled(value: boolean): void;
}

export interface NgpButtonProps {
  /**
   * Whether the button is disabled.
   */
  readonly disabled?: Signal<boolean>;
}

export const [NgpButtonStateToken, ngpButton, injectButtonState, provideButtonState] =
  createPrimitive(
    'NgpButton',
    ({ disabled: _disabled = signal(false) }: NgpButtonProps): NgpButtonState => {
      const element = injectElementRef();
      const isButton = element.nativeElement.tagName.toLowerCase() === 'button';
      const disabled = controlled(_disabled);

      // Setup interactions (hover, press, focus-visible)
      ngpInteractions({ hover: true, press: true, focusVisible: true, disabled });

      // Setup host attribute bindings
      dataBinding(element, 'data-disabled', disabled);

      // Add the disabled attribute if it's a button element
      if (isButton) {
        attrBinding(element, 'disabled', () => (disabled() ? '' : null));
      }

      function setDisabled(value: boolean): void {
        disabled.set(value);
      }

      return {
        disabled: disabled.asReadonly(),
        setDisabled,
      };
    },
  );
