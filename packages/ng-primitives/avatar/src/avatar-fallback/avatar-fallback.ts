import { NumberInput } from '@angular/cdk/coercion';
import { Directive, input, numberAttribute } from '@angular/core';
import { injectAvatarConfig } from '../config/avatar-config';
import { ngpAvatarFallback } from './avatar-fallback-state';

/**
 * Apply the `ngpAvatarFallback` directive to an element that represents the user in the absence of an image. This is typically the user's initials.
 */
@Directive({
  selector: '[ngpAvatarFallback]',
  exportAs: 'ngpAvatarFallback',
})
export class NgpAvatarFallback {
  /**
   * Access the global configuration.
   */
  private readonly config = injectAvatarConfig();

  /**
   * Define a delay before the fallback is shown. This is useful to only show the fallback for those with slower connections.
   * @default 0
   */
  readonly delay = input<number, NumberInput>(this.config.delay, {
    alias: 'ngpAvatarFallbackDelay',
    transform: numberAttribute,
  });

  constructor() {
    ngpAvatarFallback({ delay: this.delay });
  }
}
