import { Directive } from '@angular/core';
import {
  ngpAvatarPattern,
  provideAvatarPattern,
} from './avatar-pattern';

/**
 * Apply the `ngpAvatar` directive to an element that represents the avatar. This directive is a container for the image and/or fallback.
 */
@Directive({
  selector: '[ngpAvatar]',
  exportAs: 'ngpAvatar',
  providers: [provideAvatarPattern(NgpAvatar, m => m.state)],
})
export class NgpAvatar {
  /**
   * The avatar state.
   */
  readonly state = ngpAvatarPattern();
}
