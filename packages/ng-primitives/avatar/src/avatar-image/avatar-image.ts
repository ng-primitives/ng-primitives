import { Directive, OnInit } from '@angular/core';
import { NgpVisuallyHidden } from 'ng-primitives/a11y';
import { ngpAvatarImagePattern, provideAvatarImagePattern } from './avatar-image-pattern';

/**
 * Apply the `ngpAvatarImage` directive to an element that represents the avatar image. This would typically be an `img` element or a `div` with a background image.
 */
@Directive({
  selector: 'img[ngpAvatarImage]',
  exportAs: 'ngpAvatarImage',
  hostDirectives: [NgpVisuallyHidden],
  providers: [provideAvatarImagePattern(NgpAvatarImage, m => m.state)],
})
export class NgpAvatarImage implements OnInit {
  /**
   * The avatar image state.
   */
  readonly state = ngpAvatarImagePattern();

  ngOnInit(): void {
    this.state.checkImageStatus();
  }
}
