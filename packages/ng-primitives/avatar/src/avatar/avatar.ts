import { Directive, signal } from '@angular/core';
import { NgpFocusVisible, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { avatarState, provideAvatarState } from './avatar-state';

@Directive({
  selector: '[ngpAvatar]',
  providers: [provideAvatarState()],
  host: {
    '[attr.data-status]': 'status()',
  },
  hostDirectives: [NgpHover, NgpFocusVisible, NgpPress],
})
export class NgpAvatar {
  /**
   * Store the current status of the avatar.
   * @internal
   */
  readonly status = signal(NgpAvatarStatus.Idle);

  /**
   * The avatar state.
   */
  protected readonly state = avatarState<NgpAvatar>(this);

  /**
   * Set the avatar status.
   * @param status The status to set.
   * @internal
   */
  setStatus(status: NgpAvatarStatus): void {
    this.status.set(status);
  }
}

export enum NgpAvatarStatus {
  Idle = 'idle',
  Loading = 'loading',
  Loaded = 'loaded',
  Error = 'error',
}
