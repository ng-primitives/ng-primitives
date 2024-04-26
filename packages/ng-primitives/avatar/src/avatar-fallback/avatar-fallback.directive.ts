/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { NumberInput } from '@angular/cdk/coercion';
import {
  Directive,
  OnDestroy,
  OnInit,
  computed,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { NgpAvatarState } from '../avatar/avatar.directive';
import { injectAvatar } from '../avatar/avatar.token';
import { injectAvatarConfig } from '../config/avatar.config';

@Directive({
  selector: '[ngpAvatarFallback]',
  standalone: true,
  host: {
    '[style.display]': 'visible() ? null : "none"',
  },
})
export class NgpAvatarFallbackDirective implements OnInit, OnDestroy {
  /**
   * Access the avatar
   */
  private readonly avatar = injectAvatar();

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
   * Determine if this element should be hidden.
   * @returns True if the element should be visible
   */
  protected readonly visible = computed(
    () =>
      // we need to check if the element can render and if the avatar is not in a loaded state
      this.delayElapsed() && this.avatar.state() !== NgpAvatarState.Loaded,
  );

  /**
   * Determine the delay has elapsed, and we can show the fallback.
   */
  private delayElapsed = signal(false);

  /**
   * Store the timeout id.
   */
  private timeoutId: number | null = null;

  ngOnInit(): void {
    this.timeoutId = window.setTimeout(() => this.delayElapsed.set(true), this.delay());
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
  }
}
