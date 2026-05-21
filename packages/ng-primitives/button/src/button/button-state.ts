import { computed, HOST_TAG_NAME, inject, signal, Signal } from '@angular/core';
import { ngpFocusVisible, ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, controlled, createPrimitive, dataBinding } from 'ng-primitives/state';

export interface NgpButtonState {
  /** Disabled state. `'soft'` means aria-disabled but still focusable. */
  readonly disabled: Signal<boolean | 'soft'>;

  /** Set the disabled state. `'soft'` keeps the button focusable. */
  setDisabled(value: boolean | 'soft'): void;
}

export interface NgpButtonProps {
  /** Disabled state. `'soft'` means aria-disabled but still focusable. */
  readonly disabled?: Signal<boolean | 'soft'>;
}

export const [NgpButtonStateToken, ngpButton, injectButtonState, provideButtonState] =
  createPrimitive(
    'NgpButton',
    ({ disabled: _disabled = signal(false) }: NgpButtonProps): NgpButtonState => {
      const element = injectElementRef();
      const isButton = inject(HOST_TAG_NAME) === 'button';
      const disabled = controlled(_disabled);

      const anyDisabled = computed(() => !!disabled());
      const softDisabled = computed(() => disabled() === 'soft');
      const hardDisabled = computed(() => disabled() === true);

      ngpInteractions({ hover: true, press: true, disabled: anyDisabled });

      // Soft-disabled stays focusable, so only suppress focus-visible when fully disabled.
      ngpFocusVisible({ disabled: hardDisabled });

      dataBinding(element, 'data-disabled', () => (softDisabled() ? 'soft' : hardDisabled()));

      if (isButton) {
        attrBinding(element, 'disabled', () => (hardDisabled() ? '' : null));
        attrBinding(element, 'aria-disabled', () => (softDisabled() ? 'true' : null));
      } else {
        attrBinding(element, 'aria-disabled', () => (anyDisabled() ? 'true' : null));
      }

      function setDisabled(value: boolean | 'soft'): void {
        disabled.set(value);
      }

      return {
        disabled: disabled.asReadonly(),
        setDisabled,
      } satisfies NgpButtonState;
    },
  );
