import { Directive } from '@angular/core';
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
  state: NgpAvatarState = NgpAvatarState.Idle;

  /**
   * Set the avatar state.
   * @param state The state to set.
   * @internal
   */
  setState(state: NgpAvatarState): void {
    this.state = state;
  }
}

export enum NgpAvatarState {
  Idle,
  Loading,
  Loaded,
  Error,
}
