import { Directive } from '@angular/core';
import { ngpAvatarImage } from './avatar-image-state';

/**
 * Apply the `ngpAvatarImage` directive to an element that represents the avatar image. This would typically be an `img` element or a `div` with a background image.
 */
@Directive({
  selector: 'img[ngpAvatarImage]',
  exportAs: 'ngpAvatarImage',
})
export class NgpAvatarImage {
  constructor() {
    ngpAvatarImage({});
  }
}
