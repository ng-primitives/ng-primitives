import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectPasswordConfig } from '../config/password-config';
import { ngpPasswordInput, providePasswordInputState } from './password-input-state';

/**
 * Apply the `ngpPasswordInput` directive to an `input` element within an `ngpPassword` container.
 * It is a complete input (form control, interactions, autofill) with password visibility toggling
 * layered on top, so it does not need to be combined with `ngpInput`.
 */
@Directive({
  selector: 'input[ngpPasswordInput]',
  exportAs: 'ngpPasswordInput',
  providers: [providePasswordInputState()],
})
export class NgpPasswordInput {
  /**
   * Access the global password configuration.
   */
  private readonly config = injectPasswordConfig();

  /**
   * The id of the input.
   */
  readonly id = input<string>(uniqueId('ngp-password-input'));

  /**
   * Whether the input is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * Whether to opt the input out of password manager injection
   * (1Password, LastPass, Bitwarden, etc.).
   */
  readonly ignorePasswordManagers = input<boolean, BooleanInput>(
    this.config.ignorePasswordManagers,
    {
      alias: 'ngpPasswordInputIgnorePasswordManagers',
      transform: booleanAttribute,
    },
  );

  /**
   * The state for the password input primitive.
   */
  protected readonly state = ngpPasswordInput({
    id: this.id,
    disabled: this.disabled,
    ignorePasswordManagers: this.ignorePasswordManagers,
  });
}
