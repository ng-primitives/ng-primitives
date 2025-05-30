import { NumberInput } from '@angular/cdk/coercion';
import { computed, Directive, input, numberAttribute, OnInit, signal } from '@angular/core';
import { injectDisposables } from 'ng-primitives/utils';
import { NgpAvatarStatus } from '../avatar/avatar';
import { injectAvatarState } from '../avatar/avatar-state';
import { injectAvatarConfig } from '../config/avatar-config';

/**
 * Apply the `ngpAvatarFallback` directive to an element that represents the user in the absence of an image. This is typically the user's initials.
 */
@Directive({
  selector: '[ngpAvatarFallback]',
  exportAs: 'ngpAvatarFallback',
  host: {
    '[style.display]': 'visible() ? null : "none"',
  },
})
export class NgpAvatarFallback implements OnInit {
  /**
   * Access the avatar
   */
  private readonly avatar = injectAvatarState();

  /**
   * Access the global configuration.
   */
  private readonly config = injectAvatarConfig();

  /**
   * Access the disposable utilities.
   */
  private readonly disposables = injectDisposables();

  /**
   * Define a delay before the fallback is shown. This is useful to only show the fallback for those with slower connections.
   * @default 0
   */
  readonly delay = input<number, NumberInput>(this.config.delay, {
    alias: 'ngpAvatarFallbackDelay',
    transform: numberAttribute,
  });

  /**
   * Determine if this element should be hidden.
   * @returns True if the element should be visible
   */
  protected readonly visible = computed(
    () =>
      // we need to check if the element can render and if the avatar is not in a loaded state
      this.delayElapsed() && this.avatar().status() !== NgpAvatarStatus.Loaded,
  );

  /**
   * Determine the delay has elapsed, and we can show the fallback.
   */
  private delayElapsed = signal(false);

  ngOnInit(): void {
    this.disposables.setTimeout(() => this.delayElapsed.set(true), this.delay());
  }
}
