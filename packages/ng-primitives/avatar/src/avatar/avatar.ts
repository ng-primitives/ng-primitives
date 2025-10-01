import { Directive, signal } from '@angular/core';
import { avatarState, provideAvatarState } from './avatar-state';

/**
 * Apply the `ngpAvatar` directive to an element that represents the avatar. This directive is a container for the image and/or fallback.
 */
@Directive({
  selector: '[ngpAvatar]',
  exportAs: 'ngpAvatar',
  providers: [provideAvatarState()],
  host: {
    '[attr.data-status]': 'status()',
  },
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
