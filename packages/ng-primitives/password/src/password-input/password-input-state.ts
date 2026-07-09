import { Signal, signal } from '@angular/core';
import { ngpInput, NgpInputState } from 'ng-primitives/input';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener, onMount } from 'ng-primitives/state';
import { injectPasswordState } from '../password/password-state';

/**
 * The state for the PasswordInput pattern, extending the Input state.
 */
export type NgpPasswordInputState = NgpInputState;

/**
 * The props interface for the PasswordInput pattern.
 */
export interface NgpPasswordInputProps {
  /**
   * The id of the input.
   */
  readonly id?: Signal<string>;
  /**
   * Whether the input is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Whether to opt the input out of password manager injection.
   */
  readonly ignorePasswordManagers?: Signal<boolean>;
}

export const [
  NgpPasswordInputStateToken,
  ngpPasswordInput,
  injectPasswordInputState,
  providePasswordInputState,
] = createPrimitive(
  'NgpPasswordInput',
  ({
    id,
    disabled,
    ignorePasswordManagers = signal(false),
  }: NgpPasswordInputProps): NgpPasswordInputState => {
    const element = injectElementRef<HTMLInputElement>();
    const password = injectPasswordState();

    // Compose ngpInput for form control, interactions, autofill and the id.
    const input = ngpInput({ id, disabled });

    // Mask synchronously so the field is never briefly plaintext before the binding runs.
    element.nativeElement.type = password().visible() ? 'text' : 'password';

    // Register with the container for aria-controls.
    password().registerInput(element.nativeElement, input.id);

    attrBinding(element, 'type', () => (password().visible() ? 'text' : 'password'));
    dataBinding(element, 'data-visible', () => password().visible());

    // Opt out of password manager injection when requested.
    attrBinding(element, 'data-1p-ignore', () => (ignorePasswordManagers() ? '' : null));
    attrBinding(element, 'data-lpignore', () => (ignorePasswordManagers() ? 'true' : null));
    attrBinding(element, 'data-bwignore', () => (ignorePasswordManagers() ? '' : null));

    // Reset to hidden on submit so browsers don't cache a plaintext field.
    onMount(() => {
      const form = element.nativeElement.form;
      if (form) {
        listener(form, 'submit', () => password().setVisible(false));
      }
    });

    return input;
  },
);
