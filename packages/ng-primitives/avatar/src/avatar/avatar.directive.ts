/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directive, signal } from '@angular/core';
import { NgpAvatarToken } from './avatar.token';

@Directive({
  selector: '[ngpAvatar]',
  standalone: true,
  providers: [{ provide: NgpAvatarToken, useExisting: NgpAvatarDirective }],
})
export class NgpAvatarDirective {
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
  Idle,
  Loading,
  Loaded,
  Error,
}
