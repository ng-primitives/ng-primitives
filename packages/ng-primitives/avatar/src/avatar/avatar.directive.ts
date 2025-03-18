/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, signal } from '@angular/core';
import { NgpFocusVisible, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { NgpAvatarToken } from './avatar.token';

@Directive({
  selector: '[ngpAvatar]',
  providers: [{ provide: NgpAvatarToken, useExisting: NgpAvatar }],
  host: {
    '[attr.data-state]': 'state()',
  },
  hostDirectives: [NgpHover, NgpFocusVisible, NgpPress],
})
export class NgpAvatar {
  /**
   * Store the current state of the avatar.
   * @internal
   */
  readonly state = signal(NgpAvatarState.Idle);

  /**
   * Set the avatar state.
   * @param state The state to set.
   * @internal
   */
  setState(state: NgpAvatarState): void {
    this.state.set(state);
  }
}

export enum NgpAvatarState {
  Idle = 'idle',
  Loading = 'loading',
  Loaded = 'loaded',
  Error = 'error',
}
