import { NumberInput } from '@angular/cdk/coercion';
import { Directive, input, numberAttribute, OnInit } from '@angular/core';
import { injectAvatarConfig } from '../config/avatar-config';
import { ngpAvatarFallbackPattern, provideAvatarFallbackPattern } from './avatar-fallback-pattern';

/**
 * Apply the `ngpAvatarFallback` directive to an element that represents the user in the absence of an image. This is typically the user's initials.
 */
@Directive({
  selector: '[ngpAvatarFallback]',
  exportAs: 'ngpAvatarFallback',
  providers: [provideAvatarFallbackPattern(NgpAvatarFallback, m => m.state)],
  host: {
    '[style.display]': 'visible() ? null : "none"',
  },
})
export class NgpAvatarFallback implements OnInit {
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

  /**
   * The avatar fallback state.
   */
  readonly state = ngpAvatarFallbackPattern();

  /**
   * Determine if this element should be hidden.
   * @returns True if the element should be visible
   */
  get visible() {
    return this.state.visible;
  }

  ngOnInit(): void {
    this.state.startDelayTimer(this.delay());
  }
}
