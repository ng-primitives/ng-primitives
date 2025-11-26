import { Directive } from '@angular/core';
import { ngpAvatar, NgpAvatarStatus, provideAvatarState } from './avatar-state';

/**
 * Apply the `ngpAvatar` directive to an element that represents the avatar. This directive is a container for the image and/or fallback.
 */
@Directive({
  selector: '[ngpAvatar]',
  exportAs: 'ngpAvatar',
  providers: [provideAvatarState()],
})
export class NgpAvatar {
  /**
   * The avatar state.
   */
  private readonly state = ngpAvatar({});

  /**
   * Set the avatar status.
   * @param status The status to set.
   * @internal
   */
  setStatus(status: NgpAvatarStatus): void {
    this.state.setStatus(status);
  }
}
